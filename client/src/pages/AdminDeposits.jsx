import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Wallet,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowDownToLine,
  Building2,
} from "lucide-react";

import {
  getPendingDeposits,
  reviewDeposit,
} from "../services/adminDepositService";
import PaymentReceipt from "../components/PaymentReceipt";
import ConfirmDialog from "../components/ConfirmDialog";

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

export default function AdminDeposits() {
  const { setAdminPendingCount } = useOutletContext() || {};

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingReview, setPendingReview] = useState(null);

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

  const handleReview = (request, action) => {
    setPendingReview({ request, action });
  };

  const confirmReview = async () => {
    if (!pendingReview) return;
    const { request, action } = pendingReview;
    setReviewingId(request.id);
    setError("");
    setNotice("");

    try {
      const result = await reviewDeposit(
        request.id,
        action,
        action === "approve" ? "Successful" : "Declined",
      );

      setRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );
      setNotice(
        result.message ||
          `Deposit ${action === "approve" ? "Successful" : "Declined"}.`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to review this request. Refresh and try again.",
      );
    } finally {
      setReviewingId("");
      setPendingReview(null);
    }
  };

  const pendingTotal = requests.reduce(
    (total, request) => total + (Number(request.amount) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Wallet size={19}/>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Deposit reviews
           </h1>
        </div>
        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

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

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Pending requests"
          value={requests.length.toString()}
          icon={Clock3}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total pending value"
          value={formatMoney(pendingTotal)}
          icon={Wallet}
          color="bg-violet-50 text-violet-600"
        />
      </section>

      {/* List */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h3 className="text-sm font-bold text-slate-900">
            Pending deposit requests
          </h3>

        </div>

        {requests.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-slate-100">
            {requests.map((request) => (
              <li key={request.id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ArrowDownToLine size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900">
                        {request.user
                          ? `${request.user.firstName} ${request.user.lastName}`
                          : "Customer unavailable"}
                      </p>
                      <p className="mt-0.5 break-all text-[11.5px] text-slate-500">
                        {request.user?.email || "No email supplied"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Account:{" "}
                        {request.account?.accountNumber || "Unavailable"}
                      </p>
                      {request.purpose === "trading_activation" && (
                        <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                          Trading activation deposit
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                   
                    <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-slate-900">
                      {formatMoney(request.amount)}
                    </p>
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700 ring-1 ring-amber-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Pending review
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2">
                  <Detail
                    label="Payment method"
                    value={request.method?.replace(/_/g, " ") || "Unknown"}
                    capitalize
                  />
                  <Detail
                    label="Submitted"
                    value={formatDate(request.createdAt)}
                  />

                  {request.method === "crypto" && (
                    <>
                      <Detail
                        label="Asset"
                        value={request.asset || "Not supplied"}
                      />
                      <Detail
                        label="Network"
                        value={request.network || "Not supplied"}
                      />
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Transaction hash
                        </p>
                        <p className="mt-1 break-all font-mono text-[11.5px] text-slate-700">
                          {request.transactionHash || "Not supplied"}
                        </p>
                      </div>
                    </>
                  )}

                  {request.method === "bank_transfer" && (
                    <div className="sm:col-span-2">
                      <p className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
                        <Building2 size={12} className="text-slate-400" />
                        Bank transfer request
                      </p>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Deposit receipt
                    </p>
                    {request.paymentReceiptFileName ? (
                      <PaymentReceipt
                        endpoint={`/admin/deposits/${request.id}/payment-receipt`}
                        fileName={request.paymentReceiptFileName}
                        contentType={request.paymentReceiptContentType}
                      />
                    ) : (
                      <p className="mt-2 text-[12.5px] text-slate-500">
                        No receipt uploaded.
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleReview(request, "reject")}
                    disabled={reviewingId === request.id}
                    className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={14} />
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(request, "approve")}
                    disabled={reviewingId === request.id}
                    className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={14} />
                    {reviewingId === request.id
                      ? "Processing…"
                      : "Approve"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {pendingReview && (
        <ConfirmDialog
          title={
            pendingReview.action === "approve"
              ? "Approve deposit?"
              : "Decline deposit?"
          }
          message={`Are you sure you want to ${
            pendingReview.action === "approve" ? "approve" : "decline"
          } this  deposit of ${formatMoney(
            pendingReview.request.amount,
          )}?`}
          confirmLabel={
            pendingReview.action === "approve"
              ? "Approve deposit"
              : "Decline deposit"
          }
          busy={reviewingId === pendingReview.request.id}
          busyLabel="Processing…"
          variant={pendingReview.action === "approve" ? "primary" : "danger"}
          onCancel={() => setPendingReview(null)}
          onConfirm={confirmReview}
        />
      )}
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

function Detail({ label, value, capitalize }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-[12.5px] text-slate-800 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
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
