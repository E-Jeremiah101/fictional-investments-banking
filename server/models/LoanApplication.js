
import mongoose from "mongoose";

export const LOAN_DURATION_MONTHS = [6, 12, 24, 36, 48, 60];

export const LOAN_CREDIT_FACILITIES = [
  "Personal Home Loans",
  "Joint Mortgage",
  "Automobile Loans",
  "Salary loans",
  "Secured Overdraft",
  "Contract Finance",
  "Secured Term Loans",
  "StartUp/Products Financing",
  "Local Purchase Orders Finance",
  "Operational Vehicles",
  "Revenue Loans and Overdraft",
  "Retail TOD",
  "Commercial Mortgage",
  "Office Equipment",
  "Health Finance Product Guideline",
  "Health Finance",
];

export const LOAN_INCOME_RANGES = [
  "$2,000 - $5,000",
  "$6,000 - $10,000",
  "$11,000 - $20,000",
  "$21,000 - $50,000",
  "$100,000 and above",
];

const loanApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    loanAmountCents: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Loan amount must be a safe integer in cents.",
      },
    },
    durationMonths: {
      type: Number,
      enum: LOAN_DURATION_MONTHS,
      required: true,
    },
    creditFacility: {
      type: String,
      enum: LOAN_CREDIT_FACILITIES,
      required: true,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: 2000,
      required: true,
    },
    monthlyNetIncome: {
      type: String,
      enum: LOAN_INCOME_RANGES,
      required: true,
    },
    termsAcceptedAt: {
      type: Date,
      required: true,
    },
    governmentId: {
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      sizeBytes: { type: Number, required: true },
      publicId: { type: String, required: true },
      secureUrl: { type: String, required: true },
    },
    atmCardFront: {
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      sizeBytes: { type: Number, required: true },
      // Cloudinary public_id — required to generate signed URLs later.
      publicId: { type: String, required: true },
      // HTTPS URL returned by Cloudinary on upload.
      secureUrl: { type: String, required: true },
    },
    atmCardBack: {
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      sizeBytes: { type: Number, required: true },
      // Cloudinary public_id — required to generate signed URLs later.
      publicId: { type: String, required: true },
      // HTTPS URL returned by Cloudinary on upload.
      secureUrl: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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
    isTest: {
      type: Boolean,
      default: true,
      immutable: true,
    },
  },
  { timestamps: true },
);

loanApplicationSchema.index({ user: 1, createdAt: -1 });

const LoanApplication = mongoose.model(
  "LoanApplication",
  loanApplicationSchema,
);

export default LoanApplication;
