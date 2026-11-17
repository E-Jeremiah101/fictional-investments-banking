import express from "express";

import {
  getTaxPinPaymentReceipt,
  generateTaxPin,
  getWithdrawalsReadyForTaxPin,
  reviewTaxPinPayment,
} from "../controllers/adminTaxPinController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated administrators can access these routes.
router.use(protect, adminOnly);

// Get approved ATM withdrawals waiting for a Tax PIN.
router.get("/pending", getWithdrawalsReadyForTaxPin);

router.get("/:id/payment-receipt", getTaxPinPaymentReceipt);
router.patch("/:id/review", reviewTaxPinPayment);

// Generate a tax PIN for a withdrawal request.
router.post("/generate", generateTaxPin);

export default router;
