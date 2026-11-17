import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    accountType: {
      type: String,
      enum: ["checking", "savings"],
      default: "checking",
    },

    accountCategory: {
      type: String,
      enum: ["personal", "student", "business"],
      default: "personal",
    },

    tradingStatus: {
      type: String,
      enum: ["inactive", "awaiting_deposit", "active"],
      default: "inactive",
    },

    earningsCents: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Investment earnings must be a whole number of USD cents.",
      },
    },

    currency: {
      type: String,
      default: "USD",
      enum: ["USD"],
    },

    balanceCents: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
      validate: {
        validator: Number.isSafeInteger,
        message: "Account balance must be a whole number of USD cents.",
      },
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
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

const Account = mongoose.model("Account", accountSchema);

export default Account;
