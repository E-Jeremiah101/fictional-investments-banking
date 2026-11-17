// import { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   CreditCard,
//   CheckCircle2,
//   AlertCircle,
//   LoaderCircle,
//   ShieldCheck,
//   Upload,
// } from "lucide-react";

// import { submitATMCardPayment } from "../services/atmCardService";

// export default function ATMCardPayment() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [receipt, setReceipt] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!receipt) {
//       setError("Upload a payment receipt image or PDF.");
//       return;
//     }
//     if (receipt.size > 5 * 1024 * 1024) {
//       setError("Receipt file must be 5 MB or smaller.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       setError("");
//       setSuccess("");

//       await submitATMCardPayment(id, receipt);

//       setSuccess(
//         "Your simulated card application is now waiting for administrator review.",
//       );

//       setTimeout(() => {
//         navigate("/atm-card");
//       }, 2000);
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Unable to submit your ATM card payment evidence.",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const inputClass =
//     "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15";

//   return (
//     <div className="space-y-6">
//       {/* Page title */}
//       <div className="flex items-start gap-3">
//         <div>
//           <h1 className="text-[22px] font-bold tracking-tight text-gray-900">
//             Simulated ATM card application fee
//           </h1>
//           <p className="mt-1 text-[13px] text-gray-500">
//             Upload fictional demonstration evidence to continue to administrator
//             review. No real fee is charged and no card is issued.
//           </p>
//         </div>
//       </div>

//       {/* Success banner */}
//       {success && (
//         <div
//           role="status"
//           className="flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5"
//         >
//           <CheckCircle2
//             size={15}
//             className="mt-0.5 shrink-0 text-emerald-600"
//           />
//           <p className="text-[12px] leading-5 text-emerald-900">{success}</p>
//         </div>
//       )}

//       {/* Error banner */}
//       {error && (
//         <div
//           role="alert"
//           className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5"
//         >
//           <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
//           <p className="text-[12px] leading-5 text-rose-800">{error}</p>
//         </div>
//       )}

//       <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
//         {/* Form card */}
//         <div className="rounded-md border border-gray-200 bg-white">
//           <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
//             <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0b3b8c]/10 text-[#0b3b8c]">
//               <CreditCard size={18} />
//             </div>
//             <div>
//               <h2 className="text-[14px] font-bold text-gray-900">
//                 Payment details
//               </h2>
//               <p className="mt-0.5 text-[12px] text-gray-500">
//                 Complete the fields below to continue.
//               </p>
//             </div>
//           </div>

//           <div className="px-6 py-5">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="receipt"
//                   className="mb-1.5 block text-[12px] font-semibold text-gray-700"
//                 >
//                   Payment receipt
//                 </label>
//                 <input
//                   id="receipt"
//                   type="file"
//                   accept="image/jpeg,image/png,image/webp,application/pdf"
//                   onChange={(e) => setReceipt(e.target.files?.[0] || null)}
//                   className={inputClass}
//                   required
//                   disabled={Boolean(success)}
//                 />
//                 <p className="mt-1.5 text-[11px] text-gray-500">
//                   JPG, PNG, WEBP, or PDF. Maximum file size: 5 MB.
//                 </p>
//                 {receipt && (
//                   <p className="mt-2 flex items-center gap-2 text-[12px] text-gray-700">
//                     <Upload size={14} />
//                     {receipt.name} · {(receipt.size / 1024 / 1024).toFixed(2)} MB
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-start gap-2.5 rounded-md bg-gray-50 px-3 py-2.5">
//                 <ShieldCheck
//                   size={14}
//                   className="mt-0.5 shrink-0 text-gray-500"
//                 />
//                 <p className="text-[11.5px] leading-5 text-gray-600">
//                   This is a simulation. Upload demonstration evidence only; do
//                   not transfer real money or upload real payment receipts. No
//                   physical ATM card will be issued.
//                 </p>
//               </div>

//               {/* Actions */}
//               <div className="flex flex-col-reverse items-stretch gap-2 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={() => navigate(-1)}
//                   className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting || !id || Boolean(success)}
//                   className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {submitting ? (
//                     <>
//                       <LoaderCircle size={14} className="animate-spin" />
//                       Submitting…
//                     </>
//                   ) : (
//                     "Submit for admin review"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ShieldCheck,
  UploadCloud,
  FileText,
  X,
  Info,
  Clock3,
  ArrowLeft,
} from "lucide-react";
import { submitATMCardPayment } from "../services/atmCardService";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const REDIRECT_MS = 4000;

/* ------------------------------------------------------------------ */
/* Receipt uploader — identical component used in Deposit.jsx         */
/* ------------------------------------------------------------------ */

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


export default function ATMCardPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const withdrawalId = searchParams.get("withdrawalId");

  const [receipt, setReceipt] = useState(null);
  const [receiptError, setReceiptError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(Math.ceil(REDIRECT_MS / 1000));

  // Countdown + auto-redirect after success
  useEffect(() => {
    if (!success) return;
    setCountdown(Math.ceil(REDIRECT_MS / 1000));
    const tick = window.setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    const nextPath = withdrawalId
      ? `/cards?withdrawalId=${encodeURIComponent(withdrawalId)}`
      : "/cards";
    const nav = window.setTimeout(() => navigate(nextPath), REDIRECT_MS);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(nav);
    };
  }, [success, navigate, withdrawalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (success) return;
    setError("");

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
      setReceiptError("");
      await submitATMCardPayment(id, receipt);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your ATM card payment evidence.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
     

      {/* Success state replaces the form */}
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-emerald-900">
                Submitted for  review
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-emerald-800">
                Your application is awaiting review.
                You&apos;ll return to your Virtual Card overview in{" "}
                <span className="font-semibold tabular-nums">{countdown}s</span>
                .
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      withdrawalId
                        ? `/cards?withdrawalId=${encodeURIComponent(withdrawalId)}`
                        : "/cards",
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-800"
                >
                  Go to Virtual Card overview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setReceipt(null);
                  }}
                  className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-[13px] font-semibold text-emerald-800 transition hover:bg-emerald-50"
                >
                  Submit another receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5"
            >
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-rose-600"
              />
              <p className="text-[12px] leading-5 text-rose-800">{error}</p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Form card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0b3b8c]/10 text-[#0b3b8c]">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-gray-900">
                    Virtual Card
                  </h2>
                </div>
              </div>

              <div className="px-6 py-5">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      disabled={submitting || !id || !receipt}
                      className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

         
          </div>
        </>
      )}
    </div>
  );
}