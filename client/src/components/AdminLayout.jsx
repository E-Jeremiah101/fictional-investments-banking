import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  ShieldCheck,
  LayoutDashboard,
  Wallet,
  CreditCard,
  KeyRound,
  Receipt,
  Users,
  TrendingUp,
  Settings,
  RefreshCw,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const mainNav = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  {
    label: "Deposit Reviews",
    to: "/admin/deposits",
    icon: Wallet,
    badgeKey: "deposits",
  },
];

const adminNav = [
  { label: "Investments", to: "/admin/investments", icon: TrendingUp },
  {
    label: "Payment instructions",
    to: "/admin/payment-instructions",
    icon: Settings,
  },
  { label: "ATM Card Reviews", to: "/admin/atm-cards", icon: CreditCard },
  { label: "Remittance Reviews", to: "/admin/remittances", icon: Receipt },
  { label: "Tax PIN Generation", to: "/admin/tax-pins", icon: KeyRound },
  { label: "User Management", to: "/admin/users", icon: Users },
];

export default function AdminLayout({
  pendingCount = 0,
  onRefresh,
  refreshing = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    "Administrator";
  const adminInitials =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "AD";

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const path = location.pathname;

  const breadcrumbLabel = (() => {
    if (path === "/admin") return "Dashboard overview";
    if (path === "/admin/deposits") return "Deposit reviews";
    if (path === "/admin/atm-cards") return "ATM card reviews";
    if (path === "/admin/remittances") return "Remittance reviews";
    if (path === "/admin/tax-pins") return "Tax PIN generation";
    if (path === "/admin/users") return "User management";
    if (path === "/admin/investments") return "Investment management";
    if (path === "/admin/payment-instructions") return "Payment instructions";
    return "Admin";
  })();

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-800">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Persistent Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b1a3a] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">PrimeStone Capital</h1>
              <p className="text-[11px] text-slate-400">Admin console</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Main menu
          </p>
          <ul className="space-y-1">
            {mainNav.map(({ label, to, icon: Icon, end, badgeKey }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? ""
                            : "text-slate-400 group-hover:text-white"
                        }
                      />
                      <span className="flex-1">{label}</span>
                      {badgeKey === "deposits" && pendingCount > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-600/20 text-blue-200"
                          }`}
                        >
                          {pendingCount}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight size={15} className="text-white/80" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Administration
          </p>
          <ul className="space-y-1">
            {adminNav.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? ""
                            : "text-slate-400 group-hover:text-white"
                        }
                      />
                      <span className="flex-1">{label}</span>
                      {isActive && (
                        <ChevronRight size={15} className="text-white/80" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-3 py-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
              {adminInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold leading-tight">
                {adminName}
              </p>
              <p className="text-[10px] leading-tight text-slate-400">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 lg:hidden"
              >
                <Menu size={18} />
              </button>
              <nav className="flex items-center gap-1.5 text-[12px] text-slate-500">
                <span className="hidden sm:inline">Administration</span>
                <ChevronRight
                  size={12}
                  className="hidden sm:block text-slate-300"
                />
                <span className="font-semibold text-slate-900">
                  {breadcrumbLabel}
                </span>
              </nav>
            </div>

            <div className="flex items-center gap-2.5">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing}
                  aria-label="Refresh"
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                  />
                </button>
              )}

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  {adminInitials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[12px] font-semibold leading-tight text-slate-900">
                    {adminName}
                  </p>
                  <p className="text-[10px] leading-tight text-slate-500">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet context={{ pendingCount, onRefresh, refreshing }} />
          </div>
        </main>
      </div>
    </div>
  );
}
