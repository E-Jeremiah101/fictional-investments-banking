import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: 50,
    },

    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    houseAddress: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    city: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    state: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    zipCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    country: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    nextOfKinName: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    nextOfKinRelationship: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    nextOfKinPhone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    monthlySalary: {
      type: Number,
      min: 0,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    transactionPinHash: {
      type: String,
      select: false,
    },

    transactionPinSalt: {
      type: String,
      select: false,
    },

    transactionPinAttempts: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },

    transactionPinLockedUntil: {
      type: Date,
      default: null,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    accountStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
