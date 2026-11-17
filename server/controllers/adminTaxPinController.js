import crypto from "node:crypto";
import mongoose from "mongoose";
import TaxPin from "../models/TaxPin.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import ATMCardRequest from "../models/ATMCardRequest.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";

const generatePin = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashPin = (pin, salt) => {
  return crypto.scryptSync(pin, salt, 64).toString("hex");
};

export const getWithdrawalsReadyForTaxPin = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({
      status: { $in: ["ready_for_withdrawal", "awaiting_tax_pin"] },
      isTest: true,
    })
      .populate("user", "firstName lastName email")
      .populate("atmCardRequest", "brand level cardType status paymentStatus")
      .sort({ createdAt: 1 });
    const taxPins = await TaxPin.find({
      withdrawalRequest: {
        $in: withdrawals.map((withdrawal) => withdrawal._id),
      },
      paymentStatus: { $in: ["awaiting_review", "approved"] },
      status: { $ne: "verified" },
      isTest: true,
    }).select("-paymentReceiptData -pinHash -pinSalt");
    const taxPinsByWithdrawal = new Map(
      taxPins.map((taxPin) => [String(taxPin.withdrawalRequest), taxPin]),
    );

    return res.status(200).json({
      success: true,
      withdrawals: withdrawals
        .filter(
          (withdrawal) =>
            withdrawal.atmCardRequest?.status === "approved" &&
            withdrawal.atmCardRequest?.paymentStatus === "approved" &&
            taxPinsByWithdrawal.has(String(withdrawal._id)),
        )
        .map((withdrawal) => {
          const taxPin = taxPinsByWithdrawal.get(String(withdrawal._id));

          return {
            id: withdrawal._id,
            amount: withdrawal.amountCents / 100,
            currency: withdrawal.currency,
            method: withdrawal.method,
            status: withdrawal.status,
            createdAt: withdrawal.createdAt,
            customer: withdrawal.user
              ? {
                  firstName: withdrawal.user.firstName,
                  lastName: withdrawal.user.lastName,
                  email: withdrawal.user.email,
                }
              : null,
            atmCard: withdrawal.atmCardRequest
              ? {
                  brand: withdrawal.atmCardRequest.brand || "visa",
                  level:
                    withdrawal.atmCardRequest.level ||
                    (withdrawal.atmCardRequest.cardType === "unlimited"
                      ? "black"
                      : "standard"),
                }
              : null,
            taxPin: {
              id: taxPin._id,
              status: taxPin.status,
              paymentStatus: taxPin.paymentStatus,
              paymentFeeCents: taxPin.paymentFeeCents,
              paymentReceiptFileName: taxPin.paymentReceiptFileName,
              paymentReceiptContentType: taxPin.paymentReceiptContentType,
              paymentReceiptSize: taxPin.paymentReceiptSize,
              paymentSubmittedAt: taxPin.paymentSubmittedAt,
              paymentReviewNote: taxPin.paymentReviewNote,
            },
          };
        }),
    });
  } catch (error) {
    console.error("Get withdrawals ready for Tax PIN error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve withdrawals awaiting Tax PIN generation.",
    });
  }
};

export const getTaxPinPaymentReceipt = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Tax PIN request ID.",
      });
    }

    const taxPin = await TaxPin.findOne({
      _id: req.params.id,
      isTest: true,
    }).select(
      "paymentReceiptData paymentReceiptContentType paymentReceiptFileName",
    );

    if (!taxPin?.paymentReceiptData) {
      return res.status(404).json({
        success: false,
        message: "Tax PIN payment receipt not found.",
      });
    }

    if (
      getPaymentReceiptMimeType(taxPin.paymentReceiptData) !==
      taxPin.paymentReceiptContentType
    ) {
      return res.status(500).json({
        success: false,
        message: "The stored Tax PIN payment receipt is invalid.",
      });
    }

    res.set("Content-Type", taxPin.paymentReceiptContentType);
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "private, no-store");
    res.set(
      "Content-Disposition",
      `${taxPin.paymentReceiptContentType === "application/pdf" ? "attachment" : "inline"}; filename="${sanitizeReceiptFileName(taxPin.paymentReceiptFileName || "tax-pin-receipt")}"`,
    );
    return res.send(taxPin.paymentReceiptData);
  } catch (error) {
    console.error("Get Tax PIN payment receipt error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the Tax PIN payment receipt.",
    });
  }
};

export const reviewTaxPinPayment = async (req, res) => {
  const { action, reviewNote = "" } = req.body;

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Tax PIN request ID.",
    });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Choose either approve or reject.",
    });
  }

  if (typeof reviewNote !== "string" || reviewNote.trim().length > 500) {
    return res.status(400).json({
      success: false,
      message: "Review note must be 500 characters or fewer.",
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const taxPin = await TaxPin.findOne({
        _id: req.params.id,
        paymentStatus: "awaiting_review",
        isTest: true,
      }).session(session);

      if (!taxPin) {
        throw new Error("Tax PIN payment submission not found or already reviewed.");
      }

      const withdrawal = await WithdrawalRequest.findOne({
        _id: taxPin.withdrawalRequest,
        user: taxPin.user,
        status: "ready_for_withdrawal",
        isTest: true,
      }).session(session);

      if (!withdrawal) {
        throw new Error("The linked withdrawal is no longer awaiting Tax PIN payment review.");
      }

      const atmRequest = await ATMCardRequest.findOne({
        _id: withdrawal.atmCardRequest,
        user: withdrawal.user,
        status: "approved",
        paymentStatus: "approved",
        isTest: true,
      }).session(session);

      if (!atmRequest) {
        throw new Error("The linked Virtual Card has not been approved.");
      }

      taxPin.paymentStatus = action === "approve" ? "approved" : "rejected";
      taxPin.paymentReviewedBy = req.user._id;
      taxPin.paymentReviewedAt = new Date();
      taxPin.paymentReviewNote = reviewNote.trim();
      await taxPin.save({ session });
    });

    return res.status(200).json({
      success: true,
      message:
        action === "approve"
          ? "Tax PIN payment evidence approved. The Tax PIN can now be generated."
          : "Tax PIN payment evidence rejected.",
    });
  } catch (error) {
    console.error("Review Tax PIN payment error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to review Tax PIN payment evidence.",
    });
  } finally {
    await session.endSession();
  }
};

export const generateTaxPin = async (req, res) => {
  try {
    const { withdrawalId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
      return res.status(400).json({
        success: false,
        message: "A valid withdrawal ID is required.",
      });
    }

    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      isTest: true,
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    if (
      !withdrawal.atmCardRequest ||
      !["ready_for_withdrawal", "awaiting_tax_pin"].includes(
        withdrawal.status,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The Virtual Card must be approved and the withdrawal must be awaiting Tax PIN generation.",
      });
    }

    const atmRequest = await ATMCardRequest.findOne({
      _id: withdrawal.atmCardRequest,
      user: withdrawal.user,
      status: "approved",
      paymentStatus: "approved",
      isTest: true,
    });

    if (!atmRequest) {
      return res.status(400).json({
        success: false,
        message: "The linked ATM card request has not been approved.",
      });
    }

    const taxPinRecord = await TaxPin.findOne({
      withdrawalRequest: withdrawal._id,
      user: withdrawal.user,
      isTest: true,
    });

    if (!taxPinRecord || taxPinRecord.paymentStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message:
          "The Tax PIN payment receipt must be approved before generating a PIN.",
      });
    }

    if (taxPinRecord && taxPinRecord.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "This withdrawal's tax PIN has already been verified.",
      });
    }

    const isRegeneration = taxPinRecord.status !== "pending";
    const pin = generatePin();
    const salt = crypto.randomBytes(16).toString("hex");
    const pinHash = hashPin(pin, salt);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    taxPinRecord.pinHash = pinHash;
    taxPinRecord.pinSalt = salt;
    taxPinRecord.status = "generated";
    taxPinRecord.attempts = 0;
    taxPinRecord.generatedBy = req.user._id;
    taxPinRecord.generatedAt = new Date();
    taxPinRecord.expiresAt = expiresAt;
    taxPinRecord.verifiedAt = null;

    await taxPinRecord.save();
    
    withdrawal.status = "awaiting_tax_pin";
    await withdrawal.save();

    return res.status(201).json({
      success: true,
      message: isRegeneration
        ? "Tax PIN regenerated successfully. The previous PIN is no longer valid."
        : "Tax PIN generated successfully.",
      taxPin: {
        withdrawalId: withdrawal._id,
        pin,
        expiresAt,
        status: taxPinRecord.status,
      },
    });
  } catch (error) {
    console.error("Generate tax PIN error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate tax PIN.",
    });
  }
};
