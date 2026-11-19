import axios from "axios";

const adminChatApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const listConversations = () =>
  adminChatApi.get("/admin/chat/conversations");

export const getConversation = (id) =>
  adminChatApi.get(`/admin/chat/conversations/${id}`);

export const sendAdminReply = (id, body) =>
  adminChatApi.post(`/admin/chat/conversations/${id}/messages`, { body });

export const getAdminUnreadCount = () =>
  adminChatApi.get("/admin/chat/unread-count");
