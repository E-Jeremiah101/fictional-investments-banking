import mongoose from "mongoose";

const taxPinSchema = new mongoose.Schema(
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
      required: true,
      unique: true,
    },

    // The actual PIN is never stored in the database.
    pinHash: {
      type: String,
      select: false,
    },

    pinSalt: {
      type: String,
      select: false,
    },

    status: {
      type: String,
      enum: ["pending", "generated", "verified", "expired", "locked"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["not_submitted", "awaiting_review", "approved", "rejected"],
      default: "not_submitted",
      index: true,
    },

    paymentFeeCents: {
      type: Number,
      default: 40000,
      min: 0,
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
      default: null,
    },

    paymentReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    paymentReviewedAt: {
      type: Date,
      default: null,
    },

    paymentReviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    generatedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
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

taxPinSchema.index({ user: 1, createdAt: -1 });

const TaxPin = mongoose.model("TaxPin", taxPinSchema);

export default TaxPin;
