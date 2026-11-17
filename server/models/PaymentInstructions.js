import mongoose from "mongoose";

const paymentInstructionsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      immutable: true,
    },
    walletName: { type: String, trim: true, maxlength: 80, default: "" },
    walletAddress: { type: String, trim: true, maxlength: 200, default: "" },
    bankName: { type: String, trim: true, maxlength: 100, default: "" },
    bankAccountName: { type: String, trim: true, maxlength: 100, default: "" },
    bankAccountNumber: { type: String, trim: true, maxlength: 50, default: "" },
    bankRoutingNumber: { type: String, trim: true, maxlength: 50, default: "" },
    bankSwiftCode: { type: String, trim: true, maxlength: 30, default: "" },
  },
  { timestamps: true },
);

const PaymentInstructions = mongoose.model(
  "PaymentInstructions",
  paymentInstructionsSchema,
);

export default PaymentInstructions;
