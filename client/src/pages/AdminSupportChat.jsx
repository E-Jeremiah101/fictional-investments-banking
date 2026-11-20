import { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  Search,
  Inbox,
  Circle,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

import {
  listConversations,
  getConversation,
  sendAdminReply,
  updateConversationStatus,
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

const formatShortTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const now = new Date();

  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
};

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "C";

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
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());

  const scrollRef = useRef(null);
  const activeRequestRef = useRef(0);

  // Load inbox conversations
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

    const interval = setInterval(loadList, 15000);

    return () => clearInterval(interval);
  }, []);

  // Load selected conversation
  const loadThread = async (id) => {
    const requestId = ++activeRequestRef.current;

    setLoadingThread(true);
    setThreadError("");
    setActiveConversation(null);
    setMessages([]);

    try {
      const res = await getConversation(id);

      if (requestId !== activeRequestRef.current) return;

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

      loadList();
    } catch (err) {
      if (requestId !== activeRequestRef.current) return;

      setThreadError(
        err.response?.data?.message || "Unable to load conversation.",
      );
    } finally {
      if (requestId === activeRequestRef.current) {
        setLoadingThread(false);
      }
    }
  };

  // Select conversation
  const handleSelect = (id) => {
    setActiveId(id);
    setDraft("");
    setReadIds(new Set());

    loadThread(id);
  };

  // Return to inbox on mobile
  const handleBack = () => {
    activeRequestRef.current++;
    setActiveId(null);
    setActiveConversation(null);
    setMessages([]);
    setDraft("");
    setThreadError("");
  };

  // Poll active conversation
  useEffect(() => {
    if (!activeId) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await getConversation(activeId);

        if (cancelled) return;

        const incoming = res.data.messages || [];

        if (res.data.readMessageIds?.length) {
          setReadIds((prev) => {
            const next = new Set(prev);

            for (const id of res.data.readMessageIds) {
              next.add(id);
            }

            return next;
          });
        }

        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const merged = [...prev];

          for (const m of incoming) {
            if (!existing.has(m.id)) {
              merged.push(m);
            }
          }

          return merged;
        });

        if (res.data.conversation?.status) {
          setActiveConversation((prev) =>
            prev
              ? {
                  ...prev,
                  status: res.data.conversation.status,
                }
              : prev,
          );
        }
      } catch {
        // Ignore temporary polling errors
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeId]);

  // Auto-scroll messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingThread]);

  // Send reply
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

  // Open or close conversation
  const handleToggleStatus = async () => {
    if (!activeId || !activeConversation || statusUpdating) {
      return;
    }

    const nextStatus =
      activeConversation.status === "closed" ? "open" : "closed";

    setStatusUpdating(true);
    setThreadError("");

    try {
      const res = await updateConversationStatus(activeId, nextStatus);

      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              status: res.data.conversation.status,
            }
          : prev,
      );

      loadList();
    } catch (err) {
      setThreadError(err.response?.data?.message || "Unable to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Search inbox
  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;

    const q = search.trim().toLowerCase();

    return (
      (c.user?.name || "").toLowerCase().includes(q) ||
      (c.user?.email || "").toLowerCase().includes(q) ||
      (c.lastMessagePreview || "").toLowerCase().includes(q)
    );
  });

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadForAdmin || 0),
    0,
  );

  const isClosed = activeConversation?.status === "closed";

  return (
    <div className="fixed inset-0 z-[100] grid h-[100vh] w-screen  overflow-hidden bg-white lg:grid-cols-[340px_minmax(0,1fr)] lg:grid-rows-1 lg:gap-3 lg:bg-slate-100 lg:p-3">
      {/* INBOX */}
      <aside
        className={`min-h-0 flex-col overflow-hidden border-b border-slate-200 bg-white lg:flex lg:rounded-2xl lg:border lg:shadow-sm ${
          activeId ? "hidden" : "flex"
        }`}
      >
        {/* Inbox header */}
        <div className="shrink-0 border-b border-slate-100 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Inbox size={20} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Customer Support
                </h3>

                <p className="text-[11px] text-slate-500">
                  {conversations.length} conversations
                  {totalUnread > 0 && (
                    <span className="ml-1 text-rose-600">
                      · {totalUnread} unread
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadList}
              title="Refresh inbox"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          {loadingList && (
            <div className="flex justify-center py-10">
              <Loader2 size={22} className="animate-spin text-slate-400" />
            </div>
          )}

          {listError && (
            <p className="p-4 text-xs text-rose-600">{listError}</p>
          )}

          {!loadingList && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <Inbox size={30} className="mb-3 text-slate-300" />

              <p className="text-sm font-semibold text-slate-700">
                {search ? "No matching conversations" : "No conversations yet"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Customer messages will appear here.
              </p>
            </div>
          )}

          <ul className="divide-y divide-slate-100">
            {filtered.map((c) => {
              const active = activeId === c.id;
              const unread = c.unreadForAdmin > 0;

              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`relative flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                      active ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-blue-600" />
                    )}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        unread
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {initialsOf(c.user?.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            unread
                              ? "font-bold text-slate-900"
                              : "font-semibold text-slate-800"
                          }`}
                        >
                          {c.user?.name || "Customer"}
                        </span>

                        <span className="shrink-0 text-[10px] text-slate-400">
                          {formatShortTime(c.lastMessageAt)}
                        </span>
                      </div>

                      <p className="truncate text-[11px] text-slate-500">
                        {c.user?.email}
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-slate-500">
                          {c.lastMessagePreview || "No messages yet"}
                        </span>

                        {unread ? (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                            {c.unreadForAdmin > 9 ? "9+" : c.unreadForAdmin}
                          </span>
                        ) : c.status === "closed" ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                            Closed
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* CHAT WINDOW */}
      <section
        className={`min-h-0 flex-col overflow-hidden bg-white lg:flex lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm ${
          activeId ? "flex" : "hidden"
        }`}
      >
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MessageCircle size={45} className="mb-4 text-blue-500" />

            <h3 className="text-base font-bold text-slate-900">
              Welcome to Customer Support
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Select a customer conversation to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                  title="Back to inbox"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {initialsOf(activeConversation?.user?.name)}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {activeConversation?.user?.name || "Customer"}
                  </h3>

                  <p className="truncate text-xs text-slate-500">
                    {activeConversation?.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${
                    isClosed
                      ? "bg-slate-100 text-slate-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <Circle size={7} fill="currentColor" />

                  {isClosed ? "Closed" : "Online / Open"}
                </span>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={statusUpdating || loadingThread}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                    isClosed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {statusUpdating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isClosed ? (
                    <RotateCcw size={14} />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}

                  <span className="hidden sm:inline">
                    {isClosed ? "Reopen" : "Close"}
                  </span>
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-8 sm:py-7"
            >
              {loadingThread && (
                <div className="flex h-full items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-blue-600" />
                </div>
              )}

              {!loadingThread && messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageCircle size={35} className="mb-3 text-slate-300" />

                  <p className="text-sm font-semibold text-slate-700">
                    No messages yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Send a message to start the conversation.
                  </p>
                </div>
              )}

              {!loadingThread &&
                messages.map((m) => {
                  const mine = m.senderRole === "admin";

                  return (
                    <div
                      key={m.id}
                      className={`flex ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[70%] ${
                          mine
                            ? "rounded-br-md bg-[#0b3b8c] text-white"
                            : "rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {m.body}
                        </p>

                        <p
                          className={`mt-2 flex items-center justify-end gap-1 text-[10px] ${
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

            {/* Error notification */}
            {threadError && (
              <div className="shrink-0 border-t border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-700">
                {threadError}
              </div>
            )}

            {/* Message input */}
            {isClosed ? (
              <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 py-5 text-center">
                <p className="text-xs font-medium text-slate-500">
                  This conversation is closed.
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Reopen the conversation to send a reply.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSend}
                className="shrink-0 border-t border-slate-100 bg-white p-3 sm:p-5"
              >
                <div className="mx-auto flex max-w-5xl items-end gap-3">
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
                    placeholder="Type your message..."
                    className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0b3b8c] focus:bg-white focus:ring-2 focus:ring-[#0b3b8c]/15"
                  />

                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0b3b8c] text-white transition hover:bg-[#0a3478] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 size={19} className="animate-spin" />
                    ) : (
                      <Send size={19} />
                    )}
                  </button>
                </div>

                <p className="mx-auto mt-2 max-w-5xl text-[10px] text-slate-400">
                  Press Enter to send. Shift + Enter for a new line.
                </p>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}
