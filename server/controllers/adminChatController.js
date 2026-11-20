import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";

const serializeMessage = (msg) => ({
  id: msg._id,
  body: msg.body,
  sender: msg.sender,
  senderRole: msg.senderRole,
  createdAt: msg.createdAt,
  readByUser: msg.readByUser,
  readByAdmin: msg.readByAdmin,
});

// GET /api/admin/chat/conversations
export const listConversations = async (req, res) => {
  try {
    const conversations = await ChatConversation.find({})
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("user", "firstName lastName email");

    return res.status(200).json({
      success: true,
      conversations: conversations.map((c) => ({
        id: c._id,
        status: c.status,
        lastMessageAt: c.lastMessageAt,
        lastMessagePreview: c.lastMessagePreview,
        unreadForAdmin: c.unreadForAdmin || 0,
        user: c.user
          ? {
              id: c.user._id,
              name:
                [c.user.firstName, c.user.lastName].filter(Boolean).join(" ") ||
                "Customer",
              email: c.user.email,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Admin list conversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load conversations.",
    });
  }
};

// GET /api/admin/chat/conversations/:id
export const getConversation = async (req, res) => {
  try {
    const conversation = await ChatConversation.findById(
      req.params.id,
    ).populate("user", "firstName lastName email");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const messages = await ChatMessage.find({
      conversation: conversation._id,
    }).sort({ createdAt: 1 });

    // Mark user messages as read by admin
    await ChatMessage.updateMany(
      {
        conversation: conversation._id,
        readByAdmin: false,
        senderRole: "user",
      },
      { $set: { readByAdmin: true } },
    );

    const userReadAdminMessages = await ChatMessage.find({
      conversation: conversation._id,
      senderRole: "admin",
      readByUser: true,
    }).select("_id");

    if (conversation.unreadForAdmin > 0) {
      conversation.unreadForAdmin = 0;
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id,
        status: conversation.status,
        lastMessageAt: conversation.lastMessageAt,
        user: conversation.user
          ? {
              id: conversation.user._id,
              name:
                [conversation.user.firstName, conversation.user.lastName]
                  .filter(Boolean)
                  .join(" ") || "Customer",
              email: conversation.user.email,
            }
          : null,
      },
      messages: messages.map(serializeMessage),
      readMessageIds: userReadAdminMessages.map((m) => String(m._id)),
    });
  } catch (error) {
    console.error("Admin get conversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load conversation.",
    });
  }
};

// POST /api/admin/chat/conversations/:id/messages
export const sendAdminReply = async (req, res) => {
  try {
    const body = String(req.body.body || "").trim();

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (body.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters.",
      });
    }

    const conversation = await ChatConversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const message = await ChatMessage.create({
      conversation: conversation._id,
      sender: req.user._id,
      senderRole: "admin",
      body,
      readByUser: false,
      readByAdmin: true,
    });

    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessagePreview = body.slice(0, 120);
    conversation.unreadForUser = (conversation.unreadForUser || 0) + 1;
    await conversation.save();

    return res.status(201).json({
      success: true,
      message: serializeMessage(message),
    });
  } catch (error) {
    console.error("Admin send reply error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send reply.",
    });
  }
};

// GET /api/admin/chat/unread-count
export const getAdminUnreadCount = async (req, res) => {
  try {
    const conversations = await ChatConversation.find({}).select(
      "unreadForAdmin",
    );
    const unread = conversations.reduce(
      (sum, c) => sum + (c.unreadForAdmin || 0),
      0,
    );
    return res.status(200).json({ success: true, unread });
  } catch (error) {
    console.error("Admin unread count error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch unread count.",
    });
  }
};

// PATCH /api/admin/chat/conversations/:id/status
export const updateConversationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'open' or 'closed'.",
      });
    }

    const conversation = await ChatConversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    conversation.status = status;
    await conversation.save();

    return res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id,
        status: conversation.status,
        lastMessageAt: conversation.lastMessageAt,
      },
    });
  } catch (error) {
    console.error("Update conversation status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update conversation status.",
    });
  }
};
