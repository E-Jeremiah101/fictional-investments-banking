import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ReceiptText,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock3,
  ShieldCheck,
  Wallet,
  FileCheck2,
  BadgeCheck,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";

import {
  getMyRemittanceRequests,
  submitRemittanceEvidence,
} from "../services/remittanceService";


const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const statusMeta = {
  awaiting_payment: {
    label: "Awaiting payment",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock3,
  },
  awaiting_review: {
    label: "Awaiting review",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: BadgeCheck,
  },
};


function ReceiptUploader({ receipt, setReceipt, error, setError, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!receipt || !receipt.type?.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(receipt);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [receipt]);

  const isImage = Boolean(receipt && receipt.type?.startsWith("image/"));

  const validateAndSet = (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported file type. Use JPG, PNG, WEBP, or PDF.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large. Maximum size is 5 MB.");
      return;
    }
    setError("");
    setReceipt(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    validateAndSet(e.dataTransfer.files?.[0] || null);
  };

  const clear = () => {
    setReceipt(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor="receipt"
          className="block text-[12px] font-semibold text-gray-700"
        >
          Payment receipt
        </label>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Required
        </span>
      </div>

      {!receipt ? (
        <label
          htmlFor="receipt"
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${
            disabled
              ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
              : dragging
                ? "border-[#0b3b8c] bg-[#0b3b8c]/5"
                : "border-gray-300 bg-gray-50 hover:border-[#0b3b8c]/60 hover:bg-[#0b3b8c]/[0.03]"
          }`}
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
              dragging
                ? "bg-[#0b3b8c] text-white"
                : "bg-white text-[#0b3b8c] ring-1 ring-gray-200 group-hover:ring-[#0b3b8c]/30"
            }`}
          >
            <UploadCloud size={20} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-gray-900">
              {dragging ? "Drop to upload" : "Click to upload or drag & drop"}
            </p>
            <p className="mt-0.5 text-[11.5px] text-gray-500">
              JPG, PNG, WEBP, or PDF · up to 5 MB
            </p>
          </div>
          <input
            ref={inputRef}
            id="receipt"
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={(e) => validateAndSet(e.target.files?.[0] || null)}
            className="sr-only"
            disabled={disabled}
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400 ring-1 ring-gray-200">
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText size={22} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-gray-900">
              {receipt.name}
            </p>
            <p className="mt-0.5 text-[11.5px] text-gray-500">
              {(receipt.size / 1024 / 1024).toFixed(2)} MB ·{" "}
              {receipt.type === "application/pdf" ? "PDF" : "Image"}
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            aria-label="Remove receipt"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-red-700">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}



export default function Remittance() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const withdrawalId = searchParams.get("withdrawalId");
  const taxPinVerified = searchParams.get("stage") === "tax-pin-verified";

  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [receiptError, setReceiptError] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyRemittanceRequests();
        const remittanceRequests =
          response.requests || response.remittances || [];
        setRequests(remittanceRequests);
        const linkedRequest = withdrawalId
          ? remittanceRequests.find((request) => {
              const linkedWithdrawalId =
                typeof request.withdrawalRequest === "object"
                  ? request.withdrawalRequest?._id
                  : request.withdrawalRequest;
              return String(linkedWithdrawalId) === withdrawalId;
            })
          : null;
        const pendingRequest = linkedRequest || remittanceRequests.find(
          (request) => request.status === "awaiting_payment",
        );
        if (pendingRequest) setSelectedId(pendingRequest._id);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your remittance requests.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [withdrawalId]);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(""), 5000);
    return () => window.clearTimeout(t);
  }, [success]);

  const selectedRequest = useMemo(
    () => requests.find((request) => request._id === selectedId),
    [requests, selectedId],
  );
  const withdrawalAmount =
    Number(selectedRequest?.withdrawalRequest?.amountCents || 0) / 100;
  const remittanceFee = Number(selectedRequest?.feeCents || 0) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setReceiptError("");

    if (!selectedId) {
      setError("No eligible remittance request was selected.");
      return;
    }
    if (!receipt) {
      setReceiptError("Upload a payment receipt image or PDF.");
      return;
    }
    if (receipt.size > MAX_FILE_BYTES) {
      setReceiptError("Receipt file must be 5 MB or smaller.");
      return;
    }
    if (!ACCEPTED.includes(receipt.type)) {
      setReceiptError("Unsupported file type. Use JPG, PNG, WEBP, or PDF.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await submitRemittanceEvidence(selectedId, receipt);
      setSuccess(
        response.message ||
          "Your receipt has been submitted for review.",
      );
      setRequests((previous) =>
        previous.map((request) =>
          request._id === selectedId
            ? { ...request, ...response.request, status: "awaiting_review" }
            : request,
        ),
      );
      setReceipt(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit receipt.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-gray-900">
          Remittance
        </h1>
        <p className="mt-1 text-[13px] text-gray-500">
          Upload payment receipt for your remittance fee so management can review your withdrawal.
        </p>
      </div>

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

      {taxPinVerified && !success && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5"
        >
          <CheckCircle2
            size={15}
            className="mt-0.5 shrink-0 text-emerald-600"
          />
          <p className="text-[12px] leading-5 text-emerald-900">
            Tax PIN verified successfully.
          </p>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0b3b8c]/10 text-[#0b3b8c]">
              <ReceiptText size={18} />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-gray-900">
                Remittance request
              </h2>
              <p className="mt-0.5 text-[12px] text-gray-500">
                Select a request, review the fee, then upload your receipt.
              </p>
            </div>
          </div>

          <div className="px-6 py-5">
            {loading ? null : requests.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <ReceiptText size={22} />
                </div>
                <p className="mt-3 text-[13px] font-semibold text-gray-900">
                  No remittance requests
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  Remittance requests appear here when a withdrawal requires a
                  remittance fee.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="mt-5 rounded-md bg-[#0b3b8c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70]"
                >
                  Return to dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Request selector — cards */}
                <div>
                  <label className="mb-2 block text-[12px] font-semibold text-gray-700">
                    Remittance request
                  </label>
                  <div className="grid gap-2">
                    {requests.map((request) => {
                      const meta =
                        statusMeta[request.status] ||
                        statusMeta.awaiting_payment;
                      const Icon = meta.icon;
                      const active = request._id === selectedId;
                      const reqAmount =
                        Number(request.withdrawalRequest?.amountCents || 0) /
                        100;
                      const reqFee = Number(request.feeCents || 0) / 100;
                      return (
                        <button
                          key={request._id}
                          type="button"
                          onClick={() => setSelectedId(request._id)}
                          className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition ${
                            active
                              ? "border-[#0b3b8c] bg-[#0b3b8c]/[0.04] ring-1 ring-[#0b3b8c]/20"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${meta.badge}`}
                              >
                                <Icon size={10} />
                                {meta.label}
                              </span>
                              <span className="truncate font-mono text-[11px] text-gray-500">
                                #{String(request._id).slice(-8)}
                              </span>
                            </div>
                            <p className="mt-1 text-[12px] text-gray-600">
                              Withdrawal{" "}
                              <span className="font-semibold tabular-nums text-gray-900">
                                {formatMoney(reqAmount)}
                              </span>{" "}
                              · Fee{" "}
                              <span className="font-semibold tabular-nums text-gray-900">
                                {formatMoney(reqFee)}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                              active
                                ? "border-[#0b3b8c] bg-[#0b3b8c] text-white"
                                : "border-gray-300 bg-white"
                            }`}
                            aria-hidden
                          >
                            {active && <CheckCircle2 size={12} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Info size={11} />
                    Only requests related to your active withdrawal are shown.
                  </p>
                </div>

                {/* Selected request details */}
                {selectedRequest && (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Wallet size={12} />
                          <p className="text-[10.5px] font-bold uppercase tracking-wider">
                            Withdrawal amount
                          </p>
                        </div>
                        <p className="mt-1 text-[18px] font-bold tabular-nums tracking-tight text-gray-900">
                          {formatMoney(withdrawalAmount)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-amber-700">
                          <ShieldCheck size={12} />
                          <p className="text-[10.5px] font-bold uppercase tracking-wider">
                            Remittance fee (30%)
                          </p>
                        </div>
                        <p className="mt-1 text-[18px] font-bold tabular-nums tracking-tight text-amber-900">
                          {formatMoney(remittanceFee)}
                        </p>
                      </div>
                    </div>

                    {selectedRequest.status === "awaiting_payment" ? (
                      <form
                        onSubmit={handleSubmit}
                        className="space-y-4 border-t border-gray-200 pt-5"
                      >
                        <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                          Payment receipt
                        </p>

                        <ReceiptUploader
                          receipt={receipt}
                          setReceipt={setReceipt}
                          error={receiptError}
                          setError={setReceiptError}
                          disabled={submitting}
                        />

                        <div className="flex flex-col-reverse items-stretch gap-2 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                          <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submitting || !receipt}
                            className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {submitting ? (
                              "Submitting…"
                            ) : (
                              "Submit payment receipt"
                            )}
                          </button>
                        </div>
                      </form>
                    ) : selectedRequest.status === "awaiting_review" ? (
                      <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-3">
                        <Clock3
                          size={15}
                          className="mt-0.5 shrink-0 text-blue-700"
                        />
                        <div>
                          <p className="text-[12px] font-semibold text-blue-900">
                            Awaiting review
                          </p>
                          <p className="mt-0.5 text-[11.5px] leading-5 text-blue-800">
                            Your payment receipt has been submitted. Management must review it before this withdrawal can be completed.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                        <Info
                          size={15}
                          className="mt-0.5 shrink-0 text-gray-500"
                        />
                        <div>
                          <p className="text-[12px] font-semibold capitalize text-gray-900">
                            Status: {selectedRequest.status.replace(/_/g, " ")}
                          </p>
                          <p className="mt-0.5 text-[11.5px] leading-5 text-gray-600">
                            Check your dashboard for the latest
                            status.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}