import express from "express";
import {
  getDepositPaymentReceipt,
  getPendingDeposits,
  reviewDeposit,
} from "../controllers/adminDepositController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/pending", getPendingDeposits);
router.get("/:id/payment-receipt", getDepositPaymentReceipt);
router.patch("/:id/review", reviewDeposit);

export default router;
