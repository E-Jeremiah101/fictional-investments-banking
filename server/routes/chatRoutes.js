import express from "express";
import {
  getMyConversation,
  sendMessage,
  pollMessages,
  getUnreadCount,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/conversation", protect, getMyConversation);
router.get("/messages", protect, pollMessages);
router.get("/unread-count", protect, getUnreadCount);
router.post("/messages", protect, sendMessage);

export default router;
