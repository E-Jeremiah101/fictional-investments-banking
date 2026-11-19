import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },

    lastMessagePreview: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    unreadForUser: {
      type: Number,
      default: 0,
      min: 0,
    },

    unreadForAdmin: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

chatConversationSchema.index({ lastMessageAt: -1 });

const ChatConversation = mongoose.model(
  "ChatConversation",
  chatConversationSchema,
);

export default ChatConversation;
