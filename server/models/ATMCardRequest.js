import mongoose from "mongoose";

const atmCardRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    withdrawalRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
      default: null,
    },

    brand: {
      type: String,
      enum: ["visa", "mastercard", "amex"],
      required: function () {
        return !this.withdrawalRequest;
      },
    },

    level: {
      type: String,
      enum: ["standard", "gold", "platinum", "black"],
      required: function () {
        return !this.withdrawalRequest;
      },
    },

    cardholderName: {
      type: String,
      trim: true,
      maxlength: 100,
      required: function () {
        return !this.withdrawalRequest;
      },
    },

    billingAddress: {
      type: String,
      trim: true,
      maxlength: 300,
      required: function () {
        return !this.withdrawalRequest;
      },
    },

    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
    },

    dailyLimit: {
      type: Number,
      min: 1000,
      max: 10000,
      required: function () {
        return !this.withdrawalRequest;
      },
      validate: {
        validator: (value) => Number.isInteger(value) && value % 100 === 0,
        message: "Daily limit must be in increments of 100.",
      },
    },

    feeCents: {
      type: Number,
      enum: [500, 1500, 2500, 5000],
      required: function () {
        return !this.withdrawalRequest;
      },
    },

    feeCurrency: {
      type: String,
      enum: ["USD"],
      default: "USD",
    },

    termsAcceptedAt: {
      type: Date,
      required: function () {
        return !this.withdrawalRequest;
      },
    },

    demoCardNumber: {
      type: String,
      match: /^0000\d{12}$/,
      select: false,
    },

    demoCardExpiry: {
      type: String,
      match: /^(0[1-9]|1[0-2])\/\d{2}$/,
      select: false,
    },

    demoCardCcv: {
      type: String,
      match: /^\d{3}$/,
      select: false,
    },

    // Legacy request fields retained for existing withdrawal-linked requests.
    cardType: {
      type: String,
      enum: ["standard", "unlimited"],
    },

    feeUsdCents: {
      type: Number,
      enum: [50000, 100000],
    },

    dailyLimitUsdCents: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (!this.cardType) {
            return value === null;
          }

          if (this.cardType === "standard") {
            return value === 500000;
          }

          if (this.cardType === "unlimited") {
            return value === null;
          }

          return false;
        },
        message: "Invalid daily limit for the selected ATM card.",
      },
    },

    // Educational simulation payment information.
    paymentStatus: {
      type: String,
      enum: ["not_submitted", "awaiting_review", "approved", "rejected"],
      default: "not_submitted",
    },

    paymentReceiptData: {
      type: Buffer,
    },

    paymentReceiptContentType: {
      type: String,
      enum: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    },

    paymentReceiptFileName: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    paymentReceiptSize: {
      type: Number,
      min: 1,
      max: 5 * 1024 * 1024,
    },

    paymentSubmittedAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "awaiting_payment",
        "awaiting_admin_approval",
        "approved",
        "rejected",
      ],
      default: "pending",
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

atmCardRequestSchema.index({ user: 1, createdAt: -1 });

const ATMCardRequest = mongoose.model("ATMCardRequest", atmCardRequestSchema);

export default ATMCardRequest;
