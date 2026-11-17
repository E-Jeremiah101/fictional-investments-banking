import crypto from "node:crypto";
import mongoose from "mongoose";

import RemittanceRequest from "../models/RemittanceRequest.js";
import TaxPin from "../models/TaxPin.js";
import ATMCardRequest from "../models/ATMCardRequest.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";

const hashPin = (pin, salt) => {
  return crypto.scryptSync(pin, salt, 64);
};

export const getMyTaxPinRequests = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find({
      user: req.user._id,
      status: { $in: ["ready_for_withdrawal", "awaiting_tax_pin"] },
      isTest: true,
    })
      .select("amountCents currency status createdAt")
      .sort({ createdAt: -1 });

    const taxPins = await TaxPin.find({
      user: req.user._id,
      withdrawalRequest: { $in: withdrawals.map((withdrawal) => withdrawal._id) },
      isTest: true,
    }).select("-paymentReceiptData -pinHash -pinSalt");
    const taxPinsByWithdrawal = new Map(
      taxPins.map((taxPin) => [String(taxPin.withdrawalRequest), taxPin]),
    );

    return res.status(200).json({
      success: true,
      withdrawals: withdrawals.map((withdrawal) => {
        const taxPin = taxPinsByWithdrawal.get(String(withdrawal._id));

        return {
          id: withdrawal._id,
          amountCents: withdrawal.amountCents,
          currency: withdrawal.currency,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
          taxPin: taxPin
            ? {
                id: taxPin._id,
                status: taxPin.status,
                paymentStatus: taxPin.paymentStatus,
                paymentFeeCents: taxPin.paymentFeeCents,
                paymentReceiptFileName: taxPin.paymentReceiptFileName,
                paymentReceiptContentType: taxPin.paymentReceiptContentType,
                paymentReceiptSize: taxPin.paymentReceiptSize,
                paymentSubmittedAt: taxPin.paymentSubmittedAt,
                paymentReviewNote: taxPin.paymentReviewNote,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Get customer Tax PIN requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your Tax PIN requests.",
    });
  }
};

export const submitTaxPinPaymentEvidence = async (req, res) => {
  const { withdrawalId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
    return res.status(400).json({
      success: false,
      message: "A valid withdrawal ID is required.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Upload a demonstration receipt image or PDF.",
    });
  }

  const detectedMimeType = getPaymentReceiptMimeType(req.file.buffer);
  if (detectedMimeType !== req.file.mimetype) {
    return res.status(400).json({
      success: false,
      message: "The uploaded file is not a valid JPG, PNG, WEBP, or PDF.",
    });
  }

  try {
    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      user: req.user._id,
      status: "ready_for_withdrawal",
      isTest: true,
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message:
          "This withdrawal is not ready for a Tax PIN payment submission.",
      });
    }

    const atmCardRequest = await ATMCardRequest.findOne({
      _id: withdrawal.atmCardRequest,
      user: req.user._id,
      status: "approved",
      paymentStatus: "approved",
      isTest: true,
    });

    if (!atmCardRequest) {
      return res.status(400).json({
        success: false,
        message: "The linked Virtual Card must be approved first.",
      });
    }

    let taxPin = await TaxPin.findOne({
      withdrawalRequest: withdrawal._id,
      user: req.user._id,
      isTest: true,
    });

    if (
      taxPin &&
      (["generated", "verified", "locked"].includes(taxPin.status) ||
        ["awaiting_review", "approved"].includes(taxPin.paymentStatus))
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A Tax PIN payment submission already exists or this Tax PIN has already been generated.",
      });
    }

    if (!taxPin) {
      taxPin = new TaxPin({
        user: req.user._id,
        withdrawalRequest: withdrawal._id,
      });
    }

    taxPin.paymentReceiptData = req.file.buffer;
    taxPin.paymentReceiptContentType = detectedMimeType;
    taxPin.paymentReceiptFileName = sanitizeReceiptFileName(
      req.file.originalname,
    );
    taxPin.paymentReceiptSize = req.file.size;
    taxPin.paymentSubmittedAt = new Date();
    taxPin.paymentStatus = "awaiting_review";
    taxPin.paymentReviewedBy = null;
    taxPin.paymentReviewedAt = null;
    taxPin.paymentReviewNote = "";

    await taxPin.save();

    return res.status(200).json({
      success: true,
      message:
        "Your fictional Tax PIN payment evidence has been submitted for administrator review.",
      taxPin: {
        id: taxPin._id,
        withdrawalId: withdrawal._id,
        paymentStatus: taxPin.paymentStatus,
        paymentFeeCents: taxPin.paymentFeeCents,
        paymentReceiptFileName: taxPin.paymentReceiptFileName,
        paymentSubmittedAt: taxPin.paymentSubmittedAt,
      },
    });
  } catch (error) {
    console.error("Submit Tax PIN payment evidence error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit Tax PIN payment evidence.",
    });
  }
};

export const verifyTaxPin = async (req, res) => {
  const { withdrawalId, pin } = req.body;

  if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
    return res.status(400).json({
      success: false,
      message: "A valid withdrawal ID is required.",
    });
  }

  if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid six-digit PIN.",
    });
  }

  try {
    const withdrawal = await WithdrawalRequest.findOne({
      _id: withdrawalId,
      user: req.user._id,
      isTest: true,
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    if (withdrawal.status !== "awaiting_tax_pin") {
      return res.status(400).json({
        success: false,
        message:
          "This withdrawal is not currently awaiting Tax PIN verification.",
      });
    }

    const taxPinRecord = await TaxPin.findOne({
      withdrawalRequest: withdrawal._id,
      user: req.user._id,
      isTest: true,
    }).select("+pinHash +pinSalt");

    if (
      !taxPinRecord ||
      taxPinRecord.status !== "generated" ||
      taxPinRecord.paymentStatus !== "approved" ||
      !taxPinRecord.pinHash ||
      !taxPinRecord.pinSalt
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid Tax PIN has not been generated.",
      });
    }

    if (!taxPinRecord.expiresAt || taxPinRecord.expiresAt <= new Date()) {
      taxPinRecord.status = "expired";
      await taxPinRecord.save();

      return res.status(400).json({
        success: false,
        message: "Your Tax PIN has expired. Please contact support.",
      });
    }

    if (taxPinRecord.attempts >= taxPinRecord.maxAttempts) {
      taxPinRecord.status = "locked";
      await taxPinRecord.save();

      return res.status(423).json({
        success: false,
        message: "Tax PIN verification is locked.",
      });
    }

    const submittedHash = hashPin(pin, taxPinRecord.pinSalt);
    const storedHash = Buffer.from(taxPinRecord.pinHash, "hex");

    const isCorrect =
      submittedHash.length === storedHash.length &&
      crypto.timingSafeEqual(submittedHash, storedHash);

    if (!isCorrect) {
      taxPinRecord.attempts += 1;

      if (taxPinRecord.attempts >= taxPinRecord.maxAttempts) {
        taxPinRecord.status = "locked";
      }

      await taxPinRecord.save();

      return res.status(400).json({
        success: false,
        message:
          taxPinRecord.status === "locked"
            ? "Maximum PIN attempts exceeded."
            : `Incorrect PIN. ${
                taxPinRecord.maxAttempts - taxPinRecord.attempts
              } attempts remaining.`,
      });
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const currentWithdrawal = await WithdrawalRequest.findOne({
          _id: withdrawal._id,
          user: req.user._id,
          status: "awaiting_tax_pin",
          isTest: true,
        }).session(session);

        if (!currentWithdrawal) {
          const error = new Error(
            "This withdrawal is no longer awaiting Tax PIN verification.",
          );
          error.statusCode = 409;
          throw error;
        }

        const currentTaxPin = await TaxPin.findOne({
          _id: taxPinRecord._id,
          withdrawalRequest: currentWithdrawal._id,
          user: req.user._id,
          status: "generated",
          isTest: true,
        }).session(session);

        if (!currentTaxPin) {
          const error = new Error(
            "The Tax PIN is no longer available for verification.",
          );
          error.statusCode = 409;
          throw error;
        }

        const existingRemittance = await RemittanceRequest.findOne({
          withdrawalRequest: currentWithdrawal._id,
        }).session(session);

        if (existingRemittance) {
          const error = new Error(
            "A remittance request already exists for this withdrawal.",
          );
          error.statusCode = 409;
          throw error;
        }

        const remittanceFeeCents = Math.round(
          currentWithdrawal.amountCents * 0.3,
        );

        if (
          !Number.isSafeInteger(remittanceFeeCents) ||
          remittanceFeeCents < 1
        ) {
          const error = new Error(
            "Unable to calculate the simulated remittance fee.",
          );
          error.statusCode = 400;
          throw error;
        }

        currentTaxPin.status = "verified";
        currentTaxPin.verifiedAt = new Date();

        currentWithdrawal.status = "awaiting_remittance_payment";

        await RemittanceRequest.create(
          [
            {
              user: currentWithdrawal.user,
              withdrawalRequest: currentWithdrawal._id,
              feeCents: remittanceFeeCents,
              currency: "USD",
              status: "awaiting_payment",
              isTest: true,
            },
          ],
          { session },
        );

        await currentTaxPin.save({ session });
        await currentWithdrawal.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Tax PIN verified successfully.",
      withdrawal: {
        id: withdrawal._id,
        status: "awaiting_remittance_payment",
      },
    });
  } catch (error) {
    console.error("Verify Tax PIN error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to verify Tax PIN.",
    });
  }
};
