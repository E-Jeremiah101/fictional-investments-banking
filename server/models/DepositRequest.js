import mongoose from "mongoose";

const depositRequestSchema = new mongoose.Schema(
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
      index: true,
    },

    // Deposit amount in USD cents.
    // Example: $100.00 = 10000.
    amountCents: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Amount must be a whole number of USD cents.",
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

    purpose: {
      type: String,
      enum: ["standard", "trading_activation"],
      default: "standard",
    },

    asset: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    network: {
      type: String,
      trim: true,
      default: "",
    },

    transactionHash: {
      type: String,
      trim: true,
      default: "",
    },

    paymentReceiptData: {
      type: Buffer,
      default: null,
    },

    paymentReceiptContentType: {
      type: String,
      trim: true,
      default: "",
    },

    paymentReceiptFileName: {
      type: String,
      trim: true,
      default: "",
    },

    paymentReceiptSize: {
      type: Number,
      default: 0,
    },

    paymentSubmittedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    isTest: {
      type: Boolean,
      default: true,
      immutable: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewNote: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

depositRequestSchema.index({
  user: 1,
  createdAt: -1,
});

depositRequestSchema.index(
  { transactionHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      transactionHash: { $gt: "" },
    },
  },
);

const DepositRequest = mongoose.model("DepositRequest", depositRequestSchema);

export default DepositRequest;
