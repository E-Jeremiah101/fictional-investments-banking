import express from "express";
import {
  createLoanApplication,
  getMyLoanApplications,
} from "../controllers/loanController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/my-applications", getMyLoanApplications);
router.post("/", createLoanApplication);

export default router;
