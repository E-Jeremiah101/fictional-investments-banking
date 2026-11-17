import express from "express";

import {
  getMyTaxPinRequests,
  submitTaxPinPaymentEvidence,
  verifyTaxPin,
} from "../controllers/taxPinController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadPaymentReceipt } from "../middleware/paymentReceiptUpload.js";

const router = express.Router();

// Only authenticated customers can access this route.
router.use(protect);

router.get("/my-requests", getMyTaxPinRequests);
router.post(
  "/payment-evidence",
  uploadPaymentReceipt,
  submitTaxPinPaymentEvidence,
);

// Verify the customer's tax PIN.
router.post("/verify", verifyTaxPin);

export default router;
