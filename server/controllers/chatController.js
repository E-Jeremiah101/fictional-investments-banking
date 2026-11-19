import ChatConversation from "../models/ChatConversation.js";
import ChatMessage from "../models/ChatMessage.js";

const MAX_BODY_LENGTH = 2000;

const serializeMessage = (msg) => ({
  id: msg._id,
  body: msg.body,
  sender: msg.sender,
  senderRole: msg.senderRole,
  createdAt: msg.createdAt,
  readByUser: msg.readByUser,
  readByAdmin: msg.readByAdmin,
});

// GET /api/chat/conversation
export const getMyConversation = async (req, res) => {
  try {
    let conversation = await ChatConversation.findOne({
      user: req.user._id,
    });

    if (!conversation) {
      conversation = await ChatConversation.create({
        user: req.user._id,
        status: "open",
      });
    }

    const messages = await ChatMessage.find({
      conversation: conversation._id,
    })
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark admin messages as read for the user
    await ChatMessage.updateMany(
      {
        conversation: conversation._id,
        readByUser: false,
        senderRole: "admin",
      },
      { $set: { readByUser: true } },
    );

    if (conversation.unreadForUser > 0) {
      conversation.unreadForUser = 0;
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id,
        status: conversation.status,
        lastMessageAt: conversation.lastMessageAt,
      },
      messages: messages.map(serializeMessage),
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your conversation.",
    });
  }
};

// POST /api/chat/messages
export const sendMessage = async (req, res) => {
  try {
    const body = String(req.body.body || "").trim();

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty.",
      });
    }

    if (body.length > MAX_BODY_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_BODY_LENGTH} characters.`,
      });
    }

    let conversation = await ChatConversation.findOne({
      user: req.user._id,
    });

    if (!conversation) {
      conversation = await ChatConversation.create({
        user: req.user._id,
        status: "open",
      });
    }

    const message = await ChatMessage.create({
      conversation: conversation._id,
      sender: req.user._id,
      senderRole: "user",
      body,
      readByUser: true,
      readByAdmin: false,
    });

    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessagePreview = body.slice(0, 120);
    conversation.unreadForAdmin = (conversation.unreadForAdmin || 0) + 1;
    conversation.status = "open";
    await conversation.save();

    return res.status(201).json({
      success: true,
      message: serializeMessage(message),
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send your message.",
    });
  }
};

// GET /api/chat/messages?after=<messageId>
export const pollMessages = async (req, res) => {
  try {
    const conversation = await ChatConversation.findOne({
      user: req.user._id,
    });

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
        readMessageIds: [],
        unreadForUser: 0,
      });
    }

    const { after } = req.query;
    const query = { conversation: conversation._id };

    if (after) {
      const anchor = await ChatMessage.findById(after).select("createdAt");
      if (anchor) {
        query.createdAt = { $gt: anchor.createdAt };
      }
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 });

    // Mark new admin messages as read by the user
    const adminUnreadIds = messages
      .filter((m) => m.senderRole === "admin" && !m.readByUser)
      .map((m) => m._id);

    if (adminUnreadIds.length) {
      await ChatMessage.updateMany(
        { _id: { $in: adminUnreadIds } },
        { $set: { readByUser: true } },
      );
    }

    // Find user-sent messages the admin has now read (so we can show double-check)
    const newlyReadByAdmin = await ChatMessage.find({
      conversation: conversation._id,
      senderRole: "user",
      readByAdmin: true,
    }).select("_id");

    if (conversation.unreadForUser > 0) {
      conversation.unreadForUser = 0;
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      messages: messages.map(serializeMessage),
      // ids of user messages that the admin has read → frontend renders double-check
      readMessageIds: newlyReadByAdmin.map((m) => String(m._id)),
      unreadForUser: conversation.unreadForUser,
    });
  } catch (error) {
    console.error("Poll messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch new messages.",
    });
  }
};

// GET /api/chat/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const conversation = await ChatConversation.findOne({
      user: req.user._id,
    }).select("unreadForUser");

    return res.status(200).json({
      success: true,
      unread: conversation?.unreadForUser || 0,
    });
  } catch (error) {
    console.error("Unread count error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch unread count.",
    });
  }
};
