import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import User from "../models/User.js";
import Account from '../models/Account.js';
import {randomInt} from 'node:crypto';



const generateAccountNumber = () => {
  return String(randomInt(1000000000, 10000000000));
};

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the .env file");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const createPinChallengeToken = (userId, purpose) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the .env file");
  }

  return jwt.sign(
    { id: userId, purpose },
    process.env.JWT_SECRET,
    { expiresIn: "5m" },
  );
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      transactionPin,
      phoneNumber,
      houseAddress,
      city,
      state,
      zipCode,
      country,
      nextOfKinName,
      nextOfKinRelationship,
      nextOfKinPhone,
      monthlySalary,
      accountType,
      accountCategory,
    } = req.body;
    const requiredTextFields = [
      firstName,
      lastName,
      email,
      phoneNumber,
      houseAddress,
      city,
      state,
      zipCode,
      country,
      nextOfKinName,
      nextOfKinRelationship,
      nextOfKinPhone,
    ];

    if (
      requiredTextFields.some(
        (value) => typeof value !== "string" || !value.trim(),
      ) ||
      typeof password !== "string" ||
      !password ||
      typeof transactionPin !== "string" ||
      !/^\d{4}$/.test(transactionPin) ||
      typeof monthlySalary !== "number" ||
      !Number.isFinite(monthlySalary) ||
      monthlySalary < 0 ||
      !["checking", "savings"].includes(accountType) ||
      !["personal", "student", "business"].includes(accountCategory)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const transactionPinSalt = crypto.randomBytes(16).toString("hex");
    const transactionPinHash = crypto
      .scryptSync(transactionPin, transactionPinSalt, 64)
      .toString("hex");


    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      transactionPinHash,
      transactionPinSalt,
      role: "customer",
      phoneNumber: phoneNumber.trim(),
      houseAddress: houseAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      country: country.trim(),
      nextOfKinName: nextOfKinName.trim(),
      nextOfKinRelationship: nextOfKinRelationship.trim(),
      nextOfKinPhone: nextOfKinPhone.trim(),
      monthlySalary,
    });

    try {
      await Account.create({
        user: user._id,
        accountNumber: generateAccountNumber(),
        accountName: `${user.firstName} ${user.lastName}`,
        accountType,
        accountCategory,
        currency: "USD",
        balanceCents: 0,
        isTest: true,
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    } 

    const token = createToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { 
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create account at this time.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password +transactionPinHash +transactionPinSalt");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is currently suspended.",
      });
    }

    const pinSetupRequired =
      !user.transactionPinHash || !user.transactionPinSalt;
    const challengeToken = createPinChallengeToken(
      user._id,
      pinSetupRequired ? "transaction_pin_setup" : "transaction_pin",
    );

    return res.status(200).json({
      success: true,
      message: pinSetupRequired
        ? "Password verified. Create a transaction PIN to continue."
        : "Password verified. Enter your transaction PIN.",
      challengeToken,
      pinSetupRequired,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in at this time.",
    });
  }
};

export const verifyTransactionPin = async (req, res) => {
  const { challengeToken, pin } = req.body;

  if (
    typeof challengeToken !== "string" ||
    typeof pin !== "string" ||
    !/^\d{4}$/.test(pin)
  ) {
    return res.status(400).json({
      success: false,
      message: "Please enter your four-digit transaction PIN.",
    });
  }

  let challenge;
  try {
    challenge = jwt.verify(challengeToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your login session has expired. Please log in again.",
    });
  }

  const isPinSetup = challenge?.purpose === "transaction_pin_setup";
  const isPinVerification = challenge?.purpose === "transaction_pin";
  if (
    typeof challenge !== "object" ||
    (!isPinSetup && !isPinVerification) ||
    !challenge.id
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid login session. Please log in again.",
    });
  }

  try {
    const user = await User.findById(challenge.id).select(
      "+transactionPinHash +transactionPinSalt +transactionPinAttempts +transactionPinLockedUntil",
    );

    if (!user || user.accountStatus !== "active") {
      return res.status(401).json({
        success: false,
        message: "Unable to verify your login. Please start again.",
      });
    }

    if (isPinSetup) {
      if (user.transactionPinHash && user.transactionPinSalt) {
        return res.status(401).json({
          success: false,
          message: "Invalid login session. Please log in again.",
        });
      }

      user.transactionPinSalt = crypto.randomBytes(16).toString("hex");
      user.transactionPinHash = crypto
        .scryptSync(pin, user.transactionPinSalt, 64)
        .toString("hex");
      user.transactionPinAttempts = 0;
      user.transactionPinLockedUntil = null;
      await user.save();
    } else {
      if (!user.transactionPinHash || !user.transactionPinSalt) {
        return res.status(409).json({
          success: false,
          message:
            "A transaction PIN is not configured for this account. Please contact support.",
        });
      }

      const now = new Date();
      if (user.transactionPinLockedUntil > now) {
        return res.status(423).json({
          success: false,
          message: "Too many incorrect PIN attempts. Please try again later.",
        });
      }

      if (user.transactionPinLockedUntil) {
        user.transactionPinAttempts = 0;
        user.transactionPinLockedUntil = null;
      }

      const submittedHash = crypto
        .scryptSync(pin, user.transactionPinSalt, 64)
        .toString("hex");
      const submittedBuffer = Buffer.from(submittedHash, "hex");
      const storedBuffer = Buffer.from(user.transactionPinHash, "hex");
      const isCorrect =
        submittedBuffer.length === storedBuffer.length &&
        crypto.timingSafeEqual(submittedBuffer, storedBuffer);

      if (!isCorrect) {
        user.transactionPinAttempts += 1;
        if (user.transactionPinAttempts >= 5) {
          user.transactionPinLockedUntil = new Date(
            Date.now() + 15 * 60 * 1000,
          );
          await user.save();

          return res.status(423).json({
            success: false,
            message: "Too many incorrect PIN attempts. Please try again later.",
          });
        }

        await user.save();
        return res.status(401).json({
          success: false,
          message: "Incorrect transaction PIN.",
        });
      }

      user.transactionPinAttempts = 0;
      user.transactionPinLockedUntil = null;
      await user.save();
    }

    if (!user.transactionPinHash || !user.transactionPinSalt) {
      return res.status(409).json({
        success: false,
        message: "Unable to save the transaction PIN. Please try again.",
      });
    }

    const token = createToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Transaction PIN verification error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to verify your PIN at this time.",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      !currentPassword ||
      typeof newPassword !== "string" ||
      !newPassword ||
      typeof confirmPassword !== "string" ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirmation are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Your current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to change your password at this time.",
    });
  }
};

export const changeTransactionPin = async (req, res) => {
  try {
    const { currentPassword, newPin, confirmPin } = req.body;

    if (
      typeof currentPassword !== "string" ||
      !currentPassword ||
      typeof newPin !== "string" ||
      !/^\d{4}$/.test(newPin) ||
      typeof confirmPin !== "string" ||
      !/^\d{4}$/.test(confirmPin)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 4-digit transaction PIN and your current password.",
      });
    }

    if (newPin !== confirmPin) {
      return res.status(400).json({
        success: false,
        message: "Transaction PIN and confirmation do not match.",
      });
    }

    const user = await User.findById(req.user._id).select(
      "+password +transactionPinHash +transactionPinSalt",
    );

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Your current password is incorrect.",
      });
    }

    user.transactionPinSalt = crypto.randomBytes(16).toString("hex");
    user.transactionPinHash = crypto
      .scryptSync(newPin, user.transactionPinSalt, 64)
      .toString("hex");
    user.transactionPinAttempts = 0;
    user.transactionPinLockedUntil = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Transaction PIN updated successfully.",
    });
  } catch (error) {
    console.error("Change transaction PIN error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update your transaction PIN at this time.",
    });
  }
};

export const getAdmin = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      accountStatus: req.user.accountStatus,
      phoneNumber: req.user.phoneNumber,
      houseAddress: req.user.houseAddress,
      city: req.user.city,
      state: req.user.state,
      zipCode: req.user.zipCode,
      country: req.user.country,
      nextOfKinName: req.user.nextOfKinName,
      nextOfKinRelationship: req.user.nextOfKinRelationship,
      nextOfKinPhone: req.user.nextOfKinPhone,
      monthlySalary: req.user.monthlySalary,
    },
  });
};
