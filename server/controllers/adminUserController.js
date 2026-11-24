import mongoose from "mongoose";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const PAGE_SIZE = 25;
const MAX_ADJUSTMENT_CENTS = 100_000_000;

const formatTransaction = (transaction) => ({
  id: transaction._id,
  reference: transaction.reference,
  type: transaction.type,
  description: transaction.description,
  amount: transaction.amountCents / 100,
  amountCents: transaction.amountCents,
  currency: transaction.currency,
  status: transaction.status,
  source: transaction.source,
  createdAt: transaction.createdAt,
  transactionDate: transaction.transactionDate || transaction.createdAt, //just added for testing
  reviewedAt: transaction.reviewedAt,
  reviewedBy: transaction.reviewedBy
    ? {
        firstName: transaction.reviewedBy.firstName,
        lastName: transaction.reviewedBy.lastName,
        email: transaction.reviewedBy.email,
      }
    : null,
});

export const getAdminUsers = async (req, res) => {
  try {
    const requestedPage = Number.parseInt(req.query.page, 10) || 1;
    const page = Math.max(1, requestedPage);
    const [totalUsers, users] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.find({ role: "customer" })
        .select("firstName lastName email accountStatus createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
    ]);

    const accounts = await Account.find({
      user: { $in: users.map((user) => user._id) },
      isTest: true,
    })
      .select(
        "user accountNumber accountType accountCategory currency balanceCents earningsCents tradingStatus accountStatus",
      )
      .lean();
    const accountsByUser = new Map(
      accounts.map((account) => [String(account.user), account]),
    );

    return res.status(200).json({
      success: true,
      totalUsers,
      page,
      pageSize: PAGE_SIZE,
      pages: Math.ceil(totalUsers / PAGE_SIZE),
      users: users.map((user) => {
        const account = accountsByUser.get(String(user._id));

        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountStatus: user.accountStatus,
          createdAt: user.createdAt,
          account: account
            ? {
                id: account._id,
                accountNumber: account.accountNumber,
                accountType: account.accountType,
                accountCategory: account.accountCategory,
                currency: account.currency,
                balanceCents: account.balanceCents,
                balance: account.balanceCents / 100,
                earningsCents: account.earningsCents || 0,
                earnings: (account.earningsCents || 0) / 100,
                tradingStatus: account.tradingStatus || "inactive",
                accountStatus: account.accountStatus,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("Get admin user directory error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the user directory.",
    });
  }
};

export const getAdminUserDetails = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  try {
    const user = await User.findOne({ _id: id, role: "customer" })
      .select(
        "firstName lastName email phoneNumber houseAddress city state zipCode country nextOfKinName nextOfKinRelationship nextOfKinPhone monthlySalary accountStatus createdAt",
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const account = await Account.findOne({
      user: user._id,
      isTest: true,
    })
      .select(
        "accountNumber accountType accountCategory currency balanceCents earningsCents tradingStatus accountStatus createdAt",
      )
      .lean();

    const transactions = account
      ? await Transaction.find({
          account: account._id,
          user: user._id,
          isTest: true,
        })
          .populate("reviewedBy", "firstName lastName email")
          // .sort({ createdAt: -1 }) replaced with the code below
          .sort({ transactionDate: -1, createdAt: -1 }) //jut this
          .limit(100)
      : [];

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        houseAddress: user.houseAddress,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country,
        nextOfKinName: user.nextOfKinName,
        nextOfKinRelationship: user.nextOfKinRelationship,
        nextOfKinPhone: user.nextOfKinPhone,
        monthlySalary: user.monthlySalary,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        account: account
          ? {
              id: account._id,
              accountNumber: account.accountNumber,
              accountType: account.accountType,
              accountCategory: account.accountCategory,
              currency: account.currency,
              balanceCents: account.balanceCents,
              balance: account.balanceCents / 100,
              earningsCents: account.earningsCents || 0,
              earnings: (account.earningsCents || 0) / 100,
              tradingStatus: account.tradingStatus || "inactive",
              accountStatus: account.accountStatus,
              createdAt: account.createdAt,
            }
          : null,
        transactions: transactions.map(formatTransaction),
        transactionsLimited: transactions.length === 100,
      },
    });
  } catch (error) {
    console.error("Get admin user details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customer details.",
    });
  }
};

export const adjustAdminUserBalance = async (req, res) => {
  const { id } = req.params;
  const { direction, amount, reason, transactionDate } = req.body; //i added transactionDate for testing

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  if (!["credit", "debit"].includes(direction)) {
    return res.status(400).json({
      success: false,
      message: "Choose credit or debit.",
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

  // Validate the administrator-selected transaction date.testing
  let selectedTransactionDate = new Date();

  if (transactionDate !== undefined) {
    if (typeof transactionDate !== "string" || !transactionDate.trim()) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid transaction date and time.",
      });
    }

    selectedTransactionDate = new Date(transactionDate);

    if (Number.isNaN(selectedTransactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "The transaction date and time are invalid.",
      });
    }
  }

  const session = await mongoose.startSession();

  try {
    let updatedBalanceCents;
    let adjustment;

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
      }).session(session);

      if (!account) {
        const error = new Error(
          "Customer simulation account not found or inactive.",
        );
        error.statusCode = 404;
        throw error;
      }

      if (direction === "debit" && amountCents > account.balanceCents) {
        const error = new Error(
          "Debit exceeds the customer's available balance.",
        );
        error.statusCode = 400;
        throw error;
      }

      account.balanceCents +=
        direction === "credit" ? amountCents : -amountCents;
      await account.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            account: account._id,
            user: user._id,
            type:
              direction === "credit" ? "adjustment_credit" : "adjustment_debit",
            description: `Administrator adjustment (${direction}): ${reason.trim()}`,
            amountCents,
            currency: account.currency,
            status: "completed",
            source: "admin_adjustment",
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
            transactionDate: selectedTransactionDate, // also esting
            isTest: true,
          },
        ],
        { session },
      );

      updatedBalanceCents = account.balanceCents;
      adjustment = transaction;
    });

    return res.status(201).json({
      success: true,
      message: `Balance ${direction} recorded in transaction history.`,
      balanceCents: updatedBalanceCents,
      balance: updatedBalanceCents / 100,
      transaction: formatTransaction(adjustment),
    });
  } catch (error) {
    console.error("Admin balance adjustment error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to adjust customer balance.",
    });
  } finally {
    await session.endSession();
  }
};;

export const deactivateAdminUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  if (String(req.user._id) === id) {
    return res.status(400).json({
      success: false,
      message: "You cannot deactivate your own administrator account.",
    });
  }

  const session = await mongoose.startSession();

  try {
    let deactivatedUser;

    await session.withTransaction(async () => {
      const user = await User.findOneAndUpdate(
        { _id: id, role: "customer", accountStatus: "active" },
        { $set: { accountStatus: "suspended" } },
        { new: true, session },
      ).select("_id");

      if (!user) {
        const error = new Error("Active customer not found.");
        error.statusCode = 404;
        throw error;
      }

      await Account.updateOne(
        { user: user._id, isTest: true },
        { $set: { accountStatus: "suspended" } },
        { session },
      );

      deactivatedUser = user;
    });

    return res.status(200).json({
      success: true,
      message:
        "Customer access deactivated. The account and transaction history were retained.",
      userId: deactivatedUser._id,
    });
  } catch (error) {
    console.error("Admin customer deactivation error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to deactivate customer access.",
    });
  } finally {
    await session.endSession();
  }
};
