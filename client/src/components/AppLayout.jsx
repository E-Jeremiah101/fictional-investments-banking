
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  ClipboardList,
  Settings,
  CreditCard,
  Bell,
  Search,
  CircleHelp,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Landmark,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SupportChatWidget from "./SupportChatWidget";

const navigation = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Wallet", to: "/dashboard?tab=wallet", icon: Wallet },
  { label: "Investments", to: "/investments", icon: TrendingUp },
  { label: "Loans", to: "/loans", icon: Landmark },
  { label: "Deposit", to: "/deposit", icon: ArrowDownToLine },
  { label: "Withdraw", to: "/withdrawal", icon: ArrowUpFromLine },
  { label: "Cards", to: "/cards", icon: CreditCard },
  { label: "Requests", to: "/my-requests", icon: ClipboardList },
  { label: "Settings", to: "/settings", icon: Settings },
  {
    label: "History",
    to: "/dashboard?tab=history",
    icon: History,
  },
];

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const [menuOpen, setMenuOpen] = useState(false);

  const initials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "CU";

  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Customer";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // ESC closes the modal menu
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const path = location.pathname;
  const tab = new URLSearchParams(location.search).get("tab") || "overview";

  const isActive = (to) => {
    const [targetPath, query] = to.split("?");
    if (query) {
      const targetTab = new URLSearchParams(query).get("tab");
      return path === targetPath && tab === targetTab;
    }
    if (targetPath === "/loans") {
      return path === "/loans" || path === "/loan-application";
    }
    return path === targetPath && !location.search;
  };

  const breadcrumbLabel = (() => {
    if (path === "/deposit") return "New deposit";
    if (path === "/investments") return "Investments";
    if (path === "/loans") return "Loan services";
    if (path === "/loan-application") return "Loan application";
    if (path === "/withdrawal") return "New withdrawal";
    if (path === "/my-requests") return "My requests";
    if (path === "/cards") return "Cards";
    if (path.startsWith("/cards/payment")) return "Virtual Card payment";
    if (path === "/remittance") return "Remittance";
    if (path === "/tax-pin") return "Tax pin";
    if (path === "/dashboard")
      return tab.charAt(0).toUpperCase() + tab.slice(1);
    if (path === "/settings") return "Settings";
    if (path === "/support") return "Support";
    return "Dashboard";
  })();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* ===== Desktop sidebar (unchanged behavior) ===== */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col bg-[#0b1a3a] text-white shadow-2xl lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-[12px] font-bold">
            PS
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-bold">PrimeStone Capital</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">
              Online banking
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {navigation.map(({ label, to, icon: Icon }) => {
              const active = isActive(to);
              return (
                <li key={label}>
                  <NavLink
                    to={to}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active ? "" : "text-slate-400 group-hover:text-white"
                      }
                    />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <ChevronRight size={15} className="text-white/80" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {isAdmin && (
            <>
              <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Administration
              </p>
              <NavLink
                to="/admin"
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <ShieldCheck
                  size={18}
                  className="text-slate-400 group-hover:text-white"
                />
                Admin Dashboard
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <NavLink
            to="/support"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <CircleHelp size={18} className="text-slate-400" />
            Support
          </NavLink>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ===== Mobile centered modal menu ===== */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden ${
          menuOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Centered panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className={`relative w-full max-w-sm origin-center rounded-2xl bg-white shadow-2xl transition-all duration-200 ${
            menuOpen
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0"
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0b3b8c] text-[11px] font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[12.5px] font-semibold text-gray-900">
                  {userName}
                </p>
                <p className="truncate text-[11px] text-gray-500">
                  {breadcrumbLabel}
                </p>
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* Menu grid */}
          <div className="max-h-[60vh] overflow-y-auto px-3 py-3">
            <p className="mb-2 px-1 text-[10.5px] font-bold uppercase tracking-wider text-gray-500">
              Navigate
            </p>
            <ul className="grid grid-cols-3 gap-2">
              {navigation.map(({ label, to, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <li key={label}>
                    <NavLink
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-7 transition ${
                        active
                          ? "border-[#0b3b8c] bg-[#0b3b8c]/5 ring-1 ring-[#0b3b8c]"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          active
                            ? "bg-[#0b3b8c] text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span
                        className={`text-[11.5px] font-semibold leading-4 ${
                          active ? "text-[#0b3b8c]" : "text-gray-800"
                        }`}
                      >
                        {label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            {isAdmin && (
              <>
                <p className="mb-2 mt-4 px-1 text-[10.5px] font-bold uppercase tracking-wider text-gray-500">
                  Administration
                </p>
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <ShieldCheck size={16} />
                  </span>
                  <span className="text-[12px] font-semibold text-gray-800">
                    Admin Dashboard
                  </span>
                  <ChevronRight size={14} className="ml-auto text-gray-400" />
                </NavLink>
              </>
            )}
          </div>

          {/* Panel footer */}
          <div className="border-t border-gray-100 px-3 py-2.5">
            <div className="grid grid-cols-2 gap-2">
              <NavLink
                to="/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-5 text-[11.5px] font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <CircleHelp size={13} />
                Support
              </NavLink>

              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main content ===== */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
              >
                <Menu size={18} />
              </button>
              <nav className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <ChevronRight
                  size={12}
                  className="hidden text-gray-300 sm:block"
                />
                <span className="font-semibold text-gray-900">
                  {breadcrumbLabel}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <div className="relative hidden md:block">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  placeholder="Search"
                  className="w-56 rounded-md border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-[13px] outline-none focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15"
                />
              </div>

              <button
                aria-label="Notifications"
                className="relative rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
              >
                <Bell size={17} />
              </button>

              <div className="mx-1 h-6 w-px bg-gray-200" />

              <div className="flex items-center gap-2.5 pl-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0b3b8c] text-[11px] font-bold text-white">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <SupportChatWidget />
    </div>
  );
}