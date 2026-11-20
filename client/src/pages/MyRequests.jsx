// import { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Clock3,
//   CheckCircle2,
//   XCircle,
//   ArrowRight,
//   FileText,
//   Building2,
//   Wallet,
//   ArrowUpFromLine,
//   Loader2,
//   RefreshCw,
// } from "lucide-react";

// import { getMyWithdrawalRequests } from "../services/withdrawalService";

// const formatMoney = (amount) =>
//   new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(Number(amount) || 0);

// const formatDate = (date) => {
//   if (!date) return "—";
//   return new Date(date).toLocaleString("en-US", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   });
// };

// const statusDetails = {
//   pending: {
//     label: "Pending",
//     description: "Your withdrawal is processing.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: Clock3,
//   },
//   awaiting_atm: {
//     label: "Virtual Card application",
//     description:
//       "Submit payment receipt for your Virtual Card application.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: Clock3,
//   },
//   awaiting_atm_approval: {
//     label: "Virtual Card review",
//     description:
//       "Management is reviewing your Card application.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: Clock3,
//   },
//   ready_for_withdrawal: {
//     label: "Virtual Card processed",
//     description: "Your Virtual Card has been approved.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: CheckCircle2,
//   },
//   awaiting_tax_pin: {
//     label: "Tax PIN required",
//     description:
//       "Your Tax PIN is ready. Enter the six-digit PIN provided by management to continue.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: FileText,
//   },
//   tax_pin_verified: {
//     label: "Tax PIN verified",
//     description: "Continue with withdrawal.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: CheckCircle2,
//   },
//   awaiting_remittance_payment: {
//     label: "Remittance step",
//     description:
//       "Review the remittance details and submit the requested payment receipt.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: FileText,
//   },
//   awaiting_remittance_approval: {
//     label: "Awaiting remittance review",
//     description: "Your receipt is awaiting review.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: Clock3,
//   },
//   approved: {
//     label: "Successful",
//     description: "This withdrawal has been completed.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: CheckCircle2,
//   },
//   rejected: {
//     label: "Cancelled",
//     description: "This withdrawal request was cancelled.",
//     band: "bg-[#0b3b8c] text-white",
//     icon: XCircle,
//   },
// };

// function getNextStep(withdrawal) {
//   const status = withdrawal.status;

//   if (status === "pending") {
//     return {
//       label: "Apply for Virtual Card",
//       path: `/cards?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
//     };
//   }

//   if (
//     status === "awaiting_atm" &&
//     withdrawal.atmCardRequest?.status === "awaiting_payment" &&
//     withdrawal.atmCardRequest?.paymentStatus === "not_submitted"
//   ) {
//     const requestId =
//       withdrawal.atmCardRequest.id || withdrawal.atmCardRequest._id;

//     if (requestId) {
//       return {
//         label: "Submit Virtual Card payment receipt",
//         path: `/cards/payment/${encodeURIComponent(requestId)}${
//           withdrawal.id
//             ? `?withdrawalId=${encodeURIComponent(withdrawal.id)}`
//             : ""
//         }`,
//       };
//     }
//   }

//   if (status === "ready_for_withdrawal") {
//     return {
//       label: "Proceed with withdrawal",
//       path: `/tax-pin?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
//     };
//   }

//   if (status === "awaiting_tax_pin") {
//     return {
//       label: "Proceed to Tax PIN",
//       path: `/tax-pin?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
//     };
//   }

//   if (["tax_pin_verified", "awaiting_remittance_payment"].includes(status)) {
//     return {
//       label: "Proceed to remittance",
//       path: `/remittance?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
//     };
//   }

//   return null;
// }

// export default function MyRequests() {
//   const navigate = useNavigate();

//   const [withdrawals, setWithdrawals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const loadRequests = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await getMyWithdrawalRequests();
//       setWithdrawals(response.withdrawals || []);
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Unable to load your withdrawal requests.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadRequests();
//   }, [loadRequests]);

//   if (loading) {
//     return (
//       <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
//         <Loader2 size={36} className="animate-spin text-[#0b3b8c]" />

//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-3xl space-y-6">

//       {/* Error */}
//       {error && (
//         <div
//           role="alert"
//           className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
//         >
//           <XCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
//           <p className="text-sm leading-5 text-rose-800">{error}</p>
//         </div>
//       )}

//       {/* Empty state */}
//       {withdrawals.length === 0 ? (
//         <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//             <FileText size={24} />
//           </div>
//           <p className="mt-4 text-base font-bold text-slate-900">
//             No withdrawal requests yet
//           </p>
//           <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
//             Your submitted withdrawal requests will appear here.
//           </p>
//           <button
//             type="button"
//             onClick={() => navigate("/withdrawal")}
//             className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b3b8c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3478]"
//           >
//             <ArrowUpFromLine size={16} />
//             Proceed to Withdrawal
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {withdrawals.map((withdrawal) => {
//             const details =
//               withdrawal.status === "awaiting_atm" &&
//               withdrawal.atmCardRequest?.paymentStatus === "awaiting_review"
//                 ? statusDetails.awaiting_atm_approval
//                 : statusDetails[withdrawal.status] || {
//                     label: withdrawal.status || "Processing",
//                     description: "Check back for the next update.",
//                     band: "bg-slate-500 text-white",
//                     icon: Clock3,
//                   };

//             const StatusIcon = details.icon;
//             const nextStep = getNextStep(withdrawal);
//             const isBank = withdrawal.method === "bank_transfer";

//             return (
//               <article
//                 key={withdrawal.id}
//                 className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
//               >
//                 {/* Status band — colored banner */}
//                 <div
//                   className={`flex items-center justify-between gap-3 px-5 py-2.5 ${details.band}`}
//                 >
//                   <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
//                     <StatusIcon size={14} />
//                     {details.label}
//                   </span>
//                   <span className="text-[11px] font-semibold tabular-nums opacity-90">
//                     {formatDate(withdrawal.createdAt)}
//                   </span>
//                 </div>

//                 {/* Body */}
//                 <div className="px-5 py-5">
//                   {/* Amount + method */}
//                   <div className="flex items-baseline justify-between gap-3">
//                     <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">
//                       {formatMoney(withdrawal.amount)}
//                     </p>
//                     <p className="flex items-center gap-1.5 text-xs text-slate-500">
//                       {isBank ? (
//                         <>
//                           <Building2 size={12} className="text-slate-400" />
//                           Bank transfer
//                         </>
//                       ) : (
//                         <>
//                           <Wallet size={12} className="text-slate-400" />
//                           Cryptocurrency
//                         </>
//                       )}
//                     </p>
//                   </div>

//                   {/* Description — the main message */}

//                   <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
//                     <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
//                       {details.description}
//                     </p>

//                   </div>

//                 </div>

//                 {/* Next step — full-width action bar */}
//                 {nextStep && (
//                   <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
//                     <button
//                       type="button"
//                       onClick={() => navigate(nextStep.path)}
//                       className="flex w-full items-center justify-between gap-3 rounded-lg bg-[#0b3b8c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3478]"
//                     >
//                       <span>{nextStep.label}</span>
//                       <ArrowRight size={16} />
//                     </button>
//                   </div>
//                 )}
//               </article>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  Building2,
  Wallet,
  ArrowUpFromLine,
  Loader2,
  RefreshCw,
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
    description: "Your withdrawal is processing.",
    band: "bg-[#0b3b8c] text-white",
    icon: Clock3,
  },
  awaiting_atm: {
    label: "Virtual Card application",
    description: "Submit payment receipt for your Virtual Card application.",
    band: "bg-[#0b3b8c] text-white",
    icon: Clock3,
  },
  awaiting_atm_approval: {
    label: "Virtual Card review",
    description: "Management is reviewing your Card application.",
    band: "bg-[#0b3b8c] text-white",
    icon: Clock3,
  },
  ready_for_withdrawal: {
    label: "Virtual Card processed",
    description: "Your Virtual Card has been approved.",
    band: "bg-[#0b3b8c] text-white",
    icon: CheckCircle2,
  },
  awaiting_tax_pin: {
    label: "Tax PIN required",
    description:
      "Your Tax PIN is ready. Enter the six-digit PIN provided by management to continue.",
    band: "bg-[#0b3b8c] text-white",
    icon: FileText,
  },
  tax_pin_verified: {
    label: "Tax PIN verified",
    description: "Continue with withdrawal.",
    band: "bg-[#0b3b8c] text-white",
    icon: CheckCircle2,
  },
  awaiting_remittance_payment: {
    label: "Remittance step",
    description:
      "Review the remittance details and submit the requested payment receipt.",
    band: "bg-[#0b3b8c] text-white",
    icon: FileText,
  },
  awaiting_remittance_approval: {
    label: "Awaiting remittance review",
    description: "Your receipt is awaiting review.",
    band: "bg-[#0b3b8c] text-white",
    icon: Clock3,
  },
  approved: {
    label: "Successful",
    description: "This withdrawal has been completed.",
    band: "bg-[#0b3b8c] text-white",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Cancelled",
    description: "This withdrawal request was cancelled.",
    band: "bg-[#0b3b8c] text-white",
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
        label: "Submit Virtual Card payment receipt",
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
      label: "Proceed to Tax PIN",
      path: `/tax-pin?withdrawalId=${encodeURIComponent(withdrawal.id)}`,
    };
  }

  if (["tax_pin_verified", "awaiting_remittance_payment"].includes(status)) {
    return {
      label: "Proceed to remittance",
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
      const all = response.withdrawals || [];
      // Successful withdrawals are hidden from this page.
      setWithdrawals(all.filter((w) => w.status !== "approved"));
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#0b3b8c]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
        >
          <XCircle size={16} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-sm leading-5 text-rose-800">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {withdrawals.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FileText size={24} />
          </div>
          <p className="mt-4 text-base font-bold text-slate-900">
            No withdrawal requests yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Your submitted withdrawal requests will appear here.
          </p>
          <button
            type="button"
            onClick={() => navigate("/withdrawal")}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0b3b8c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3478]"
          >
            <ArrowUpFromLine size={16} />
            Proceed to Withdrawal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => {
            const details =
              withdrawal.status === "awaiting_atm" &&
              withdrawal.atmCardRequest?.paymentStatus === "awaiting_review"
                ? statusDetails.awaiting_atm_approval
                : statusDetails[withdrawal.status] || {
                    label: withdrawal.status || "Processing",
                    description: "Check back for the next update.",
                    band: "bg-slate-500 text-white",
                    icon: Clock3,
                  };

            const StatusIcon = details.icon;
            const nextStep = getNextStep(withdrawal);
            const isBank = withdrawal.method === "bank_transfer";

            return (
              <article
                key={withdrawal.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
              >
                {/* Status band — colored banner */}
                <div
                  className={`flex items-center justify-between gap-3 px-5 py-2.5 ${details.band}`}
                >
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    <StatusIcon size={14} />
                    {details.label}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums opacity-90">
                    {formatDate(withdrawal.createdAt)}
                  </span>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                  {/* Amount + method */}
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">
                      {formatMoney(withdrawal.amount)}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      {isBank ? (
                        <>
                          <Building2 size={12} className="text-slate-400" />
                          Bank transfer
                        </>
                      ) : (
                        <>
                          <Wallet size={12} className="text-slate-400" />
                          Cryptocurrency
                        </>
                      )}
                    </p>
                  </div>

                  {/* Description — the main message */}
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {details.description}
                    </p>
                  </div>
                </div>

                {/* Next step — full-width action bar */}
                {nextStep && (
                  <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(nextStep.path)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg bg-[#0b3b8c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a3478]"
                    >
                      <span>{nextStep.label}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}