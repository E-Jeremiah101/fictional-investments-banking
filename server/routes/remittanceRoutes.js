import express from "express";

import {
  getMyRemittanceRequests,
  submitRemittanceEvidence,
} from "../controllers/remittanceController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadPaymentReceipt } from "../middleware/paymentReceiptUpload.js";

const router = express.Router();

router.use(protect);

// Get the logged-in customer's remittance requests
router.get("/my-requests", getMyRemittanceRequests);

// Submit simulated remittance evidence
router.post(
  "/:id/payment-evidence",
  uploadPaymentReceipt,
  submitRemittanceEvidence,
);

export default router;
