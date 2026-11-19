import axios from "axios";

// Deliberately NOT using the shared `api` instance.
// The shared instance toggles the global loading overlay on every request,
// which would flash on every 4-second poll.
const chatApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const getConversation = () => chatApi.get("/chat/conversation");

export const sendMessage = (body) => chatApi.post("/chat/messages", { body });

export const pollMessages = (afterId) =>
  chatApi.get("/chat/messages", { params: afterId ? { after: afterId } : {} });

export const getUnreadCount = () => chatApi.get("/chat/unread-count");
