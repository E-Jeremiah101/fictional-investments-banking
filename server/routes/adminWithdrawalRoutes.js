import express from "express";

import {
  getPendingWithdrawalRequests,
  reviewWithdrawalRequest,
} from "../controllers/withdrawalController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated administrators can access these routes.
router.use(protect, adminOnly);

// Get withdrawals waiting for final admin review.
router.get("/pending", getPendingWithdrawalRequests);

// Approve or reject a withdrawal.
router.patch("/:id/review", reviewWithdrawalRequest);

export default router;
