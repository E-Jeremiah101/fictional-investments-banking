import mongoose from "mongoose";
import RemittanceRequest from "../models/RemittanceRequest.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";

// Get the logged-in customer's remittance requests
export const getMyRemittanceRequests = async (req, res) => {
  try {
    const requests = await RemittanceRequest.find({
      user: req.user._id,
      isTest: true,
    })
      .select("-paymentReceiptData")
      .populate("withdrawalRequest", "amountCents currency method status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get remittance requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve remittance requests.",
    });
  }
};

// Submit fictional remittance payment evidence

export const submitRemittanceEvidence = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Upload a payment receipt image or PDF.",
    });
  }

  const detectedMimeType = getPaymentReceiptMimeType(req.file.buffer);
  if (detectedMimeType !== req.file.mimetype) {
    return res.status(400).json({
      success: false,
      message: "The uploaded file is not a valid JPG, PNG, WEBP, or PDF.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let submittedRequest;

    await session.withTransaction(async () => {
      const remittance = await RemittanceRequest.findOne({
        _id: req.params.id,
        user: req.user._id,
        status: "awaiting_payment",
        isTest: true,
      }).session(session);

      if (!remittance) {
        const error = new Error(
          "Remittance request not found or already submitted.",
        );
        error.statusCode = 404;
        throw error;
      }

      const withdrawal = await WithdrawalRequest.findOne({
        _id: remittance.withdrawalRequest,
        user: req.user._id,
        isTest: true,
        status: "awaiting_remittance_payment",
      }).session(session);

      if (!withdrawal) {
        const error = new Error(
          "The withdrawal is not at the remittance stage.",
        );
        error.statusCode = 400;
        throw error;
      }

      remittance.paymentReceiptData = req.file.buffer;
      remittance.paymentReceiptContentType = detectedMimeType;
      remittance.paymentReceiptFileName = sanitizeReceiptFileName(
        req.file.originalname,
      );
      remittance.paymentReceiptSize = req.file.size;
      remittance.paymentSubmittedAt = new Date();
      remittance.status = "awaiting_review";

      withdrawal.status = "awaiting_remittance_approval";

      await remittance.save({ session });
      await withdrawal.save({ session });

      submittedRequest = {
        id: remittance._id,
        status: remittance.status,
        paymentReceiptFileName: remittance.paymentReceiptFileName,
        paymentReceiptContentType: remittance.paymentReceiptContentType,
        paymentReceiptSize: remittance.paymentReceiptSize,
        paymentSubmittedAt: remittance.paymentSubmittedAt,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Simulation evidence submitted for admin review.",
      request: submittedRequest,
    });
  } catch (error) {
    console.error("Submit remittance evidence error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to submit remittance evidence.",
    });
  } finally {
    await session.endSession();
  }
};
