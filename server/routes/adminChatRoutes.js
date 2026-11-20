import express from "express";
import {
  listConversations,
  getConversation,
  sendAdminReply,
  getAdminUnreadCount,
  updateConversationStatus,
} from "../controllers/adminChatController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/conversations", listConversations);
router.get("/conversations/:id", getConversation);
router.post("/conversations/:id/messages", sendAdminReply);
router.patch("/conversations/:id/status", updateConversationStatus);
router.get("/unread-count", getAdminUnreadCount);

export default router;
