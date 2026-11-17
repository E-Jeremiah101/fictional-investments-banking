import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    // Withdrawal amount in USD cents.
    // Example: $100.00 = 10000
    amountCents: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Withdrawal amount must be a whole number of USD cents.",
      },
    },

    currency: {
      type: String,
      enum: ["USD"],
      default: "USD",
    },

    method: {
      type: String,
      enum: ["bank_transfer", "crypto"],
      required: true,
    },

    // Bank withdrawal details
    bankName: {
      type: String,
      trim: true,
    },

    bankAccountName: {
      type: String,
      trim: true,
    },

    bankAccountNumber: {
      type: String,
      trim: true,
    },

    recipientCountry: {
      type: String,
      uppercase: true,
      trim: true,
    },

    bankRoutingNumber: {
      type: String,
      trim: true,
    },

    bankIban: {
      type: String,
      uppercase: true,
      trim: true,
    },

    bankSwiftBic: {
      type: String,
      uppercase: true,
      trim: true,
    },

    // Cryptocurrency withdrawal details
    asset: {
      type: String,
      uppercase: true,
      trim: true,
    },

    network: {
      type: String,
      trim: true,
    },

    walletAddress: {
      type: String,
      trim: true,
    },

    // Market price of one unit of cryptocurrency in USD.
    exchangeRateUsd: {
      type: Number,
      min: 0,
    },

    // Calculated cryptocurrency amount.
    cryptoAmount: {
      type: String,
      trim: true,
    },

    exchangeRateUpdatedAt: {
      type: Date,
    },

    // Withdrawal workflow
    status: {
      type: String,
      enum: [
        "pending",
        "awaiting_atm",
        "awaiting_atm_approval",
        "ready_for_withdrawal",
        "awaiting_tax_pin",
        "tax_pin_verified",
        "awaiting_remittance_payment",
        "awaiting_remittance_approval",
        "approved",
        "rejected",
      ],
      default: "pending",
    },
    atmCardRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ATMCardRequest",
      default: null,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
      unique: true,
      sparse: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },

    reviewNote: {
      type: String,
      trim: true,
    },

    isTest: {
      type: Boolean,
      default: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
  },
);

withdrawalRequestSchema.index({ user: 1, createdAt: -1 });

const WithdrawalRequest = mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema,
);

export default WithdrawalRequest;
