import Account from "../models/Account.js";
import DepositRequest from "../models/DepositRequest.js";
import Transaction from "../models/Transaction.js";

const ACTIVATION_AMOUNT_CENTS = 30_000;

const getActiveAccount = (userId) =>
  Account.findOne({
    user: userId,
    accountStatus: "active",
    isTest: true,
  });

export const getMyInvestments = async (req, res) => {
  try {
    const account = await getActiveAccount(req.user._id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Your active account could not be found.",
      });
    }

    const depositTotals = await Transaction.aggregate([
      {
        $match: {
          account: account._id,
          user: req.user._id,
          isTest: true,
          status: "completed",
          type: { $in: ["deposit", "adjustment_credit"] },
        },
      },
      { $group: { _id: null, totalCents: { $sum: "$amountCents" } } },
    ]);
    const activationDepositPending = Boolean(
      await DepositRequest.exists({
        account: account._id,
        user: req.user._id,
        purpose: "trading_activation",
        status: "pending",
        isTest: true,
      }),
    );

    return res.status(200).json({
      success: true,
      investment: {
        tradingStatus: account.tradingStatus || "inactive",
        activationDepositPending,
        earningsCents: account.earningsCents || 0,
        earnings: (account.earningsCents || 0) / 100,
        totalDepositsCents: depositTotals[0]?.totalCents || 0,
        totalDeposits: (depositTotals[0]?.totalCents || 0) / 100,
        balanceCents: account.balanceCents,
        balance: account.balanceCents / 100,
        currency: account.currency,
      },
    });
  } catch (error) {
    console.error("Get investment summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your investment summary.",
    });
  }
};

export const requestTradingActivation = async (req, res) => {
  try {
    const account = await getActiveAccount(req.user._id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Your active account could not be found.",
      });
    }

    if (account.tradingStatus === "active") {
      return res.status(409).json({
        success: false,
        message: "Trading is already active on this account.",
      });
    }

    if (account.tradingStatus !== "awaiting_deposit") {
      account.tradingStatus = "awaiting_deposit";
      await account.save();
    }

    return res.status(200).json({
      success: true,
      message:
        "You are required to make a deposit of $300 to activate your trading account; it will be credited to your balance when approved.",
      activationAmount: ACTIVATION_AMOUNT_CENTS / 100,
    });
  } catch (error) {
    console.error("Request trading activation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start trading activation.",
    });
  }
};
