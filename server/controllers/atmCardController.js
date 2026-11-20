import mongoose from "mongoose";
import ATMCardRequest from "../models/ATMCardRequest.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";
import { createDemoATMCardDetails } from "../utils/demoATMCard.js";

const cardLevels = {
  standard: { feeCents: 500 },
  gold: { feeCents: 1500 },
  platinum: { feeCents: 2500 },
  black: { feeCents: 5000 },
};

const isValidDailyLimit = (value) =>
  Number.isInteger(value) && value >= 1000 && value <= 10000 && value % 100 === 0;

const toATMCardRequestResponse = (request, withdrawalRequest = null) => ({
  id: request._id,
  withdrawalId: withdrawalRequest?._id || request.withdrawalRequest || null,
  withdrawalStatus: withdrawalRequest?.status || null,
  brand: request.brand || "visa",
  level:
    request.level ||
    (request.cardType === "unlimited" ? "black" : "standard"),
  cardholderName: request.cardholderName || "",
  billingAddress: request.billingAddress || "",
  currency: request.currency || "USD",
  dailyLimit:
    request.dailyLimit ??
    (request.dailyLimitUsdCents == null
      ? null
      : request.dailyLimitUsdCents / 100),
  fee:
    request.feeCents != null
      ? request.feeCents / 100
      : (request.feeUsdCents || 0) / 100,
  feeCurrency: request.feeCurrency || "USD",
  paymentStatus: request.paymentStatus,
  paymentReceiptFileName: request.paymentReceiptFileName,
  paymentReceiptContentType: request.paymentReceiptContentType,
  paymentReceiptSize: request.paymentReceiptSize,
  paymentSubmittedAt: request.paymentSubmittedAt,
  status: request.status,
  reviewNote: request.reviewNote,
  reviewedAt: request.reviewedAt,
  createdAt: request.createdAt,
  ...(request.status === "approved" && request.demoCardNumber
    ? {
        demoCardNumber: request.demoCardNumber,
        demoCardExpiry: request.demoCardExpiry,
        demoCardCcv: request.demoCardCcv,
      }
    : {}),
});

// Create a standalone ATM card request, optionally linked to a legacy withdrawal.
export const createATMCardRequest = async (req, res) => {
  const {
    withdrawalId,
    brand,
    level,
    currency,
    dailyLimit,
    cardholderName,
    billingAddress,
    acceptedTerms,
  } = req.body || {};

  try {
    if (!["visa", "mastercard", "amex"].includes(brand)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid card network.",
      });
    }

    if (!Object.hasOwn(cardLevels, level)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid card level.",
      });
    }

    if (!["USD", "EUR", "GBP"].includes(currency)) {
      return res.status(400).json({
        success: false,
        message: "Select a supported currency.",
      });
    }

    const numericDailyLimit = Number(dailyLimit);
    if (!isValidDailyLimit(numericDailyLimit)) {
      return res.status(400).json({
        success: false,
        message: "Select a daily limit from 1,000 to 10,000 in steps of 100.",
      });
    }

    if (
      typeof cardholderName !== "string" ||
      !cardholderName.trim() ||
      cardholderName.trim().length > 100 ||
      typeof billingAddress !== "string" ||
      !billingAddress.trim() ||
      billingAddress.trim().length > 300
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid cardholder name and billing address.",
      });
    }

    if (acceptedTerms !== true) {
      return res.status(400).json({
        success: false,
        message: "Accept the Virtual Card application terms to continue.",
      });
    }

    let withdrawal = null;
    if (withdrawalId) {
      if (!mongoose.isValidObjectId(withdrawalId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid withdrawal request ID.",
        });
      }

      withdrawal = await WithdrawalRequest.findOne({
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

      if (withdrawal.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This withdrawal is not eligible for a virtual card request.",
        });
      }

      if (withdrawal.atmCardRequest) {
        return res.status(409).json({
          success: false,
          message: "A virtual vard request already exists for this withdrawal.",
        });
      }
    }

    const existingRequest = await ATMCardRequest.findOne({
      user: req.user._id,
      isTest: true,
      status: { $in: ["awaiting_payment", "awaiting_admin_approval"] },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "You already have a virtual card request in progress.",
        atmCardRequest: toATMCardRequestResponse(existingRequest),
      });
    }

    const atmCardRequest = await ATMCardRequest.create({
      user: req.user._id,
      withdrawalRequest: withdrawal?._id || null,
      brand,
      level,
      cardholderName: cardholderName.trim(),
      billingAddress: billingAddress.trim(),
      currency,
      dailyLimit: numericDailyLimit,
      feeCents: cardLevels[level].feeCents,
      feeCurrency: "USD",
      termsAcceptedAt: new Date(),
      ...createDemoATMCardDetails(),
      paymentStatus: "not_submitted",
      status: "awaiting_payment",
      isTest: true,
    });

    if (withdrawal) {
      try {
        withdrawal.atmCardRequest = atmCardRequest._id;
        withdrawal.status = "awaiting_atm";
        await withdrawal.save();
      } catch (error) {
        await ATMCardRequest.deleteOne({ _id: atmCardRequest._id });
        throw error;
      }
    }

    return res.status(201).json({
      success: true,
      message:
        "Your virtual card application has been created. Proceed to submit payment receipt.",
      atmCardRequest: toATMCardRequestResponse(atmCardRequest, withdrawal),
    });
  } catch (error) {
    console.error("Create virtual card request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create your ATM card request.",
    });
  }
};

// Submit simulated payment evidence for admin review.
export const submitATMCardPayment = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid virtual card request ID.",
      });
    }

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

    const atmCardRequest = await ATMCardRequest.findOne({
      _id: id,
      user: req.user._id,
      isTest: true,
      status: "awaiting_payment",
      paymentStatus: "not_submitted",
    });

    if (!atmCardRequest) {
      return res.status(404).json({
        success: false,
        message:
          "Virtual card request not found or payment receipt has already been submitted.",
      });
    }

    atmCardRequest.paymentReceiptData = req.file.buffer;
    atmCardRequest.paymentReceiptContentType = detectedMimeType;
    atmCardRequest.paymentReceiptFileName = sanitizeReceiptFileName(
      req.file.originalname,
    );
    atmCardRequest.paymentReceiptSize = req.file.size;
    atmCardRequest.paymentSubmittedAt = new Date();
    atmCardRequest.paymentStatus = "awaiting_review";
    atmCardRequest.status = "awaiting_admin_approval";

    await atmCardRequest.save();

    return res.status(200).json({
      success: true,
      message:
        "Payment receipt submitted. Your virtual card request is awaiting review.",
      atmCardRequest: {
        ...toATMCardRequestResponse(atmCardRequest),
      },
    });
  } catch (error) {
    console.error("Submit virtual payment evidence error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit payment receipt.",
    });
  }
};

// Retrieve the logged-in customer's ATM card requests.
export const getMyATMCardRequests = async (req, res) => {
  try {
    const requests = await ATMCardRequest.find({
      user: req.user._id,
      isTest: true,
    })
      .populate("withdrawalRequest", "amountCents currency method status")
      .select(
        [
          "_id",
          "withdrawalRequest",
          "brand",
          "level",
          "cardholderName",
          "billingAddress",
          "currency",
          "dailyLimit",
          "dailyLimitUsdCents",
          "feeCents",
          "feeUsdCents",
          "feeCurrency",
          "paymentStatus",
          "paymentReceiptFileName",
          "paymentReceiptContentType",
          "paymentReceiptSize",
          "paymentSubmittedAt",
          "status",
          "reviewNote",
          "reviewedAt",
          "createdAt",
          "+demoCardNumber",
          "+demoCardExpiry",
          "+demoCardCcv",
        ].join(" "),
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      atmCardRequests: requests.map((request) =>
        toATMCardRequestResponse(request, request.withdrawalRequest),
      ),
    });
  } catch (error) {
    console.error("Get virtual card requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your virtual card requests.",
    });
  }
};
