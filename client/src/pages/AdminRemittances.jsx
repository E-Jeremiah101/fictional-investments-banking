import { useEffect, useState } from "react";
import {
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  RefreshCw,
  UserRound,
  Wallet,
  Clock3,
  Receipt,
  Lock,
} from "lucide-react";

import PaymentReceipt from "../components/PaymentReceipt";
import {
  getPendingRemittanceRequests,
  reviewRemittanceRequest,
} from "../services/adminRemittanceService";

const formatUSD = (cents) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100);

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminRemittances() {
  const [requests, setRequests] = useState([]);
  const [reviewNotes, setReviewNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPendingRemittanceRequests();
      setRequests(response.requests || response.remittances || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load pending remittance requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (requestId, decision) => {
    setError("");
    setSuccess("");

    const reviewNote = (reviewNotes[requestId] || "").trim();
    if (!reviewNote) {
      setError("Enter a review note before making a decision.");
      return;
    }

    const confirmation =
      decision === "approve"
        ? "Approve this simulation request and complete the simulated withdrawal?"
        : "Reject this simulation request?";
    if (!window.confirm(confirmation)) return;

    try {
      setReviewingId(requestId);

      const response = await reviewRemittanceRequest(requestId, {
        decision,
        reviewNote,
      });

      setSuccess(
        response.message ||
          `Simulation request ${decision === "approve" ? "approved" : "rejected"}.`,
      );

      setRequests((previous) =>
        previous.filter((request) => request._id !== requestId),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to review this remittance request.",
      );
    } finally {
      setReviewingId("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <Receipt size={19} />
          <span>Remittance reviews</span>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
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
      {success && (
        <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="text-[12px] leading-5 text-emerald-900">{success}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : requests.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => {
            const withdrawal = request.withdrawalRequest || {};
            const user = request.user || {};
            const isReviewing = reviewingId === request._id;

            return (
              <li
                key={request._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                      <Clock3 size={11} />
                      Awaiting review
                    </span>
                    <p className="mt-2 break-all font-mono text-[11.5px] text-slate-500">
                      Request · {String(request._id).slice(-12)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Submitted {formatDate(request.paymentSubmittedAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Simulated remittance fee
                    </p>
                    <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-amber-700">
                      {formatUSD(request.feeCents)}
                    </p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid gap-3 p-5 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <UserRound size={14} />
                      <h3 className="text-[11px] font-bold uppercase tracking-wider">
                        Customer
                      </h3>
                    </div>
                    <p className="text-[13px] font-semibold text-slate-900">
                      {user.firstName || ""} {user.lastName || ""}
                    </p>
                    <p className="mt-0.5 break-all text-[12px] text-slate-500">
                      {user.email || "Email unavailable"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Wallet size={14} />
                      <h3 className="text-[11px] font-bold uppercase tracking-wider">
                        Withdrawal
                      </h3>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </p>
                    <p className="mt-1 text-[13px] font-semibold tabular-nums text-slate-900">
                      {formatUSD(withdrawal.amountCents)}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Method:{" "}
                      <span className="font-medium capitalize text-slate-700">
                        {withdrawal.method?.replace(/_/g, " ") ||
                          "Not specified"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Evidence */}
                <div className="mx-5 mb-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Submitted simulation evidence
                  </h3>

                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Payment receipt
                    </p>
                    {request.paymentReceiptFileName ? (
                      <PaymentReceipt
                        endpoint={`/admin/remittances/${request._id}/payment-receipt`}
                        fileName={request.paymentReceiptFileName}
                        contentType={request.paymentReceiptContentType}
                      />
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        No receipt uploaded.
                      </p>
                    )}
                  </div>
                </div>

                {/* Review note */}
                <div className="border-t border-slate-100 px-5 py-4">
                  <label
                    htmlFor={`note-${request._id}`}
                    className="mb-1.5 block text-[12px] font-semibold text-slate-700"
                  >
                    Administrator review note
                  </label>
                  <textarea
                    id={`note-${request._id}`}
                    rows={3}
                    maxLength={500}
                    value={reviewNotes[request._id] || ""}
                    onChange={(e) =>
                      setReviewNotes((previous) => ({
                        ...previous,
                        [request._id]: e.target.value,
                      }))
                    }
                    placeholder="Explain why this simulation request is approved or rejected…"
                    className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15"
                  />
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Lock size={11} />
                    This note is visible to the customer in their withdrawal
                    history.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleReview(request._id, "reject")}
                    disabled={isReviewing}
                    className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Reject simulation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(request._id, "approve")}
                    disabled={isReviewing}
                    className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isReviewing ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        Processing…
                      </>
                    ) : (
                      "Approve simulation"
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="pb-2 text-center text-[10.5px] text-gray-400">
        PrimeStone Capital administrator console · Educational simulation only. No real
        funds are held or transferred.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-[13px] text-slate-500">
      <LoaderCircle size={16} className="animate-spin" />
      Loading requests…
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <ClipboardCheck size={22} />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-slate-900">
        No pending reviews
      </p>
      <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-slate-500">
        There are currently no remittance simulation requests awaiting
        administrator review.
      </p>
    </div>
  );
}
