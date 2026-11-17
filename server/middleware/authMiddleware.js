import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication configuration is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose) {
      return res.status(401).json({
        success: false,
        message: "Please complete PIN verification to continue.",
      });
    }

    const user = await User.findById(decoded.id).select(
      "_id firstName lastName email role accountStatus phoneNumber houseAddress city state zipCode country nextOfKinName nextOfKinRelationship nextOfKinPhone monthlySalary",
    );

    if (!user || user.accountStatus !== "active") {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or your account is inactive.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify your session.",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  next();
};
