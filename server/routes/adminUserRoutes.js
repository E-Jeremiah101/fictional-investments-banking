import express from "express";
import {
  adjustAdminUserBalance,
  deactivateAdminUser,
  getAdminUserDetails,
  getAdminUsers,
} from "../controllers/adminUserController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/", getAdminUsers);
router.get("/:id", getAdminUserDetails);
router.post("/:id/balance-adjustments", adjustAdminUserBalance);
router.delete("/:id", deactivateAdminUser);

export default router;
