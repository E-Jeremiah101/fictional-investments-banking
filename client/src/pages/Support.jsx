import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  LockKeyhole,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const categories = ["All topics", "Account", "Deposits", "Withdrawals", "Security"];

const articles = [
  {
    category: "Deposits",
    question: "How do I make a deposit?",
    answer:
      "Open Deposits and follow the instructions shown for your account. If a receipt is requested, upload a clear image or PDF and check My requests for its status.",
    link: "/deposit",
    linkLabel: "Go to deposits",
  },
  {
    category: "Withdrawals",
    question: "How do I request a withdrawal?",
    answer:
      "Open Withdrawals, enter the requested details, and submit your request. You can follow its progress from My requests.",
    link: "/withdrawal",
    linkLabel: "Go to withdrawals",
  },
  {
    category: "Account",
    question: "Where can I find my account information?",
    answer:
      "Your dashboard shows your balance and account number. Open the Wallet view for additional account details.",
    link: "/dashboard?tab=wallet",
    linkLabel: "View my wallet",
  },
  {
    category: "Account",
    question: "Where can I check the status of a request?",
    answer:
      "Open My requests to review submitted requests and their latest available status.",
    link: "/my-requests",
    linkLabel: "View my requests",
  },
  {
    category: "Security",
    question: "What should I do if I think my account is at risk?",
    answer:
      "Change your password and PIN from Settings, and never share your password, PIN, or one-time codes. If you cannot access your account, sign out on shared devices.",
    link: "/settings",
    linkLabel: "Open security settings",
  },

];

const quickLinks = [
  { label: "Account & wallet", description: "Review your account details", to: "/dashboard?tab=wallet", icon: Wallet },
  { label: "Deposits", description: "Start or review a deposit", to: "/deposit", icon: ArrowDownToLine },
  { label: "Withdrawals", description: "Submit a withdrawal request", to: "/withdrawal", icon: ArrowUpFromLine },
  { label: "My requests", description: "Track submitted requests", to: "/my-requests", icon: ClipboardList },
];

export default function Support() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All topics");
  const [openQuestion, setOpenQuestion] = useState(articles[0].question);

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory =
        category === "All topics" || article.category === category;
      const matchesSearch =
        !search ||
        `${article.question} ${article.answer} ${article.category}`
          .toLowerCase()
          .includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [category, query]);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1a3a] via-[#12316b] to-[#1e40af] px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5" />
        <div className="relative max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
            <CircleHelp size={14} />
            Help center
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
            Find quick answers about your account, deposits, withdrawals, and security.
          </p>
          <label className="relative mt-6 block max-w-xl">
            <span className="sr-only">Search support articles</span>
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for an answer..."
              className="w-full rounded-xl border border-white/20 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-blue-300/30"
            />
          </label>
        </div>
      </section>

      <section aria-label="Popular support topics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map(({ label, description, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-100">
              <Icon size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">{label}</span>
              <span className="mt-1 block text-xs text-slate-500">{description}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Frequently asked questions</h2>
              <p className="mt-1 text-sm text-slate-500">Browse answers or search by keyword.</p>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Filter by topic">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${
                  category === item
                    ? "bg-[#0b3b8c] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {filteredArticles.map((article) => {
              const isOpen = openQuestion === article.question;
              return (
                <article key={article.question} className="py-1">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenQuestion(isOpen ? "" : article.question)}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    >
                      <span>
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-blue-700">
                          {article.category}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{article.question}</span>
                      </span>
                      <ChevronDown
                        size={17}
                        className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </h3>
                  {isOpen && (
                    <div className="pb-4 pr-8 text-sm leading-6 text-slate-600">
                      <p>{article.answer}</p>
                      {article.link && (
                        <Link
                          to={article.link}
                          className="mt-3 inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-900"
                        >
                          {article.linkLabel}
                          <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
            {filteredArticles.length === 0 && (
              <div className="py-10 text-center">
                <Search size={22} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-800">No matching answers</p>
                <p className="mt-1 text-xs text-slate-500">Try another search term or choose a different topic.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("All topics");
                  }}
                  className="mt-4 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-red-50 p-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={19} className="text-red-700" />
              <h2 className="text-sm font-semibold text-slate-950">Keep your account safe</h2>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-900/80">
              Never share your password, PIN, or verification codes. PrimeStone Capital will never ask you to disclose them.
            </p>
            <Link
              to="/settings"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
            >
              <LockKeyhole size={14} />
              Review security settings
            </Link>
          </div>

        </aside>
      </section>
    </div>
  );
}
