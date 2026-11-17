import mongoose from "mongoose";

const remittanceRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    withdrawalRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WithdrawalRequest",
      required: true,
      unique: true,
    },

    feeCents: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Remittance fee must be a safe integer.",
      },
    },

    currency: {
      type: String,
      default: "USD",
      enum: ["USD"],
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

    status: {
      type: String,
      enum: ["awaiting_payment", "awaiting_review", "approved", "rejected"],
      default: "awaiting_payment",
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
      maxlength: 500,
      default: "",
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

remittanceRequestSchema.index({ user: 1, createdAt: -1 });
remittanceRequestSchema.index({ status: 1, createdAt: -1 });

const RemittanceRequest = mongoose.model(
  "RemittanceRequest",
  remittanceRequestSchema,
);

export default RemittanceRequest;
