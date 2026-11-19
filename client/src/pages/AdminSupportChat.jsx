import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Loader2, Search } from "lucide-react";
import {
  listConversations,
  getConversation,
  sendAdminReply,
  getAdminUnreadCount,
} from "../services/adminChatService";
import MessageStatus from "../components/MessageStatus";

const POLL_INTERVAL = 5000;

const formatTime = (date) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminSupportChat() {
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");

  const [activeId, setActiveId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());

  const lastMessageIdRef = useRef(null);
  const scrollRef = useRef(null);

  // Load list + poll every 15s
  const loadList = async () => {
    try {
      setListError("");
      const res = await listConversations();
      setConversations(res.data.conversations || []);
    } catch (err) {
      setListError(
        err.response?.data?.message || "Unable to load conversations.",
      );
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadList();
    const id = setInterval(loadList, 15000);
    return () => clearInterval(id);
  }, []);

  // Load thread
  const loadThread = async (id) => {
    setLoadingThread(true);
    setThreadError("");
    try {
      const res = await getConversation(id);
      const msgs = res.data.messages || [];
      setActiveConversation(res.data.conversation);
      setMessages(msgs);
      setReadIds(
        new Set(
          msgs
            .filter((m) => m.senderRole === "admin" && m.readByUser)
            .map((m) => m.id),
        ),
      );
      lastMessageIdRef.current = msgs.length ? msgs[msgs.length - 1].id : null;
      loadList();
    } catch (err) {
      setThreadError(
        err.response?.data?.message || "Unable to load conversation.",
      );
    } finally {
      setLoadingThread(false);
    }
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setDraft("");
    setReadIds(new Set());
    loadThread(id);
  };

  // Poll active thread
  useEffect(() => {
    if (!activeId) return;
    const poll = async () => {
      try {
        const res = await getConversation(activeId);
        const incoming = res.data.messages || [];

        if (res.data.readMessageIds?.length) {
          setReadIds((prev) => {
            const next = new Set(prev);
            for (const id of res.data.readMessageIds) next.add(id);
            return next;
          });
        }

        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const merged = [...prev];
          for (const m of incoming) {
            if (!existing.has(m.id)) merged.push(m);
          }
          return merged;
        });
        if (incoming.length) {
          lastMessageIdRef.current = incoming[incoming.length - 1].id;
        }
      } catch {
        /* silent */
      }
    };
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [activeId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending || !activeId) return;

    setSending(true);
    setThreadError("");
    try {
      const res = await sendAdminReply(activeId, body);
      setMessages((prev) => [...prev, res.data.message]);
      setDraft("");
      loadList();
    } catch (err) {
      setThreadError(err.response?.data?.message || "Unable to send reply.");
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (c.user?.name || "").toLowerCase().includes(q) ||
      (c.user?.email || "").toLowerCase().includes(q) ||
      (c.lastMessagePreview || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <aside className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <MessageCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Support inbox
              </h3>
              <p className="text-[11px] text-slate-500">
                {conversations.length} conversation
                {conversations.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="relative mt-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="max-h-[60vh] flex-1 overflow-y-auto">
          {loadingList && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          )}

          {listError && (
            <p className="p-4 text-xs text-rose-600">{listError}</p>
          )}

          {!loadingList && !filtered.length && (
            <p className="p-4 text-xs text-slate-500">No conversations yet.</p>
          )}

          <ul>
            {filtered.map((c) => {
              const active = activeId === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`flex w-full flex-col gap-1 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      active ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        {c.unreadForAdmin > 0 && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                        )}
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {c.user?.name || "Customer"}
                        </span>
                      </div>
                      {c.unreadForAdmin > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                          {c.unreadForAdmin > 9 ? "9+" : c.unreadForAdmin}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-[11px] text-slate-500">
                      {c.user?.email}
                    </span>
                    <span className="truncate text-xs text-slate-600">
                      {c.lastMessagePreview || "No messages yet"}
                    </span>
                    {c.lastMessageAt && (
                      <span className="text-[10px] text-slate-400">
                        {formatTime(c.lastMessageAt)}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Thread */}
      <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <MessageCircle size={26} />
            </div>
            <p className="text-sm font-semibold text-slate-900">
              Select a conversation
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Choose a customer from the inbox to view and reply.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {activeConversation?.user?.name || "Customer"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {activeConversation?.user?.email}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  activeConversation?.status === "closed"
                    ? "bg-slate-100 text-slate-600"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {activeConversation?.status === "closed" ? "Closed" : "Open"}
              </span>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4"
            >
              {loadingThread && (
                <div className="flex h-full items-center justify-center">
                  <Loader2 size={22} className="animate-spin text-slate-400" />
                </div>
              )}

              {!loadingThread && messages.length === 0 && (
                <p className="text-center text-xs text-slate-500">
                  No messages yet.
                </p>
              )}

              {messages.map((m) => {
                const mine = m.senderRole === "admin";
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                        mine
                          ? "rounded-br-sm bg-[#0b3b8c] text-white"
                          : "rounded-bl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {m.body}
                      </p>
                      <p
                        className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                          mine ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {formatTime(m.createdAt)}
                        {mine && <MessageStatus read={readIds.has(m.id)} />}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {threadError && (
              <div className="border-t border-rose-100 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                {threadError}
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="border-t border-slate-100 bg-white p-3"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Type your reply…"
                  className="max-h-24 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#0b3b8c] focus:bg-white focus:ring-2 focus:ring-[#0b3b8c]/15"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b3b8c] text-white transition hover:bg-[#0a3478] disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
