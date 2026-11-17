import express from "express";

import {
  getMyTransactions,
  getMyTransactionById,
} from "../controllers/transactionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyTransactions);
router.get("/:id", protect, getMyTransactionById);

export default router;
