import express from "express";

import {
  getPendingATMCardRequests,
  getATMCardPaymentReceipt,
  reviewATMCardRequest,
} from "../controllers/adminATMCardController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated administrators can access these routes.
router.use(protect, adminOnly);

// Get ATM card requests waiting for admin review.
router.get("/pending", getPendingATMCardRequests);

// Retrieve a submitted receipt for admin review.
router.get("/:id/payment-receipt", getATMCardPaymentReceipt);

// Approve or reject an ATM card request.
router.patch("/:id/review", reviewATMCardRequest);

export default router;
