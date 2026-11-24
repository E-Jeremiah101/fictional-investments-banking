import mongoose from "mongoose";
import ATMCardRequest from "../models/ATMCardRequest.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import Transaction from "../models/Transaction.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";
import { createDemoATMCardDetails } from "../utils/demoATMCard.js";

// Get ATM card requests awaiting admin review.
export const getPendingATMCardRequests = async (req, res) => {
  try {
    const requests = await ATMCardRequest.find({
      status: "awaiting_admin_approval",
      paymentStatus: "awaiting_review",
      isTest: true,
    })
      .select("-paymentReceiptData")
      .populate("user", "firstName lastName email")
      .populate("withdrawalRequest", "amountCents currency method status")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      atmCardRequests: requests.map((request) => ({
        id: request._id,
        customer: request.user
          ? {
              id: request.user._id,
              firstName: request.user.firstName,
              lastName: request.user.lastName,
              email: request.user.email,
            }
          : null,
        brand: request.brand || "visa",
        level:
          request.level ||
          (request.cardType === "unlimited" ? "black" : "standard"),
        cardholderName: request.cardholderName || "",
        billingAddress: request.billingAddress || "",
        currency: request.currency || "USD",
        feeCurrency: request.feeCurrency || "USD",
        fee:
          request.feeCents != null
            ? request.feeCents / 100
            : (request.feeUsdCents || 0) / 100,
        dailyLimit:
          request.dailyLimit ??
          (request.dailyLimitUsdCents == null
            ? null
            : request.dailyLimitUsdCents / 100),
        withdrawal: request.withdrawalRequest
          ? {
              id: request.withdrawalRequest._id,
              amount: request.withdrawalRequest.amountCents / 100,
              currency: request.withdrawalRequest.currency,
              method: request.withdrawalRequest.method,
              status: request.withdrawalRequest.status,
            }
          : null,
        paymentReceiptFileName: request.paymentReceiptFileName,
        paymentReceiptContentType: request.paymentReceiptContentType,
        paymentReceiptSize: request.paymentReceiptSize,
        paymentStatus: request.paymentStatus,
        status: request.status,
        paymentSubmittedAt: request.paymentSubmittedAt,
        createdAt: request.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get pending ATM card requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending ATM card requests.",
    });
  }
};

export const getATMCardPaymentReceipt = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ATM card request ID.",
      });
    }

    const request = await ATMCardRequest.findOne({
      _id: req.params.id,
      isTest: true,
    }).select(
      "paymentReceiptData paymentReceiptContentType paymentReceiptFileName",
    );

    if (!request?.paymentReceiptData) {
      return res.status(404).json({
        success: false,
        message: "Payment receipt not found.",
      });
    }

    if (
      getPaymentReceiptMimeType(request.paymentReceiptData) !==
      request.paymentReceiptContentType
    ) {
      return res.status(500).json({
        success: false,
        message: "The stored payment receipt is invalid.",
      });
    }

    res.set("Content-Type", request.paymentReceiptContentType);
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "private, no-store");
    res.set(
      "Content-Disposition",
      `${request.paymentReceiptContentType === "application/pdf" ? "attachment" : "inline"}; filename="${sanitizeReceiptFileName(request.paymentReceiptFileName || "payment-receipt")}"`,
    );
    return res.send(request.paymentReceiptData);
  } catch (error) {
    console.error("Get ATM card payment receipt error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the payment receipt.",
    });
  }
};

// Approve or reject an ATM card request.
export const reviewATMCardRequest = async (req, res) => {
  const { id } = req.params;
  const { action, reviewNote } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ATM card request ID.",
    });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Choose either approve or reject.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      // Only requests awaiting admin review can be processed.
      const atmRequest = await ATMCardRequest.findOne({
        _id: id,
        status: "awaiting_admin_approval",
        paymentStatus: "awaiting_review",
        isTest: true,
      })
        .select("+demoCardNumber +demoCardExpiry +demoCardCcv")
        .session(session);

      if (!atmRequest) {
        throw new Error("ATM card request not found or already reviewed.");
      }

      const withdrawal = atmRequest.withdrawalRequest
        ? await WithdrawalRequest.findOne({
            _id: atmRequest.withdrawalRequest,
            user: atmRequest.user,
            atmCardRequest: atmRequest._id,
            status: "awaiting_atm",
            isTest: true,
          }).session(session)
        : null;

      if (atmRequest.withdrawalRequest && !withdrawal) {
        throw new Error(
          "The linked withdrawal request could not be found or is no longer eligible.",
        );
      }

      const reviewedAt = new Date();

      if (action === "approve") {
        atmRequest.status = "approved";
        atmRequest.paymentStatus = "approved";
        if (
          !atmRequest.demoCardNumber ||
          !atmRequest.demoCardExpiry ||
          !atmRequest.demoCardCcv
        ) {
          Object.assign(atmRequest, createDemoATMCardDetails());
        }
        atmRequest.reviewedBy = req.user._id;
        atmRequest.reviewedAt = reviewedAt;
        atmRequest.reviewNote = reviewNote?.trim() || "";

        await atmRequest.save({ session });

        if (withdrawal) {
          withdrawal.status = "ready_for_withdrawal";
          await withdrawal.save({ session });
        }

        result = {
          action: "approved",
          atmCardRequestId: atmRequest._id,
          withdrawalId: withdrawal?._id || null,
          withdrawalStatus: withdrawal?.status || null,
        };
      } else {
        atmRequest.status = "rejected";
        atmRequest.paymentStatus = "rejected";
        atmRequest.reviewedBy = req.user._id;
        atmRequest.reviewedAt = reviewedAt;
        atmRequest.reviewNote = reviewNote?.trim() || "";

        await atmRequest.save({ session });

        let transaction = null;
        if (withdrawal) {
          withdrawal.status = "rejected";
          withdrawal.reviewedBy = req.user._id;
          withdrawal.reviewedAt = reviewedAt;
          withdrawal.reviewNote =
            reviewNote?.trim() || "ATM card request rejected.";

          await withdrawal.save({ session });

          transaction = await Transaction.findOne({
            _id: withdrawal.transaction,
            user: withdrawal.user,
            account: withdrawal.account,
            type: "withdrawal",
            status: "pending",
            isTest: true,
          }).session(session);

          if (!transaction) {
            throw new Error(
              "The linked pending withdrawal transaction could not be found.",
            );
          }

          transaction.status = "failed";
          transaction.reviewedBy = req.user._id;
          transaction.reviewedAt = reviewedAt;
          transaction.rejectionReason =
            reviewNote?.trim() || "ATM card request rejected.";

          await transaction.save({ session });
        }

        result = {
          action: "rejected",
          atmCardRequestId: atmRequest._id,
          withdrawalId: withdrawal?._id || null,
          withdrawalStatus: withdrawal?.status || null,
          transactionStatus: transaction?.status || null,
        };
      }
    });

    return res.status(200).json({
      success: true,
      message:
        result.action === "approved"
          ? "The Virtual Card application has been approved."
          : result.withdrawalId
            ? "The Virtual Card application was rejected, and its linked withdrawal was also rejected."
            : "The Vitual Card application has been rejected.",
      result,
    });
  } catch (error) {
    console.error("Review Virtual Card request error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to review ATM card request.",
    });
  } finally {
    await session.endSession();
  }
};
