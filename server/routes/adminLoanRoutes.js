import express from "express";
import {
  downloadLoanApplicationImage,
  getPendingLoanApplications,
  reviewLoanApplication,
} from "../controllers/adminLoanController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/pending", getPendingLoanApplications);
router.get("/:id/image/:field", downloadLoanApplicationImage);
router.patch("/:id/review", reviewLoanApplication);

export default router;