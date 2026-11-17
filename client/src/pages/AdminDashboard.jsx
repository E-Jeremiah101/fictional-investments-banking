

import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ShieldCheck,
  Wallet,
  ArrowDownToLine,
  KeyRound,
  Receipt,
  Users,
  CheckCircle2,
  Clock3,
  AlertCircle,
  LoaderCircle,
  ChevronRight,
  CalendarDays,
  CreditCard,
} from "lucide-react";

import {
  getPendingDeposits,
  reviewDeposit,
} from "../services/adminDepositService";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const shortcutLinks = [
  {
    label: "Deposit reviews",
    description: "Review pending demo deposits",
    icon: ArrowDownToLine,
    color: "bg-blue-50 text-blue-600",
    to: "/admin/deposits",
  },
  {
    label: "Remittance reviews",
    description: "Review simulated payment evidence",
    icon: Receipt,
    color: "bg-violet-50 text-violet-600",
    to: "/admin/remittances",
  },
  {
    label: "ATM card reviews",
    description: "Review card payment evidence",
    icon: CreditCard,
    color: "bg-orange-50 text-orange-600",
    to: "/admin/atm-cards",
  },
  {
    label: "Tax PIN generation",
    description: "Generate customer PINs",
    icon: KeyRound,
    color: "bg-amber-50 text-amber-600",
    to: "/admin/tax-pins",
  },
  {
    label: "User management",
    description: "Manage customer accounts",
    icon: Users,
    color: "bg-slate-100 text-slate-600",
    to: "/admin/users",
    wide: true,
  },
];

export default function AdminDashboard() {
  const { setAdminPendingCount } = useOutletContext() || {};

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPendingDeposits();
      setRequests(data.deposits ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load deposit requests. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (typeof setAdminPendingCount === "function") {
      setAdminPendingCount(requests.length);
    }
  }, [requests.length, setAdminPendingCount]);

  const handleReview = async (request, action) => {
    const actionLabel = action === "approve" ? "approve" : "reject";
    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this fictional deposit of ${formatMoney(request.amount)}?`,
    );
    if (!confirmed) return;

    setReviewingId(request.id);
    setError("");
    setNotice("");

    try {
      const result = await reviewDeposit(
        request.id,
        action,
        action === "approve"
          ? "Approved for educational simulation"
          : "Rejected by administrator",
      );

      setRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );
      setNotice(
        result.message ||
          `Demo deposit ${action === "approve" ? "approved" : "rejected"}.`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to review this request. Refresh and try again.",
      );
    } finally {
      setReviewingId("");
    }
  };

  const pendingTotal = requests.reduce(
    (total, request) => total + (Number(request.amount) || 0),
    0,
  );

  const { user } = { user: null }; // adjust if needed; useAuth can be re-imported

  return (
    <div className="space-y-6">
      {/* Feedback */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-[12px] leading-5 text-rose-800">{error}</p>
        </div>
      )}
      {notice && (
        <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="text-[12px] leading-5 text-emerald-900">{notice}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Administration overview
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Monitor and review simulated customer requests.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <CalendarDays size={14} className="text-slate-500" />
          <span className="text-[12px] font-medium text-slate-600">
            Admin console
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Pending deposits"
          value={loading ? "…" : requests.length.toString()}
          description="Requests awaiting review"
          icon={Clock3}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Pending demo value"
          value={loading ? "…" : formatMoney(pendingTotal)}
          description="Fictional USD deposit amounts"
          icon={Wallet}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Review workspace"
          value="Deposits"
          description="Review customer submissions"
          icon={ShieldCheck}
          color="bg-emerald-50 text-emerald-600"
        />
      </section>

      {/* Shortcuts */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h3 className="text-sm font-bold text-slate-900">
            Approval workspace
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Choose an area to manage customer requests.
          </p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {shortcutLinks.map(
            ({ label, description, icon: Icon, color, to, wide }) => (
              <Link
                key={to}
                to={to}
                className={`group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40 ${
                  wide ? "sm:col-span-2" : ""
                }`}
              >
                <div className={`rounded-xl p-2.5 ${color}`}>
                  <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-900">
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {description}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-slate-400 transition group-hover:text-blue-600"
                />
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Recent pending */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent deposit requests
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Latest requests awaiting administrator review.
            </p>
          </div>
          <Link
            to="/admin/deposits"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View all
            <ChevronRight size={13} />
          </Link>
        </div>

        {loading ? (
          <LoadingState />
        ) : requests.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-slate-100">
            {requests.slice(0, 5).map((request) => (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Wallet size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900">
                      {request.user
                        ? `${request.user.firstName} ${request.user.lastName}`
                        : "Customer unavailable"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {request.user?.email || "No email supplied"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[13px] font-bold tabular-nums text-slate-900">
                    {formatMoney(request.amount)}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 ring-1 ring-amber-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    Pending
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 break-words text-2xl font-bold tracking-tight tabular-nums text-slate-900">
            {value}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">{description}</p>
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${color}`}>
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2.5 px-6 py-12 text-[13px] text-slate-500">
      <LoaderCircle size={16} className="animate-spin" />
      Loading deposit requests…
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <CheckCircle2 size={22} />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-slate-900">
        No pending requests
      </p>
      <p className="mt-1 text-[12px] text-slate-500">
        New customer deposit requests will appear here.
      </p>
    </div>
  );
}