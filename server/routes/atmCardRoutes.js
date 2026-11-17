import express from "express";

import {
  createATMCardRequest,
  submitATMCardPayment,
  getMyATMCardRequests,
} from "../controllers/atmCardController.js";

import { protect } from "../middleware/authMiddleware.js";
import { uploadPaymentReceipt } from "../middleware/paymentReceiptUpload.js";

const router = express.Router();

router.use(protect);

// Create an ATM card request.
router.post("/", createATMCardRequest);

// Submit simulated payment evidence.
router.post("/:id/payment", uploadPaymentReceipt, submitATMCardPayment);

// Get the logged-in customer's ATM card requests.
router.get("/my-requests", getMyATMCardRequests);

export default router;
