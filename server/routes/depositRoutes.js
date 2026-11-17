import express from "express";

import {
  createDepositRequest,
  getMyDepositRequests,
} from "../controllers/depositController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadPaymentReceipt } from "../middleware/paymentReceiptUpload.js";

const router = express.Router();

router.use(protect);

router.post("/", uploadPaymentReceipt, createDepositRequest);
router.get("/my-requests", getMyDepositRequests);

export default router;
