import mongoose from "mongoose";

import RemittanceRequest from "../models/RemittanceRequest.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import ATMCardRequest from "../models/ATMCardRequest.js";
import TaxPin from "../models/TaxPin.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";

// Get remittance requests awaiting admin review
export const getPendingRemittanceRequests = async (req, res) => {
  try {
    const requests = await RemittanceRequest.find({
      status: "awaiting_review",
      isTest: true,
    })
      .select("-paymentReceiptData")
      .populate("user", "firstName lastName email")
      .populate({
        path: "withdrawalRequest",
        select: "amountCents currency method status account",
      })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get pending remittances error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending remittance requests.",
    });
  }
};

export const getRemittancePaymentReceipt = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid remittance request ID.",
      });
    }

    const request = await RemittanceRequest.findOne({
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
    console.error("Get remittance payment receipt error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the payment receipt.",
    });
  }
};

// Approve or reject a simulated remittance request
export const reviewRemittanceRequest = async (req, res) => {
  const { decision, reviewNote = "" } = req.body;

  if (!["approve", "reject"].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Decision must be approve or reject.",
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
    let reviewedRequest;

    await session.withTransaction(async () => {
      const remittance = await RemittanceRequest.findOne({
        _id: req.params.id,
        status: "awaiting_review",
        isTest: true,
      }).session(session);

      if (!remittance) {
        const error = new Error("Pending remittance request not found.");
        error.statusCode = 404;
        throw error;
      }

      const withdrawal = await WithdrawalRequest.findOne({
        _id: remittance.withdrawalRequest,
        user: remittance.user,
        status: "awaiting_remittance_approval",
        isTest: true,
      }).session(session);

      if (!withdrawal) {
        const error = new Error(
          "The withdrawal is not awaiting remittance approval.",
        );
        error.statusCode = 400;
        throw error;
      }

      const taxPin = await TaxPin.findOne({
        withdrawalRequest: withdrawal._id,
        user: withdrawal.user,
        status: "verified",
        isTest: true,
      }).session(session);

      const atmRequest = await ATMCardRequest.findOne({
        withdrawalRequest: withdrawal._id,
        user: withdrawal.user,
        status: "approved",
        paymentStatus: "approved",
        isTest: true,
      }).session(session);

      if (!taxPin || !atmRequest) {
        const error = new Error(
          "Tax PIN verification or Virtual Card approval is missing.",
        );
        error.statusCode = 400;
        throw error;
      }

      const transaction = await Transaction.findOne({
        _id: withdrawal.transaction,
        user: withdrawal.user,
        account: withdrawal.account,
        type: "withdrawal",
        status: "pending",
        isTest: true,
      }).session(session);

      if (!transaction) {
        const error = new Error(
          "The pending withdrawal transaction was not found.",
        );
        error.statusCode = 400;
        throw error;
      }

      if (decision === "approve") {
        const account = await Account.findOne({
          _id: withdrawal.account,
          user: withdrawal.user,
          accountStatus: "active",
          isTest: true,
        }).session(session);

        if (!account) {
          const error = new Error(
            "The customer's account is unavailable.",
          );
          error.statusCode = 400;
          throw error;
        }

        if (account.balanceCents < withdrawal.amountCents) {
          const error = new Error("Insufficient account balance.");
          error.statusCode = 400;
          throw error;
        }

        // Deduct the simulated withdrawal amount only after
        // the admin approves the complete simulation workflow.
        account.balanceCents -= withdrawal.amountCents;
        await account.save({ session });

        withdrawal.status = "approved";
        transaction.status = "successful";
      } else {
        withdrawal.status = "rejected";
        transaction.status = "failed";
        transaction.rejectionReason =
          reviewNote.trim() || "Remittance  rejected.";
      }

      remittance.status = decision === "approve" ? "approved" : "rejected";

      remittance.reviewedBy = req.user._id;
      remittance.reviewedAt = new Date();
      remittance.reviewNote = reviewNote.trim();

      withdrawal.reviewedBy = req.user._id;
      withdrawal.reviewedAt = new Date();
      withdrawal.reviewNote = reviewNote.trim();

      transaction.reviewedBy = req.user._id;
      transaction.reviewedAt = new Date();

      await remittance.save({ session });
      await withdrawal.save({ session });
      await transaction.save({ session });

      reviewedRequest = remittance;
    });

    return res.status(200).json({
      success: true,
      message:
        decision === "approve"
          ? "Remittance approved. Withdrawal completed."
          : "Remittance rejected.",
      request: reviewedRequest,
    });
  } catch (error) {
    console.error("Review remittance error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to review remittance request.",
    });
  } finally {
    await session.endSession();
  }
};
