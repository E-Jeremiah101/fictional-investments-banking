import express from "express";
import {
  register,
  login,
  verifyTransactionPin,
  logout,
  changePassword,
  changeTransactionPin,
  getAdmin,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-transaction-pin", verifyTransactionPin);
router.post("/logout", logout);
router.post("/change-password", protect, changePassword);
router.post("/change-transaction-pin", protect, changeTransactionPin);

router.get("/me", protect, getAdmin);

export default router;
