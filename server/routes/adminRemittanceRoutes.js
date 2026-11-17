import express from "express";

import {
  getPendingRemittanceRequests,
  getRemittancePaymentReceipt,
  reviewRemittanceRequest,
} from "../controllers/adminRemittanceController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/pending", getPendingRemittanceRequests);

// Retrieve a submitted receipt for admin review.
router.get("/:id/payment-receipt", getRemittancePaymentReceipt);

router.patch("/:id/review", reviewRemittanceRequest);

export default router;
