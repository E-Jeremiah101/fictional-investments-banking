import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  Wallet,
  LoaderCircle,
} from "lucide-react";

import PaymentReceipt from "../components/PaymentReceipt";
import {
  getPendingATMCardRequests,
  reviewATMCardRequest,
} from "../services/adminATMCardService";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminATMCardReviews() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [reviewNotes, setReviewNotes] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPendingATMCardRequests();
      setRequests(data.atmCardRequests ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load ATM card requests. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleReview = async (request, action) => {
    const actionLabel = action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} this  ATM card request?`,
    );

    if (!confirmed) return;

    setReviewingId(request.id);
    setError("");
    setNotice("");

    try {
      const result = await reviewATMCardRequest(
        request.id,
        action,
        reviewNotes[request.id] || "",
      );

      setRequests((current) =>
        current.filter((item) => item.id !== request.id),
      );

      setReviewNotes((current) => {
        const updated = { ...current };
        delete updated[request.id];
        return updated;
      });

      setNotice(
        result.message ||
          `ATM card request ${action === "approve" ? "successful" : "declined"}.`,
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
    (total, request) => total + (Number(request.fee) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <CreditCard size={19} />
              <span>ATM card reviews</span>
            </div>

          <div>
             <button
              type="button"
              onClick={loadRequests}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-60 sm:w-auto"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh requests
            </button>
            </div>
            
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Pending card reviews
              </p>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Clock3 size={21} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold tabular-nums">
              {loading ? "..." : requests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total card fees
              </p>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <Wallet size={21} />
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold tabular-nums">
              {loading ? "..." : formatMoney(pendingTotal)}
            </p>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Submitted requests</h3>

            </div>

          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-16 text-slate-500">
              <LoaderCircle size={20} className="mr-2 animate-spin" />
              Loading ATM card requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CreditCard size={26} />
              </div>

              <h4 className="mt-4 font-bold">No pending ATM card requests</h4>
              <p className="mt-1 text-sm text-slate-500">
                New requests will appear here after customers submit their
                simulated payment evidence.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {requests.map((request) => {
                const customerName = request.customer
                  ? `${request.customer.firstName || ""} ${request.customer.lastName || ""}`.trim()
                  : "Customer details unavailable";

                return (
                  <article
                    key={request.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                          <UserRound size={21} />
                        </div>

                        <div className="min-w-0">
                          <h4 className="truncate font-bold">{customerName}</h4>
                          <p className="break-all text-sm text-slate-500">
                            {request.customer?.email || "Email unavailable"}
                          </p>
                        </div>
                      </div>

                      <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                        Awaiting review
                      </span>
                    </div>

                    <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Card network
                        </p>
                        <p className="mt-1 font-semibold capitalize">
                          {request.brand || "Unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Card level
                        </p>
                        <p className="mt-1 font-semibold capitalize">
                          {request.level || "Unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Simulated card fee
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatMoney(request.fee, request.feeCurrency)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Daily limit
                        </p>
                        <p className="mt-1 font-semibold">
                          {request.dailyLimit == null
                            ? "Not specified"
                            : formatMoney(
                                request.dailyLimit,
                                request.currency,
                              )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Cardholder
                        </p>
                        <p className="mt-1 font-semibold">
                          {request.cardholderName || "Unavailable"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Billing address
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {request.billingAddress || "Unavailable"}
                        </p>
                      </div>

                      {request.withdrawal && (
                        <>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Linked withdrawal amount
                            </p>
                            <p className="mt-1 font-semibold">
                              {formatMoney(request.withdrawal.amount)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Linked withdrawal method
                            </p>
                            <p className="mt-1 font-semibold capitalize">
                              {request.withdrawal.method?.replace("_", " ") ||
                                "Unavailable"}
                            </p>
                          </div>
                        </>
                      )}

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Submitted
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {formatDate(request.paymentSubmittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mx-5 border-t border-slate-100" />

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Payment receipt
                        </p>
                        {request.paymentReceiptFileName ? (
                          <PaymentReceipt
                            endpoint={`/admin/atm-cards/${request.id}/payment-receipt`}
                            fileName={request.paymentReceiptFileName}
                            contentType={request.paymentReceiptContentType}
                          />
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">
                            No receipt uploaded.
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor={`review-note-${request.id}`}
                          className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
                        >
                          Administrator review note
                        </label>

                        <textarea
                          id={`review-note-${request.id}`}
                          rows={3}
                          value={reviewNotes[request.id] || ""}
                          onChange={(event) =>
                            setReviewNotes((current) => ({
                              ...current,
                              [request.id]: event.target.value,
                            }))
                          }
                          placeholder="Enter an optional review note..."
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => handleReview(request, "approve")}
                          disabled={reviewingId === request.id}
                          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewingId === request.id ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={17} />
                          )}
                          Approve request
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReview(request, "reject")}
                          disabled={reviewingId === request.id}
                          className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle size={17} />
                          Reject request
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
