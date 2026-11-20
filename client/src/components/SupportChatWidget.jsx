// import { useEffect, useRef, useState } from "react";
// import { MessageCircle, X, Send, Loader2 } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import {
//   getConversation,
//   sendMessage as sendMessageApi,
//   pollMessages,
//   getUnreadCount,
// } from "../services/chatService";
// import MessageStatus from "./MessageStatus";

// const POLL_INTERVAL = 4000;

// export default function SupportChatWidget() {
//   const { user, loading } = useAuth();
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [draft, setDraft] = useState("");
//   const [sending, setSending] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [unread, setUnread] = useState(0);
//   const [readIds, setReadIds] = useState(() => new Set());

//   const scrollRef = useRef(null);
//   const lastMessageIdRef = useRef(null);
//   const intervalRef = useRef(null);

//   // Poll unread count even when panel is closed
//   useEffect(() => {
//     if (loading || !user) return;
//     let cancelled = false;

//     const fetchUnread = async () => {
//       try {
//         const res = await getUnreadCount();
//         if (!cancelled) setUnread(res.data.unread || 0);
//       } catch {
//         /* silent */
//       }
//     };

//     fetchUnread();
//     const id = setInterval(fetchUnread, 10000);
//     return () => {
//       cancelled = true;
//       clearInterval(id);
//     };
//   }, [user, loading]);

//   // Load full conversation when panel opens
//   useEffect(() => {
//     if (!open || loading || !user) return;

//     let cancelled = false;
//     setInitialLoading(true);
//     setError("");

//     const load = async () => {
//       try {
//         const res = await getConversation();
//         if (cancelled) return;
//         const msgs = res.data.messages || [];
//         setMessages(msgs);
//         setReadIds(
//           new Set(
//             msgs
//               .filter((m) => m.senderRole === "user" && m.readByAdmin)
//               .map((m) => m.id),
//           ),
//         );
//         lastMessageIdRef.current = msgs.length
//           ? msgs[msgs.length - 1].id
//           : null;
//         setUnread(0);
//       } catch (err) {
//         if (!cancelled) {
//           setError(
//             err.response?.data?.message || "Unable to load your conversation.",
//           );
//         }
//       } finally {
//         if (!cancelled) setInitialLoading(false);
//       }
//     };

//     load();

//     return () => {
//       cancelled = true;
//     };
//   }, [open, user, loading]);

//   // Poll for new messages + read receipts while open
//   useEffect(() => {
//     if (!open || loading || !user) return;

//     const poll = async () => {
//       try {
//         const res = await pollMessages(lastMessageIdRef.current);
//         const incoming = res.data.messages || [];

//         if (res.data.readMessageIds?.length) {
//           setReadIds((prev) => {
//             const next = new Set(prev);
//             for (const id of res.data.readMessageIds) next.add(id);
//             return next;
//           });
//         }

//         if (incoming.length) {
//           setMessages((prev) => {
//             const existing = new Set(prev.map((m) => m.id));
//             const merged = [...prev];
//             for (const m of incoming) {
//               if (!existing.has(m.id)) merged.push(m);
//             }
//             return merged;
//           });
//           lastMessageIdRef.current = incoming[incoming.length - 1].id;
//         }
//       } catch {
//         /* silent — retry next tick */
//       }
//     };

//     intervalRef.current = setInterval(poll, POLL_INTERVAL);
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     };
//   }, [open, user, loading]);

//   // Auto-scroll to bottom
//   useEffect(() => {
//     if (!open || !scrollRef.current) return;
//     scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//   }, [messages, open]);

//   // Close on Escape
//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e) => {
//       if (e.key === "Escape") setOpen(false);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     const body = draft.trim();
//     if (!body || sending) return;

//     setSending(true);
//     setError("");

//     try {
//       const res = await sendMessageApi(body);
//       const msg = res.data.message;
//       setMessages((prev) => [...prev, msg]);
//       lastMessageIdRef.current = msg.id;
//       setDraft("");
//     } catch (err) {
//       setError(err.response?.data?.message || "Unable to send your message.");
//     } finally {
//       setSending(false);
//     }
//   };

//   if (loading || !user) return null;

//   return (
//     <>
//       {/* Sticky floating bubble */}
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         aria-label={open ? "Close support chat" : "Open support chat"}
//         className="fixed bottom-25 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0b3b8c] text-white shadow-xl shadow-[#0b3b8c]/30 transition hover:bg-[#0a3478] active:scale-95"
//       >
//         {open ? <X size={22} /> : <MessageCircle size={22} />}
//         {!open && unread > 0 && (
//           <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
//             {unread > 9 ? "9+" : unread}
//           </span>
//         )}
//       </button>

//       {/* Chat panel */}
//       {open && (
//         <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-5">
//           {/* Header */}
//           <div className="flex items-center justify-between border-b border-slate-100 bg-[#0b3b8c] px-4 py-3 text-white">
//             <div className="flex items-center gap-2">
//               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
//                 <MessageCircle size={16} />
//               </div>
//               <div className="leading-tight">
//                 <p className="text-sm font-semibold">Support</p>
//                 <p className="text-[11px] text-blue-200">
//                   Our team will respond shortly
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={() => setOpen(false)}
//               aria-label="Close chat"
//               className="rounded-lg p-1.5 transition hover:bg-white/10"
//             >
//               <X size={18} />
//             </button>
//           </div>

//           {/* Messages */}
//           <div
//             ref={scrollRef}
//             className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4"
//           >
//             {initialLoading && (
//               <div className="flex h-full items-center justify-center">
//                 <Loader2 size={24} className="animate-spin text-slate-400" />
//               </div>
//             )}

//             {!initialLoading && messages.length === 0 && (
//               <div className="flex h-full flex-col items-center justify-center px-6 text-center">
//                 <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//                   <MessageCircle size={22} />
//                 </div>
//                 <p className="text-sm font-medium text-slate-800">
//                   Start a conversation
//                 </p>
//                 <p className="mt-1 text-xs text-slate-500">
//                   Send us a message and our support team will reply here.
//                 </p>
//               </div>
//             )}

//             {messages.map((m) => {
//               const mine = m.senderRole === "user";
//               return (
//                 <div
//                   key={m.id}
//                   className={`flex ${mine ? "justify-end" : "justify-start"}`}
//                 >
//                   <div
//                     className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
//                       mine
//                         ? "rounded-br-sm bg-[#0b3b8c] text-white"
//                         : "rounded-bl-sm bg-white text-slate-800 shadow-sm ring-1 ring-slate-100"
//                     }`}
//                   >
//                     <p className="whitespace-pre-wrap break-words">{m.body}</p>
//                     <p
//                       className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
//                         mine ? "text-blue-200" : "text-slate-400"
//                       }`}
//                     >
//                       {new Date(m.createdAt).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                       {mine && <MessageStatus read={readIds.has(m.id)} />}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {error && (
//             <div className="border-t border-rose-100 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
//               {error}
//             </div>
//           )}

//           {/* Input */}
//           <form
//             onSubmit={handleSend}
//             className="border-t border-slate-100 bg-white p-2.5"
//           >
//             <div className="flex items-end gap-2">
//               <textarea
//                 value={draft}
//                 onChange={(e) => setDraft(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSend(e);
//                   }
//                 }}
//                 rows={1}
//                 maxLength={2000}
//                 placeholder="Type a message…"
//                 className="max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#0b3b8c] focus:bg-white focus:ring-2 focus:ring-[#0b3b8c]/15"
//               />
//               <button
//                 type="submit"
//                 disabled={sending || !draft.trim()}
//                 className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b3b8c] text-white transition hover:bg-[#0a3478] disabled:opacity-50"
//               >
//                 {sending ? (
//                   <Loader2 size={16} className="animate-spin" />
//                 ) : (
//                   <Send size={16} />
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getConversation,
  sendMessage as sendMessageApi,
  pollMessages,
  getUnreadCount,
} from "../services/chatService";
import MessageStatus from "./MessageStatus";

const POLL_INTERVAL = 4000;
const ANIM_MS = 220;

export default function SupportChatWidget() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false); // controls mount vs unmount
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);
  const [readIds, setReadIds] = useState(() => new Set());

  const scrollRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Mount + animate in, animate out before unmount
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll while open (mobile full-screen)
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Poll unread count even when panel is closed
  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const res = await getUnreadCount();
        if (!cancelled) setUnread(res.data.unread || 0);
      } catch {
        /* silent */
      }
    };

    fetchUnread();
    const id = setInterval(fetchUnread, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user, loading]);

  // Load conversation when panel opens
  useEffect(() => {
    if (!open || loading || !user) return;

    let cancelled = false;
    setInitialLoading(true);
    setError("");

    const load = async () => {
      try {
        const res = await getConversation();
        if (cancelled) return;
        const msgs = res.data.messages || [];
        setMessages(msgs);
        setReadIds(
          new Set(
            msgs
              .filter((m) => m.senderRole === "user" && m.readByAdmin)
              .map((m) => m.id),
          ),
        );
        lastMessageIdRef.current = msgs.length
          ? msgs[msgs.length - 1].id
          : null;
        setUnread(0);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Unable to load your conversation.",
          );
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, user, loading]);

  // Poll for new messages + read receipts while open
  useEffect(() => {
    if (!open || loading || !user) return;

    const poll = async () => {
      try {
        const res = await pollMessages(lastMessageIdRef.current);
        const incoming = res.data.messages || [];

        if (res.data.readMessageIds?.length) {
          setReadIds((prev) => {
            const next = new Set(prev);
            for (const id of res.data.readMessageIds) next.add(id);
            return next;
          });
        }

        if (incoming.length) {
          setMessages((prev) => {
            const existing = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of incoming) {
              if (!existing.has(m.id)) merged.push(m);
            }
            return merged;
          });
          lastMessageIdRef.current = incoming[incoming.length - 1].id;
        }
      } catch {
        /* silent */
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [open, user, loading]);

  // Auto-scroll
  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await sendMessageApi(body);
      const msg = res.data.message;
      setMessages((prev) => [...prev, msg]);
      lastMessageIdRef.current = msg.id;
      setDraft("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send your message.");
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) return null;

  return (
    <>
      {/* Bubble — fades out when panel opens */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open support chat"
        className={`fixed bottom-27 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-[#0b3b8c] text-white shadow-2xl shadow-[#0b3b8c]/40 transition-all duration-200 hover:scale-105 hover:bg-[#0a3478] active:scale-95 sm:bottom-6 sm:right-6 ${
          open ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
        }`}
      >
        <MessageCircle size={26} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Backdrop — mobile only, fades in/out */}
      {visible && (
        <div
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 sm:hidden ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Panel — full-screen on mobile, floating card on sm+ */}
      {visible && (
        <div
          className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl transition-all duration-200 ease-out
            inset-0 rounded-none
            sm:inset-auto sm:bottom-28 sm:right-6 sm:h-[36rem] sm:w-[26rem] sm:rounded-2xl sm:border sm:border-slate-200
            ${
              open
                ? "translate-y-0 opacity-100 sm:scale-100"
                : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95"
            }
          `}
          role="dialog"
          aria-modal="true"
          aria-label="Support chat"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-[#0b3b8c] px-4 py-4 text-white sm:px-5">
            <div className="flex items-center gap-3">
              {/* Back arrow — mobile only */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 transition hover:bg-white/10 sm:hidden"
              >
                <ChevronLeft size={22} />
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
                <MessageCircle size={20} />
              </div>
              <div className="leading-tight">
                <p className="text-base font-semibold">Support</p>
                <p className="text-xs text-blue-200">
                  Our team will respond shortly
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="hidden rounded-lg p-2 transition hover:bg-white/10 sm:block"
            >
              <X size={22} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="no-scrollbar flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-5"
          >
            {initialLoading && (
              <div className="flex h-full items-center justify-center">
                <Loader2 size={28} className="animate-spin text-slate-400" />
              </div>
            )}

            {!initialLoading && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <MessageCircle size={30} />
                </div>
                <p className="text-base font-semibold text-slate-800">
                  Start a conversation
                </p>
                <p className="mt-1.5 max-w-xs text-sm text-slate-500">
                  Send us a message and our support team will reply here.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const mine = m.senderRole === "user";
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      mine
                        ? "rounded-br-md bg-[#0b3b8c] text-white"
                        : "rounded-bl-md bg-white text-slate-800 shadow-sm ring-1 ring-slate-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`mt-1.5 flex items-center justify-end gap-1 text-[11px] ${
                        mine ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {mine && <MessageStatus read={readIds.has(m.id)} />}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="border-t border-rose-100 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Input — extra bottom padding on mobile for safe area */}
          <form
            onSubmit={handleSend}
            className="border-t border-slate-100 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-4"
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
                placeholder="Type a message…"
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#0b3b8c] focus:bg-white focus:ring-2 focus:ring-[#0b3b8c]/15"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b3b8c] text-white transition hover:bg-[#0a3478] disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}