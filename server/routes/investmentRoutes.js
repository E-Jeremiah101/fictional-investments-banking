import express from "express";
import {
  getMyInvestments,
  requestTradingActivation,
} from "../controllers/investmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getMyInvestments);
router.post("/activate", requestTradingActivation);

export default router;
