import express from "express";
import {
  getPaymentInstructions,
  updatePaymentInstructions,
} from "../controllers/paymentInstructionsController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPaymentInstructions);
router.put("/", protect, adminOnly, updatePaymentInstructions);

export default router;
