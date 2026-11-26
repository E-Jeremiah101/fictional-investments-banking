import express from "express";
import {
  createLoanApplication,
  getMyLoanApplications,
} from "../controllers/loanController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/my-applications", getMyLoanApplications);
router.post(
  "/",
  upload.fields([
    { name: "governmentId", maxCount: 1 },
    { name: "atmCardFront", maxCount: 1 },
    { name: "atmCardBack", maxCount: 1 },
  ]),
  createLoanApplication,
);

export default router;