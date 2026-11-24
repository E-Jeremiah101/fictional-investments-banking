// import mongoose from "mongoose";
// import { randomBytes } from "node:crypto";

// const createTransactionReference = () => {
//   const randomSuffix = randomBytes(8).toString("hex").toUpperCase();
//   return `TXN-${randomSuffix}`;
// };

// const transactionSchema = new mongoose.Schema(
//   {
//     account: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
//       required: true,
//       index: true,
//     },

//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     reference: {
//       type: String,
//       default: createTransactionReference,
//       unique: true,
//       required: true,
//     },

//     type: {
//       type: String,
//       enum: [
//         "deposit",
//         "withdrawal",
//         "adjustment_credit",
//         "adjustment_debit",
//         "investment_earnings_credit",
//         "investment_earnings_debit",
//       ],
//       required: true,
//     },

//     description: {
//       type: String,
//       trim: true,
//       maxlength: 200,
//       default: "",
//     },

//     // Transaction amount in USD cents.
//     // Example: $100.00 = 10000 cents.
//     amountCents: {
//       type: Number,
//       required: true,
//       min: 1,
//       validate: {
//         validator: Number.isSafeInteger,
//         message: "Transaction amount must be a whole number of USD cents.",
//       },
//     },

//     currency: {
//       type: String,
//       enum: ["USD"],
//       default: "USD",
//     },

//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected", "completed"],
//       default: "pending",
//       index: true,
//     },

//     source: {
//       type: String,
//       enum: ["bank_transfer", "crypto", "admin_adjustment"],
//       required: true,
//     },

//     isTest: {
//       type: Boolean,
//       default: true,
//       immutable: true,
//     },

//     reviewedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     reviewedAt: {
//       type: Date,
//       default: null,
//     },

//     rejectionReason: {
//       type: String,
//       trim: true,
//       maxlength: 300,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// transactionSchema.index({ account: 1, createdAt: -1 });

// const Transaction = mongoose.model("Transaction", transactionSchema);

// export default Transaction;

import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

const createTransactionReference = () => {
  const randomSuffix = randomBytes(8).toString("hex").toUpperCase();
  return `TXN-${randomSuffix}`;
};

const transactionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reference: {
      type: String,
      default: createTransactionReference,
      unique: true,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "deposit",
        "withdrawal",
        "adjustment_credit",
        "adjustment_debit",
        "investment_earnings_credit",
        "investment_earnings_debit",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    // Transaction amount in USD cents.
    // Example: $100.00 = 10000 cents.
    amountCents: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isSafeInteger,
        message: "Transaction amount must be a whole number of USD cents.",
      },
    },

    currency: {
      type: String,
      enum: ["USD"],
      default: "USD",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
      index: true,
    },

    source: {
      type: String,
      enum: ["bank_transfer", "crypto", "admin_adjustment"],
      required: true,
    },

    // Date and time assigned to the actual transaction.
    transactionDate: {
      type: Date,
      default: Date.now,
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

    rejectionReason: {
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

transactionSchema.index({ account: 1, transactionDate: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
