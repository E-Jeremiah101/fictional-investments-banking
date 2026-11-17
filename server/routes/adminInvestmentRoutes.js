import express from "express";
import {
  adjustInvestorEarnings,
  getAdminInvestors,
} from "../controllers/adminInvestmentController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/", getAdminInvestors);
router.post("/:id/earnings-adjustments", adjustInvestorEarnings);

export default router;
