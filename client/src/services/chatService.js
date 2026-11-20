import api from "./axios.js";

export const getConversation = () => api.get("/chat/conversation");

export const sendMessage = (body) => api.post("/chat/messages", { body });

export const pollMessages = (afterId) =>
  api.get("/chat/messages", { params: afterId ? { after: afterId } : {} });

export const getUnreadCount = () => api.get("/chat/unread-count");
