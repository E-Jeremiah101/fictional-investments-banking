import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  Info,
  Building2,
  Wallet,
  ArrowUpFromLine,
} from "lucide-react";

import { getMyWithdrawalRequests } from "../services/withdrawalService";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const statusDetails = {
  pending: {
    label: "Pending",
    description: "Your withdrawal request is being prepared for the next step.",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock3,
  },
  awaiting_atm: {
    label: "Virtual Card application",
    description:
      "Submit demonstration evidence for your Virtual Card application.",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: Clock3,
  },
  awaiting_atm_approval: {
    label: "Virtual Card review",
    description:
      "Management is reviewing your Virtual Card application and demonstration receipt.",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock3,
  },
  ready_for_withdrawal: {
    label: "Virtual Card processed",
    description:
      "Your Virtual Card has been approved.",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: CheckCircle2,
  },
  awaiting_tax_pin: {
    label: "Tax PIN required",
    description:
      "Your Tax PIN is ready. Enter the six-digit PIN provided by management to continue.",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: FileText,
  },
  tax_pin_verified: {
    label: "Tax PIN verified",
    description: "Continue to the remittance stage.",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: CheckCircle2,
  },
  awaiting_remittance_payment: {
    label: "Remittance step",
    description:
      "Review the remittance details and submit the requested demonstration evidence to continue.",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    icon: FileText,
  },
  awaiting_remittance_approval: {
    label: "Awaiting remittance review",
    description:
      "Your demonstration receipt is awaiting administrator review.",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock3,
  },
  approved: {
    label: "Completed",
    description: "This withdrawal has been completed.",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Cancelled",
    description: "This withdrawal request was cancelled.",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    icon: XCircle,
  },
};

function getNextStep(withdrawal) {
  const status = withdrawal.status;

  if (status === "pending") {
    return {
      label: "Apply for Virtual Card",
      path: `/cards?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
    };
  }

  if (
    status === "awaiting_atm" &&
    withdrawal.atmCardRequest?.status === "awaiting_payment" &&
    withdrawal.atmCardRequest?.paymentStatus === "not_submitted"
  ) {
    const requestId =
      withdrawal.atmCardRequest.id || withdrawal.atmCardRequest._id;

    if (requestId) {
      return {
        label: "Submit Virtual Card payment evidence",
        path: `/cards/payment/${encodeURIComponent(requestId)}${
          withdrawal.id
            ? `?withdrawalId=${encodeURIComponent(withdrawal.id)}`
            : ""
        }`,
      };
    }
  }

  if (status === "ready_for_withdrawal") {
    return {
      label: "Proceed with withdrawal",
      path: `/tax-pin?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
    };
  }

  if (status === "awaiting_tax_pin") {
    return {
      label: "Continue to Tax PIN",
      path: `/tax-pin?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
    };
  }

  if (["tax_pin_verified", "awaiting_remittance_payment"].includes(status)) {
    return {
      label: "Continue to remittance",
      path: `/remittance?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
    };
  }

  return null;
}

export default function MyRequests() {
  const navigate = useNavigate();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMyWithdrawalRequests();
      setWithdrawals(response.withdrawals || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your withdrawal requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5"
        >
          <XCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-[12px] leading-5 text-rose-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 rounded-md border border-gray-200 bg-white px-6 py-14 text-[13px] text-gray-500">
          <RefreshCw size={16} className="animate-spin" />
          Loading your requests…
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <FileText size={22} />
          </div>
          <p className="mt-3 text-[13px] font-semibold text-gray-900">
            No withdrawal requests yet
          </p>
          <p className="mt-1 text-[12px] text-gray-500">
            Your submitted withdrawal requests will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/withdrawal")}
            className="mt-5 rounded-md bg-[#0b3b8c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70]"
          >
            Create a withdrawal request
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-[14px] font-bold text-gray-900">
                Request history
              </h2>
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            {withdrawals.map((withdrawal) => {
              const details =
                withdrawal.status === "awaiting_atm" &&
                withdrawal.atmCardRequest?.paymentStatus === "awaiting_review"
                  ? statusDetails.awaiting_atm_approval
                  : statusDetails[withdrawal.status] || {
                      label: withdrawal.status || "Processing",
                      description: "Check back for the next update.",
                      badge: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
                      icon: Clock3,
                    };

              const StatusIcon = details.icon;
              const nextStep = getNextStep(withdrawal);
              const isBank = withdrawal.method === "bank_transfer";
              const isRejected = withdrawal.status === "rejected";
              const isCompleted = withdrawal.status === "approved";

              return (
                <li key={withdrawal.id} className="p-5 sm:p-6">
                  {/* Top row: amount + method + badge */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                          isRejected
                            ? "bg-rose-50 text-rose-600"
                            : isCompleted
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-[#0b3b8c]"
                        }`}
                      >
                        <ArrowUpFromLine size={18} />
                      </div>

                      <div>
                        <p className="text-[15px] font-bold tabular-nums text-gray-900">
                          {formatMoney(withdrawal.amount)}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-gray-500">
                          {isBank ? (
                            <>
                              <Building2 size={12} className="text-gray-400" />
                              Bank transfer
                            </>
                          ) : (
                            <>
                              <Wallet size={12} className="text-gray-400" />
                              Cryptocurrency
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${details.badge}`}
                    >
                      <StatusIcon size={11} />
                      {details.label}
                    </span>
                  </div>

                  {/* Description + submitted */}
                  <div className="mt-3 pl-13">
                    <p className="text-[14.5px] leading-5 text-gray-700">
                      {details.description}
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock3 size={11} />
                      Submitted {formatDate(withdrawal.createdAt)}
                    </p>
                  </div>

                  {/* Review note */}
                  {withdrawal.reviewNote && (
                    <div className="mt-3 ml-13 rounded-md bg-gray-50 px-3 py-2 text-[12px] text-gray-600">
                      <span className="font-semibold text-gray-700">
                        Administrator note:{" "}
                      </span>
                      {withdrawal.reviewNote}
                    </div>
                  )}

                  {/* Action */}
                  {nextStep && (
                    <div className="mt-4 ml-13">
                      <button
                        type="button"
                        onClick={() => navigate(nextStep.path)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#0b3b8c] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#092f70]"
                      >
                        {nextStep.label}
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
