import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

export const getMyTransactions = async (req, res) => {
  try {
    const account = await Account.findOne({
      user: req.user._id,
      isTest: true,
    }).select("_id");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Your account could not be found.",
      });
    }

    const transactions = await Transaction.find({
      account: account._id,
      user: req.user._id,
      isTest: true,
    })
      .select(
        "reference type description amountCents currency status source isTest createdAt transactionDate reviewedAt rejectionReason",
      )
      .sort({ transactionDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      transactions: transactions.map((transaction) => ({
        id: transaction._id,
        reference: transaction.reference,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amountCents / 100,
        amountCents: transaction.amountCents,
        currency: transaction.currency,
        status:
          transaction.status === "completed" ||
          transaction.status === "approved"
            ? "successful"
            : transaction.status === "rejected"
              ? "failed"
              : transaction.status,
        source: transaction.source,
        isTest: transaction.isTest,
        createdAt: transaction.createdAt,
        transactionDate: transaction.transactionDate || transaction.createdAt,
        reviewedAt: transaction.reviewedAt,
        rejectionReason: transaction.rejectionReason,
      })),
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your transaction history.",
    });
  }
};

export const getMyTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const account = await Account.findOne({
      user: req.user._id,
      isTest: true,
    }).select("_id");

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Your account could not be found.",
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      account: account._id,
      user: req.user._id,
      isTest: true,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      transaction: {
        id: transaction._id,
        reference: transaction.reference,
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amountCents / 100,
        amountCents: transaction.amountCents,
        currency: transaction.currency,
        status:
          transaction.status === "completed" ||
          transaction.status === "approved"
            ? "successful"
            : transaction.status === "rejected"
              ? "failed"
              : transaction.status,
        source: transaction.source,
        isTest: transaction.isTest,
        createdAt: transaction.createdAt,
        transactionDate: transaction.transactionDate || transaction.createdAt,
        reviewedAt: transaction.reviewedAt,
        rejectionReason: transaction.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Get transaction details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve transaction details.",
    });
  }
};
