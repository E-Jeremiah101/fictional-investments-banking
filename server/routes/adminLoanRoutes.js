import express from "express";
import {
  getPendingLoanApplications,
  reviewLoanApplication,
} from "../controllers/adminLoanController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/pending", getPendingLoanApplications);
router.patch("/:id/review", reviewLoanApplication);

export default router;
