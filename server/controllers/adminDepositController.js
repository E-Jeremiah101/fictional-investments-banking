import mongoose from "mongoose";
import DepositRequest from "../models/DepositRequest.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import {
  getPaymentReceiptMimeType,
  sanitizeReceiptFileName,
} from "../middleware/paymentReceiptUpload.js";

export const getPendingDeposits = async (req, res) => {
  try {
    const deposits = await DepositRequest.find({
      status: "pending",
      isTest: true,
    })
      .select("-paymentReceiptData")
      .populate("user", "firstName lastName email")
      .populate("account", "accountNumber accountName currency")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      deposits: deposits.map((deposit) => ({
        id: deposit._id,
        user: deposit.user
          ? {
              id: deposit.user._id,
              firstName: deposit.user.firstName,
              lastName: deposit.user.lastName,
              email: deposit.user.email,
            }
          : null,
        account: deposit.account
          ? {
              id: deposit.account._id,
              accountNumber: deposit.account.accountNumber,
              accountName: deposit.account.accountName,
              currency: deposit.account.currency,
            }
          : null,
        amount: deposit.amountCents / 100,
        amountCents: deposit.amountCents,
        currency: deposit.currency,
        method: deposit.method,
        purpose: deposit.purpose || "standard",
        asset: deposit.asset,
        network: deposit.network,
        transactionHash: deposit.transactionHash,
        paymentReceiptFileName: deposit.paymentReceiptFileName,
        paymentReceiptContentType: deposit.paymentReceiptContentType,
        paymentReceiptSize: deposit.paymentReceiptSize,
        paymentSubmittedAt: deposit.paymentSubmittedAt,
        status: deposit.status,
        isTest: deposit.isTest,
        createdAt: deposit.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get pending deposits error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve pending deposit requests.",
    });
  }
};

export const getDepositPaymentReceipt = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit request ID.",
      });
    }

    const request = await DepositRequest.findOne({
      _id: req.params.id,
      isTest: true,
    }).select("paymentReceiptData paymentReceiptContentType paymentReceiptFileName");

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
    console.error("Get deposit payment receipt error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the payment receipt.",
    });
  }
};

export const reviewDeposit = async (req, res) => {
  const { id } = req.params;
  const { action, reviewNote } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid deposit request ID.",
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
      const deposit = await DepositRequest.findOne({
        _id: id,
        status: "pending",
        isTest: true,
      }).session(session);

      if (!deposit) {
        throw new Error(
          "This deposit request was not found or has already been reviewed.",
        );
      }

      if (action === "reject") {
        deposit.status = "rejected";
        deposit.reviewedBy = req.user._id;
        deposit.reviewedAt = new Date();
        deposit.reviewNote = reviewNote?.trim() || "";

        await deposit.save({ session });

        result = {
          action: "rejected",
          amount: deposit.amountCents / 100,
          currency: "USD",
        };

        return;
      }

      const account = await Account.findOne({
        _id: deposit.account,
        user: deposit.user,
        accountStatus: "active",
        isTest: true,
      }).session(session);

      if (!account) {
        throw new Error(
          "The customer's active simulation account could not be found.",
        );
      }

      if (
        deposit.purpose === "trading_activation" &&
        (deposit.amountCents !== 30_000 ||
          account.tradingStatus !== "awaiting_deposit")
      ) {
        throw new Error(
          "This trading activation deposit is no longer valid for the account.",
        );
      }

      deposit.status = "approved";
      deposit.reviewedBy = req.user._id;
      deposit.reviewedAt = new Date();
      deposit.reviewNote = reviewNote?.trim() || "";

      await deposit.save({ session });

      const updatedAccount = await Account.findOneAndUpdate(
        {
          _id: account._id,
          user: deposit.user,
          accountStatus: "active",
          isTest: true,
        },
        {
          $inc: { balanceCents: deposit.amountCents },
        },
        {
          new: true,
          session,
          runValidators: true,
        },
      );

      if (!updatedAccount) {
        throw new Error("Unable to update the customer's account balance.");
      }

      if (deposit.purpose === "trading_activation") {
        updatedAccount.tradingStatus = "active";
        await updatedAccount.save({ session });
      }

      await Transaction.create(
        [
          {
            account: account._id,
            user: deposit.user,
            type: "deposit",
            description:
              deposit.purpose === "trading_activation"
                ? "Approved simulated trading activation deposit"
                : "Approved simulated deposit",
            amountCents: deposit.amountCents,
            currency: "USD",
            status: "completed",
            source: deposit.method,
            isTest: true,
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
          },
        ],
        { session },
      );

      result = {
        action: "approved",
        purpose: deposit.purpose || "standard",
        amount: deposit.amountCents / 100,
        currency: "USD",
        newBalance: updatedAccount.balanceCents / 100,
        newBalanceCents: updatedAccount.balanceCents,
      };
    });

    return res.status(200).json({
      success: true,
      message:
        result.action === "approved"
          ? result.purpose === "trading_activation"
            ? "Simulated activation deposit approved, account balance updated, and trading activated."
            : "Simulated deposit approved and account balance updated."
          : "Deposit request rejected.",
      result,
    });
  } catch (error) {
    console.error("Review deposit error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to review deposit request.",
    });
  } finally {
    await session.endSession();
  }
};
