import express from "express";

import {
  createWithdrawalRequest,
  getMyWithdrawalRequests,
} from "../controllers/withdrawalController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All withdrawal routes require authentication
router.use(protect);

// Create a withdrawal request
router.post("/", createWithdrawalRequest);

// Get customer's withdrawal history
router.get("/my-requests", getMyWithdrawalRequests);

export default router;
