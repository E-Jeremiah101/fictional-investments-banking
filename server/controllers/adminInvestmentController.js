import mongoose from "mongoose";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const MAX_ADJUSTMENT_CENTS = 100_000_000;

export const getAdminInvestors = async (req, res) => {
  try {
    const accounts = await Account.find({
      isTest: true,
      tradingStatus: "active",
      accountStatus: "active",
    })
      .select("user accountNumber balanceCents earningsCents currency tradingStatus")
      .populate("user", "firstName lastName email accountStatus")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      investors: accounts
        .filter(
          (account) =>
            account.user && account.user.accountStatus === "active",
        )
        .map((account) => ({
          id: account.user._id,
          firstName: account.user.firstName,
          lastName: account.user.lastName,
          email: account.user.email,
          accountNumber: account.accountNumber,
          balanceCents: account.balanceCents,
          balance: account.balanceCents / 100,
          earningsCents: account.earningsCents || 0,
          earnings: (account.earningsCents || 0) / 100,
          currency: account.currency,
        })),
    });
  } catch (error) {
    console.error("Get admin investors error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve active investors.",
    });
  }
};

export const adjustInvestorEarnings = async (req, res) => {
  const { id } = req.params;
  const { direction, amount, reason } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }
  if (!["increase", "decrease"].includes(direction)) {
    return res.status(400).json({
      success: false,
      message: "Choose increase or decrease.",
    });
  }

  const numericAmount = Number(amount);
  const amountCents = Math.round(numericAmount * 100);
  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0 ||
    !Number.isSafeInteger(amountCents) ||
    amountCents > MAX_ADJUSTMENT_CENTS
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid adjustment amount up to $1,000,000.00.",
    });
  }
  if (
    typeof reason !== "string" ||
    !reason.trim() ||
    reason.trim().length > 200
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide an adjustment reason (up to 200 characters).",
    });
  }

  const session = await mongoose.startSession();
  try {
    let result;

    await session.withTransaction(async () => {
      const user = await User.findOne({
        _id: id,
        role: "customer",
        accountStatus: "active",
      }).session(session);
      if (!user) {
        const error = new Error("Active customer not found.");
        error.statusCode = 404;
        throw error;
      }

      const account = await Account.findOne({
        user: user._id,
        isTest: true,
        accountStatus: "active",
        tradingStatus: "active",
      }).session(session);
      if (!account) {
        const error = new Error("Active investor account not found.");
        error.statusCode = 404;
        throw error;
      }

      const currentEarningsCents = account.earningsCents || 0;
      if (direction === "decrease" && amountCents > currentEarningsCents) {
        const error = new Error("Decrease cannot exceed current earnings.");
        error.statusCode = 400;
        throw error;
      }
      if (direction === "decrease" && amountCents > account.balanceCents) {
        const error = new Error(
          "Decrease cannot exceed the customer's current balance.",
        );
        error.statusCode = 400;
        throw error;
      }

      const earningsChange =
        direction === "increase" ? amountCents : -amountCents;
      const balanceChange = earningsChange;
      account.earningsCents = currentEarningsCents + earningsChange;
      account.balanceCents += balanceChange;
      await account.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            account: account._id,
            user: user._id,
            type:
              direction === "increase"
                ? "investment_earnings_credit"
                : "investment_earnings_debit",
            description: `Administrator ${direction}d investment earnings: ${reason.trim()}`,
            amountCents,
            currency: account.currency,
            status: "completed",
            source: "admin_adjustment",
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            isTest: true,
          },
        ],
        { session },
      );

      result = {
        earningsCents: account.earningsCents,
        earnings: account.earningsCents / 100,
        balanceCents: account.balanceCents,
        balance: account.balanceCents / 100,
        transaction: {
          id: transaction._id,
          type: transaction.type,
          amountCents: transaction.amountCents,
          amount: transaction.amountCents / 100,
          description: transaction.description,
          createdAt: transaction.createdAt,
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: `Investment earnings ${direction}d and account balance updated.`,
      result,
    });
  } catch (error) {
    console.error("Adjust investor earnings error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to adjust investment earnings.",
    });
  } finally {
    await session.endSession();
  }
};
