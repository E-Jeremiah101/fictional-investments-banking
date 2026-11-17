import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  generateTaxPin,
  getWithdrawalsReadyForTaxPin,
  reviewTaxPinPayment,
} from "../services/taxPinService";
import PaymentReceipt from "../components/PaymentReceipt";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminTaxPins() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState("");
  const [reviewingId, setReviewingId] = useState("");
  const [generatedPin, setGeneratedPin] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getWithdrawalsReadyForTaxPin();
      setWithdrawals(response.withdrawals || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load withdrawals awaiting Tax PIN generation.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const handleReview = async (withdrawal, action) => {
    setReviewingId(withdrawal.id);
    setError("");
    setNotice("");

    try {
      const response = await reviewTaxPinPayment(withdrawal.taxPin.id, {
        action,
      });
      setNotice(response.message || "Tax PIN receipt review completed.");
      setWithdrawals((current) =>
        action === "reject"
          ? current.filter((request) => request.id !== withdrawal.id)
          : current.map((request) =>
              request.id === withdrawal.id
                ? {
                    ...request,
                    taxPin: {
                      ...request.taxPin,
                      paymentStatus: "approved",
                    },
                  }
                : request,
            ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to review Tax PIN payment evidence.",
      );
    } finally {
      setReviewingId("");
    }
  };

  const handleGenerate = async (withdrawal) => {
    setGeneratingId(withdrawal.id);
    setGeneratedPin(null);
    setError("");

    try {
      const response = await generateTaxPin(withdrawal.id);
      const pin = response.taxPin?.pin;

      if (!pin) {
        throw new Error(
          "The Tax PIN was generated, but no PIN was returned by the server.",
        );
      }

      setGeneratedPin({
        customer: withdrawal.customer,
        pin,
        expiresAt: response.taxPin.expiresAt,
        regenerated: withdrawal.taxPin.status !== "pending",
      });
      setWithdrawals((current) =>
        current.map((request) =>
          request.id === withdrawal.id
            ? {
                ...request,
                status: "awaiting_tax_pin",
                taxPin: {
                  ...request.taxPin,
                  status: "generated",
                },
              }
            : request,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate a Tax PIN.",
      );
    } finally {
      setGeneratingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <KeyRound size={19} />
              <span>Tax PIN Payment Review</span>
            </div>

            <button
              type="button"
              onClick={loadWithdrawals}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        {generatedPin && (
          <section
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={22}
                className="mt-0.5 shrink-0 text-emerald-700"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-emerald-900">
                  {generatedPin.regenerated
                    ? "Tax PIN regenerated"
                    : "Tax PIN generated"}
                </h3>
                {generatedPin.regenerated && (
                  <p className="mt-1 text-sm text-emerald-800">
                    This PIN replaces the previously generated PIN.
                  </p>
                )}
                <p className="mt-1 text-sm text-emerald-800">
                  {generatedPin.customer
                    ? `${generatedPin.customer.firstName || ""} ${generatedPin.customer.lastName || ""}`.trim()
                    : "Customer"}
                  {generatedPin.customer?.email
                    ? ` (${generatedPin.customer.email})`
                    : ""}
                </p>
                <p className="mt-4 inline-block rounded-lg border border-emerald-200 bg-white px-5 py-3 font-mono text-2xl font-bold tracking-[0.3em] text-slate-900">
                  {generatedPin.pin}
                </p>
                <p className="mt-3 text-xs text-emerald-800">
                  Expires: {formatDate(generatedPin.expiresAt)}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
       

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-16 text-slate-500">
              <LoaderCircle size={20} className="mr-2 animate-spin" />
              Loading Tax PIN payment submissions...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
              <Clock3 size={34} className="mx-auto text-slate-400" />
              <h4 className="mt-4 font-bold">No Tax PIN receipts to review</h4>
              <p className="mt-1 text-sm text-slate-500">
                Submitted Tax PIN receipts will appear here for management
                review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => {
                const customerName = withdrawal.customer
                  ? `${withdrawal.customer.firstName || ""} ${withdrawal.customer.lastName || ""}`.trim()
                  : "Customer details unavailable";

                return (
                  <article
                    key={withdrawal.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <UserRound size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="truncate font-bold">
                              {customerName}
                            </h4>
                            <p className="truncate text-sm text-slate-500">
                              {withdrawal.customer?.email ||
                                "Email unavailable"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">
                            {formatMoney(withdrawal.amount)}
                          </span>
                          <span>
                            One-time Tax PIN fee:{" "}
                            {formatMoney(
                              withdrawal.taxPin.paymentFeeCents / 100,
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <CreditCard size={15} />
                            {withdrawal.atmCard?.level
                              ? `${withdrawal.atmCard.brand || "ATM"} ${withdrawal.atmCard.level}`
                              : "ATM card"}
                          </span>
                          <span>
                            Submitted: {formatDate(withdrawal.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 break-all text-xs text-slate-400">
                          Withdrawal ID: {withdrawal.id}
                        </p>
                      </div>

                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-sm font-semibold text-slate-700">
                        Submitted receipt
                      </p>
                      <PaymentReceipt
                        endpoint={`/admin/tax-pins/${withdrawal.taxPin.id}/payment-receipt`}
                        fileName={withdrawal.taxPin.paymentReceiptFileName}
                        contentType={
                          withdrawal.taxPin.paymentReceiptContentType
                        }
                      />
                    </div>
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      {withdrawal.taxPin.paymentStatus ===
                      "awaiting_review" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReview(withdrawal, "reject")}
                            disabled={
                              Boolean(reviewingId) || Boolean(generatingId)
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                          >
                            <XCircle size={16} />
                            Reject receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(withdrawal, "approve")}
                            disabled={
                              Boolean(reviewingId) || Boolean(generatingId)
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                          >
                            {reviewingId === withdrawal.id ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Approve receipt
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerate(withdrawal)}
                          disabled={Boolean(generatingId) || Boolean(reviewingId)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {generatingId === withdrawal.id ? (
                            <LoaderCircle size={17} className="animate-spin" />
                          ) : (
                            <KeyRound size={17} />
                          )}
                          {generatingId === withdrawal.id
                            ? "Generating..."
                            : withdrawal.taxPin.status === "pending"
                              ? "Generate Tax PIN"
                              : "Regenerate Tax PIN"}
                        </button>
                      )}
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
