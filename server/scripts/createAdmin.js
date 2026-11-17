import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Account from "../models/Account.js";

const createAdmin = async () => {
  try {
    const firstName = process.env.ADMIN_FIRST_NAME?.trim();
    const lastName = process.env.ADMIN_LAST_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!firstName || !lastName || !email || !password) {
      throw new Error(
        "Set ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL and ADMIN_PASSWORD before running this script.",
      );
    }

    if (password.length < 12) {
      throw new Error(
        "Use an administrator password of at least 12 characters.",
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. No account was changed. Use a new email for the initial admin.",
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "admin",
      accountStatus: "active",
    });

    try {
      await Account.create({
        user: admin._id,
        accountNumber: String(randomInt(1000000000, 10000000000)),
        accountName: `${firstName} ${lastName}`,
        currency: "NGN",
        balanceKobo: 0,
        isTest: true,
      });
    } catch (error) {
      await User.findByIdAndDelete(admin._id);
      throw error;
    }

    console.log(`Admin account created successfully for ${email}`);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
