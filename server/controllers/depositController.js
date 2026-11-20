import DepositRequest from "../models/DepositRequest.js";
import Account from "../models/Account.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";

export const createDepositRequest = async (req, res) => {
  try {
    const {
      amount,
      method,
      asset,
      network,
      transactionHash,
      purpose = "standard",
    } = req.body;

    // Validate deposit amount.
    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !Number.isSafeInteger(Math.round(numericAmount * 100))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid deposit amount in USD.",
      });
    }

    // Validate deposit method.
    const allowedMethods = ["bank_transfer", "crypto"];

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit method.",
      });
    }

    if (!["standard", "trading_activation"].includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit purpose.",
      });
    }

    if (purpose === "trading_activation" && numericAmount !== 300) {
      return res.status(400).json({
        success: false,
        message: "Trading activation requires a deposit of exactly $300.",
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

    // Find the customer's active test account.
    const account = await Account.findOne({
      user: req.user._id,
      accountStatus: "active",
      isTest: true,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Your active account could not be found.",
      });
    }

    if (
      purpose === "trading_activation" &&
      account.tradingStatus !== "awaiting_deposit"
    ) {
      return res.status(400).json({
        success: false,
        message: "Start trading activation before submitting deposit.",
      });
    }

    if (purpose === "trading_activation") {
      const pendingActivationDeposit = await DepositRequest.findOne({
        account: account._id,
        user: req.user._id,
        purpose: "trading_activation",
        status: "pending",
        isTest: true,
      }).select("_id");

      if (pendingActivationDeposit) {
        return res.status(409).json({
          success: false,
          message: "A trading activation deposit is already awaiting review.",
        });
      }
    }

    const amountCents = Math.round(numericAmount * 100);

    // Create a pending deposit request.
    const depositRequest = await DepositRequest.create({
      user: req.user._id,
      account: account._id,
      amountCents,
      currency: "USD",
      method,
      purpose,
      asset: method === "crypto" ? asset || "" : "",
      network: method === "crypto" ? network || "" : "",
      transactionHash: method === "crypto" ? transactionHash || "" : "",
      paymentReceiptData: req.file.buffer,
      paymentReceiptContentType: detectedMimeType,
      paymentReceiptFileName: sanitizeReceiptFileName(req.file.originalname),
      paymentReceiptSize: req.file.size,
      paymentSubmittedAt: new Date(),
      status: "pending",
      isTest: true,
    });

    return res.status(201).json({
      success: true,
      message:
        "Your deposit has been submitted and is awaiting review.",
      deposit: {
        id: depositRequest._id,
        amount: depositRequest.amountCents / 100,
        amountCents: depositRequest.amountCents,
        currency: depositRequest.currency,
        method: depositRequest.method,
        purpose: depositRequest.purpose,
        status: depositRequest.status,
        createdAt: depositRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("Create deposit request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your deposit request.",
    });
  }
};

export const getMyDepositRequests = async (req, res) => {
  try {
    const deposits = await DepositRequest.find({
      user: req.user._id,
      isTest: true,
    })
      .select(
        "amountCents currency method purpose asset network transactionHash paymentReceiptFileName paymentReceiptContentType paymentReceiptSize paymentSubmittedAt status reviewNote createdAt reviewedAt",
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      deposits: deposits.map((deposit) => ({
        id: deposit._id,
        amount: deposit.amountCents / 100,
        amountCents: deposit.amountCents,
        currency: deposit.currency,
        method: deposit.method,
        purpose: deposit.purpose,
        asset: deposit.asset,
        network: deposit.network,
        transactionHash: deposit.transactionHash,
        paymentReceiptFileName: deposit.paymentReceiptFileName,
        paymentReceiptContentType: deposit.paymentReceiptContentType,
        paymentReceiptSize: deposit.paymentReceiptSize,
        paymentSubmittedAt: deposit.paymentSubmittedAt,
        status: deposit.status,
        reviewNote: deposit.reviewNote,
        createdAt: deposit.createdAt,
        reviewedAt: deposit.reviewedAt,
      })),
    });
  } catch (error) {
    console.error("Get deposit requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your deposit history.",
    });
  }
};
