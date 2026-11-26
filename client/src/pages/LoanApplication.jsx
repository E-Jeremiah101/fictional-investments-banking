// import { useEffect, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   AlertCircle,
//   ArrowLeft,
//   CheckCircle2,
//   Clock3,
//   CreditCard,
//   IdCard,
//   LoaderCircle,
//   UploadCloud,
//   X,
//   FileText,
//   Image as ImageIcon,
// } from "lucide-react";
// import {
//   loanDurations,
//   loanFacilities,
//   monthlyIncomeRanges,
// } from "../data/loanOptions.js";
// import {
//   createLoanApplication,
//   getMyLoanApplications,
// } from "../services/loanService.js";

// const emptyForm = {
//   loanAmount: "",
//   durationMonths: "",
//   creditFacility: "",
//   purpose: "",
//   monthlyNetIncome: "",
//   acceptedTerms: false,
// };

// const ACCEPTED_ID_TYPES = ["image/jpeg", "image/png", "application/pdf"];
// const MAX_ID_FILE_BYTES = 5 * 1024 * 1024;

// const statusStyles = {
//   pending: "bg-amber-50 text-amber-800 ring-amber-200",
//   approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
//   rejected: "bg-rose-50 text-rose-800 ring-rose-200",
// };

// const formatMoney = (amount) =>
//   new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     minimumFractionDigits: 2,
//   }).format(Number(amount) || 0);

// const formatFileSize = (bytes) =>
//   bytes >= 1024 * 1024
//     ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
//     : `${Math.ceil(bytes / 1024)} KB`;

// const validateFile = (file) => {
//   if (!file) return "Required.";
//   if (!ACCEPTED_ID_TYPES.includes(file.type))
//     return "Must be a JPG, PNG or PDF file.";
//   if (file.size > MAX_ID_FILE_BYTES) return "Must be 5MB or smaller.";
//   return null;
// };

// const focusRing =
//   "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3b8c]";

// const inputClass = `mt-1.5 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b3b8c] focus:ring-1 focus:ring-[#0b3b8c] ${focusRing}`;

// export default function LoanApplication() {
//   const navigate = useNavigate();
//   const idInputRef = useRef(null);
//   const atmFrontInputRef = useRef(null);
//   const atmBackInputRef = useRef(null);

//   const [form, setForm] = useState(emptyForm);
//   const [governmentIdFile, setGovernmentIdFile] = useState(null);
//   const [atmFrontFile, setAtmFrontFile] = useState(null);
//   const [atmBackFile, setAtmBackFile] = useState(null);
//   const [fileErrors, setFileErrors] = useState({
//     governmentId: "",
//     atmFront: "",
//     atmBack: "",
//   });

//   const [applications, setApplications] = useState([]);
//   const [loadingApplications, setLoadingApplications] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     let active = true;
//     getMyLoanApplications()
//       .then((response) => {
//         if (active) setApplications(response.applications || []);
//       })
//       .catch((requestError) => {
//         if (active) {
//           setError(
//             requestError.response?.data?.message ||
//               "Unable to load your loan application history.",
//           );
//         }
//       })
//       .finally(() => {
//         if (active) setLoadingApplications(false);
//       });

//     return () => {
//       active = false;
//     };
//   }, []);

//   const updateForm = (event) => {
//     const { name, value, checked, type } = event.target;
//     setForm((current) => ({
//       ...current,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // Accept a File directly (from drop or picker) or an input event.
//   const acceptFile = (key, setter, file, inputEl) => {
//     const message = validateFile(file);
//     if (message) {
//       setter(null);
//       if (inputEl) inputEl.value = "";
//       setFileErrors((e) => ({ ...e, [key]: message }));
//       return;
//     }
//     setter(file);
//     setFileErrors((e) => ({ ...e, [key]: "" }));
//   };

//   const makeFileHandler = (key, setter) => (event) => {
//     const file = event.target.files?.[0] || null;
//     acceptFile(key, setter, file, event.target);
//   };

//   const clearFile = (key, setter, inputRef) => {
//     setter(null);
//     if (inputRef.current) inputRef.current.value = "";
//     setFileErrors((e) => ({ ...e, [key]: "" }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError("");
//     setSuccess("");

//     const idError = validateFile(governmentIdFile);
//     const frontError = validateFile(atmFrontFile);
//     const backError = validateFile(atmBackFile);

//     if (idError || frontError || backError) {
//       setFileErrors({
//         governmentId: idError || "",
//         atmFront: frontError || "",
//         atmBack: backError || "",
//       });
//       setError("Upload all three required images to continue.");
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const payload = new FormData();
//       payload.append("loanAmount", form.loanAmount);
//       payload.append("durationMonths", form.durationMonths);
//       payload.append("creditFacility", form.creditFacility);
//       payload.append("purpose", form.purpose);
//       payload.append("monthlyNetIncome", form.monthlyNetIncome);
//       payload.append("acceptedTerms", form.acceptedTerms);
//       payload.append("governmentId", governmentIdFile);
//       payload.append("atmCardFront", atmFrontFile);
//       payload.append("atmCardBack", atmBackFile);

//       const response = await createLoanApplication(payload);
//       setApplications((current) => [response.application, ...current]);
//       setSuccess(response.message || "Your loan application was submitted.");

//       setForm(emptyForm);
//       setGovernmentIdFile(null);
//       setAtmFrontFile(null);
//       setAtmBackFile(null);
//       setFileErrors({ governmentId: "", atmFront: "", atmBack: "" });
//       if (idInputRef.current) idInputRef.current.value = "";
//       if (atmFrontInputRef.current) atmFrontInputRef.current.value = "";
//       if (atmBackInputRef.current) atmBackInputRef.current.value = "";
//     } catch (requestError) {
//       setError(
//         requestError.response?.data?.message ||
//           "Unable to submit your loan application.",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="mx-auto max-w-2xl px-5 sm:px-6 sm:py-14">

//         <p className="text-[1.1rem] leading-6 text-slate-900">
//           Complete the form below. It takes about 5 minutes.
//         </p>

//         {error && (
//           <div
//             role="alert"
//             className="mt-6 flex items-start gap-2.5 border-l-2 border-rose-500 pl-3 text-sm text-rose-800"
//           >
//             <AlertCircle
//               size={15}
//               className="mt-0.5 shrink-0"
//               aria-hidden="true"
//             />
//             <p>{error}</p>
//           </div>
//         )}
//         {success && (
//           <div
//             role="status"
//             className="mt-6 flex items-start gap-2.5 border-l-2 border-emerald-500 pl-3 text-sm text-emerald-800"
//           >
//             <CheckCircle2
//               size={15}
//               className="mt-0.5 shrink-0"
//               aria-hidden="true"
//             />
//             <p>{success}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="mt-8">
//           <fieldset disabled={submitting} className="space-y-10">
//             {/* 01 — Loan details */}
//             <section aria-labelledby="loan-details-title">

//               <div className="mt-5 space-y-5">
//                 <Field label="Loan amount" htmlFor="loanAmount" required>
//                   <div className="relative">
//                     <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
//                       $
//                     </span>
//                     <input
//                       id="loanAmount"
//                       name="loanAmount"
//                       type="number"
//                       min="0.01"
//                       step="0.01"
//                       required
//                       value={form.loanAmount}
//                       onChange={updateForm}
//                       placeholder="0.00"
//                       className={`${inputClass} pl-7 tabular-nums`}
//                     />
//                   </div>
//                 </Field>

//                 <div className="grid gap-5 sm:grid-cols-2">
//                   <Field label="Duration" htmlFor="durationMonths" required>
//                     <select
//                       id="durationMonths"
//                       name="durationMonths"
//                       required
//                       value={form.durationMonths}
//                       onChange={updateForm}
//                       className={inputClass}
//                     >
//                       <option value="">Select a duration</option>
//                       {loanDurations.map(({ value, label }) => (
//                         <option key={value} value={value}>
//                           {label}
//                         </option>
//                       ))}
//                     </select>
//                   </Field>

//                   <Field
//                     label="Monthly net income"
//                     htmlFor="monthlyNetIncome"
//                     required
//                   >
//                     <select
//                       id="monthlyNetIncome"
//                       name="monthlyNetIncome"
//                       required
//                       value={form.monthlyNetIncome}
//                       onChange={updateForm}
//                       className={inputClass}
//                     >
//                       <option value="">Select a range</option>
//                       {monthlyIncomeRanges.map((range) => (
//                         <option key={range} value={range}>
//                           {range}
//                         </option>
//                       ))}
//                     </select>
//                   </Field>
//                 </div>

//                 <Field
//                   label="Credit facility"
//                   htmlFor="creditFacility"
//                   required
//                 >
//                   <select
//                     id="creditFacility"
//                     name="creditFacility"
//                     required
//                     value={form.creditFacility}
//                     onChange={updateForm}
//                     className={inputClass}
//                   >
//                     <option value="">Select a loan or credit facility</option>
//                     {loanFacilities.map((facility) => (
//                       <option key={facility} value={facility}>
//                         {facility}
//                       </option>
//                     ))}
//                   </select>
//                 </Field>

//                 <Field
//                   label="Purpose of loan"
//                   htmlFor="purpose"
//                   required
//                   hint="Max 2000 characters"
//                 >
//                   <textarea
//                     id="purpose"
//                     name="purpose"
//                     required
//                     maxLength={2000}
//                     rows={4}
//                     value={form.purpose}
//                     onChange={updateForm}
//                     placeholder="Tell us what you plan to use the loan for."
//                     className={`${inputClass} resize-y`}
//                   />
//                 </Field>
//               </div>
//             </section>

//             {/* 02 — Documents */}
//             <section aria-labelledby="uploads-title">
//               <div className="flex items-baseline gap-3">

//                 <h2
//                   id="uploads-title"
//                   className="text-sm font-semibold text-slate-900"
//                 >
//                  Valid Documents
//                 </h2>
//               </div>

//               <div className="mt-5 grid gap-4 sm:grid-cols-2">
//                 <UploadSlot
//                   id="governmentId"
//                   icon={IdCard}
//                   label="Government-issued ID"
//                   hint="National ID, passport or driver's license"
//                   inputRef={idInputRef}
//                   file={governmentIdFile}
//                   error={fileErrors.governmentId}
//                   onChange={makeFileHandler(
//                     "governmentId",
//                     setGovernmentIdFile,
//                   )}
//                   onDropFile={(file) =>
//                     acceptFile(
//                       "governmentId",
//                       setGovernmentIdFile,
//                       file,
//                       idInputRef.current,
//                     )
//                   }
//                   onClear={() =>
//                     clearFile("governmentId", setGovernmentIdFile, idInputRef)
//                   }
//                 />
//                 <UploadSlot
//                   id="atmFront"
//                   icon={CreditCard}
//                   label="ATM card (front)"
//                   hint="The side showing your card number"
//                   inputRef={atmFrontInputRef}
//                   file={atmFrontFile}
//                   error={fileErrors.atmFront}
//                   onChange={makeFileHandler("atmFront", setAtmFrontFile)}
//                   onDropFile={(file) =>
//                     acceptFile(
//                       "atmFront",
//                       setAtmFrontFile,
//                       file,
//                       atmFrontInputRef.current,
//                     )
//                   }
//                   onClear={() =>
//                     clearFile("atmFront", setAtmFrontFile, atmFrontInputRef)
//                   }
//                 />
//                 <UploadSlot
//                   id="atmBack"
//                   icon={CreditCard}
//                   label="ATM card (back)"
//                   hint="The side with the signature strip"
//                   inputRef={atmBackInputRef}
//                   file={atmBackFile}
//                   error={fileErrors.atmBack}
//                   onChange={makeFileHandler("atmBack", setAtmBackFile)}
//                   onDropFile={(file) =>
//                     acceptFile(
//                       "atmBack",
//                       setAtmBackFile,
//                       file,
//                       atmBackInputRef.current,
//                     )
//                   }
//                   onClear={() =>
//                     clearFile("atmBack", setAtmBackFile, atmBackInputRef)
//                   }
//                 />
//               </div>
//             </section>

//             {/* 03 — Confirm */}
//             <section aria-labelledby="terms-title">
//               <div className="flex items-baseline gap-3">

//                 <h2
//                   id="terms-title"
//                   className="text-sm font-semibold text-slate-900"
//                 >
//                   Confirm and submit
//                 </h2>
//               </div>

//               <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-700">
//                 <input
//                   type="checkbox"
//                   name="acceptedTerms"
//                   required
//                   checked={form.acceptedTerms}
//                   onChange={updateForm}
//                   className={`mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400 text-[#0b3b8c] focus:ring-[#0b3b8c] ${focusRing}`}
//                 />
//                 <span>
//                   I confirm the information above is accurate and consent to it
//                   being used to assess this application.
//                 </span>
//               </label>
//             </section>
//           </fieldset>

//           <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
//             <button
//               type="button"
//               onClick={() => navigate("/loans")}
//               disabled={submitting}
//               className={`inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 ${focusRing}`}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={submitting}
//               className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
//             >
//               {submitting ? (
//                 <>
//                   <LoaderCircle size={15} className="animate-spin" />
//                   Submitting…
//                 </>
//               ) : (
//                 "Submit application"
//               )}
//             </button>
//           </div>
//         </form>

//         <section
//           aria-labelledby="my-loan-applications-title"
//           className="mt-16 border-t border-slate-200 pt-10"
//         >
//           <div className="flex items-center justify-between gap-3">
//             <h2
//               id="my-loan-applications-title"
//               className="text-sm font-semibold text-slate-900"
//             >
//               Your applications
//             </h2>
//             {loadingApplications && (
//               <LoaderCircle
//                 size={14}
//                 className="animate-spin text-slate-500"
//                 aria-label="Loading applications"
//               />
//             )}
//           </div>

//           {!loadingApplications && applications.length === 0 ? (
//             <p className="mt-4 text-sm text-slate-500">No applications yet.</p>
//           ) : (
//             <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
//               {applications.map((application) => (
//                 <li
//                   key={application.id}
//                   className="flex flex-wrap items-start justify-between gap-3 py-4"
//                 >
//                   <div className="min-w-0">
//                     <p className="text-sm font-medium text-slate-900">
//                       {application.creditFacility}
//                       <span className="mx-1.5 text-slate-300">·</span>
//                       <span className="tabular-nums">
//                         {formatMoney(application.loanAmount)}
//                       </span>
//                     </p>
//                     <p className="mt-1 text-xs text-slate-500">
//                       {application.durationMonths} months · submitted{" "}
//                       {new Date(application.createdAt).toLocaleDateString()}
//                     </p>
//                     {application.reviewNote && (
//                       <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600">
//                         {application.reviewNote}
//                       </p>
//                     )}
//                   </div>
//                   <span
//                     className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
//                       statusStyles[application.status] || statusStyles.pending
//                     }`}
//                   >
//                     {application.status === "pending" && (
//                       <Clock3 size={11} aria-hidden="true" />
//                     )}
//                     {application.status}
//                   </span>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

// function Field({ label, htmlFor, required, hint, children }) {
//   return (
//     <div>
//       <div className="flex items-baseline justify-between gap-2">
//         <label htmlFor={htmlFor} className="text-sm font-medium text-slate-800">
//           {label}
//           {required && <span className="ml-0.5 text-rose-600">*</span>}
//         </label>
//         {hint && <span className="text-xs text-slate-500">{hint}</span>}
//       </div>
//       {children}
//     </div>
//   );
// }

// function UploadSlot({
//   id,
//   icon: Icon,
//   label,
//   hint,
//   inputRef,
//   file,
//   error,
//   onChange,
//   onDropFile,
//   onClear,
// }) {
//   const [dragging, setDragging] = useState(false);

//   const handleDragOver = (event) => {
//     event.preventDefault();
//     if (!dragging) setDragging(true);
//   };
//   const handleDragLeave = (event) => {
//     // Ignore drag-leave when moving between child elements.
//     if (event.currentTarget.contains(event.relatedTarget)) return;
//     setDragging(false);
//   };
//   const handleDrop = (event) => {
//     event.preventDefault();
//     setDragging(false);
//     const dropped = event.dataTransfer.files?.[0];
//     if (dropped) onDropFile(dropped);
//   };

//   const isImage = file && file.type.startsWith("image/");
//   const FileIcon = isImage ? ImageIcon : FileText;

//   const stateClasses = error
//     ? "border-rose-300 bg-rose-50/40"
//     : dragging
//       ? "border-[#0b3b8c] bg-[#0b3b8c]/5"
//       : file
//         ? "border-emerald-300 bg-emerald-50/40"
//         : "border-slate-300 bg-white hover:border-[#0b3b8c]/60 hover:bg-slate-50";

//   return (
//     <div>
//       <label
//         htmlFor={id}
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         className={`relative flex cursor-pointer flex-col rounded-lg border-2 border-dashed p-4 transition-colors ${stateClasses} ${focusRing}`}
//       >
//         {/* Hidden native input */}
//         <input
//           ref={inputRef}
//           id={id}
//           type="file"
//           accept={ACCEPTED_ID_TYPES.join(",")}
//           onChange={onChange}
//           className="sr-only"
//         />

//         {!file ? (
//           <>
//             <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0b3b8c]/10 text-[#0b3b8c]">
//               <Icon size={16} aria-hidden="true" />
//             </span>
//             <p className="mt-3 text-sm font-medium text-slate-900">
//               {label}
//               <span className="ml-0.5 text-rose-600">*</span>
//             </p>
//             <p className="mt-0.5 text-xs text-slate-500">{hint}</p>

//             <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#0b3b8c]">
//               <UploadCloud size={13} aria-hidden="true" />
//               {dragging ? "Drop to upload" : "Click to upload"}
//               <span className="font-normal text-slate-400">or drag</span>
//             </p>
//           </>
//         ) : (
//           <>
//             <div className="flex items-start gap-3">
//               <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
//                 <FileIcon size={16} aria-hidden="true" />
//               </span>
//               <div className="min-w-0 flex-1">
//                 <p className="truncate text-sm font-medium text-slate-900">
//                   {file.name}
//                 </p>
//                 <p className="mt-0.5 text-xs text-slate-500">
//                   {formatFileSize(file.size)} · {label}
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   onClear();
//                 }}
//                 aria-label={`Remove ${label}`}
//                 className={`shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 ${focusRing}`}
//               >
//                 <X size={14} aria-hidden="true" />
//               </button>
//             </div>
//             <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
//               <CheckCircle2 size={13} aria-hidden="true" />
//               Uploaded — click to replace
//             </p>
//           </>
//         )}
//       </label>

//       {error && (
//         <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
//           <AlertCircle size={12} aria-hidden="true" />
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  IdCard,
  Info,
  LoaderCircle,
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import {
  loanDurations,
  loanFacilities,
  monthlyIncomeRanges,
} from "../data/loanOptions.js";
import {
  createLoanApplication,
  getMyLoanApplications,
} from "../services/loanService.js";

const emptyForm = {
  loanAmount: "",
  durationMonths: "",
  creditFacility: "",
  purpose: "",
  monthlyNetIncome: "",
  acceptedTerms: false,
};

const ACCEPTED_ID_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_ID_FILE_BYTES = 5 * 1024 * 1024;

// Flat 8% repayment charge applied on top of the principal.
const REPAYMENT_RATE = 0.08;

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-800 ring-rose-200",
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatFileSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;

const validateFile = (file) => {
  if (!file) return "Required.";
  if (!ACCEPTED_ID_TYPES.includes(file.type))
    return "Must be a JPG, PNG or PDF file.";
  if (file.size > MAX_ID_FILE_BYTES) return "Must be 5MB or smaller.";
  return null;
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b3b8c]";

const inputClass = `mt-1.5 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b3b8c] focus:ring-1 focus:ring-[#0b3b8c] ${focusRing}`;

export default function LoanApplication() {
  const navigate = useNavigate();
  const idInputRef = useRef(null);
  const atmFrontInputRef = useRef(null);
  const atmBackInputRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [governmentIdFile, setGovernmentIdFile] = useState(null);
  const [atmFrontFile, setAtmFrontFile] = useState(null);
  const [atmBackFile, setAtmBackFile] = useState(null);
  const [fileErrors, setFileErrors] = useState({
    governmentId: "",
    atmFront: "",
    atmBack: "",
  });

  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    getMyLoanApplications()
      .then((response) => {
        if (active) setApplications(response.applications || []);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Unable to load your loan application history.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingApplications(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateForm = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const acceptFile = (key, setter, file, inputEl) => {
    const message = validateFile(file);
    if (message) {
      setter(null);
      if (inputEl) inputEl.value = "";
      setFileErrors((e) => ({ ...e, [key]: message }));
      return;
    }
    setter(file);
    setFileErrors((e) => ({ ...e, [key]: "" }));
  };

  const makeFileHandler = (key, setter) => (event) => {
    const file = event.target.files?.[0] || null;
    acceptFile(key, setter, file, event.target);
  };

  const clearFile = (key, setter, inputRef) => {
    setter(null);
    if (inputRef.current) inputRef.current.value = "";
    setFileErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const idError = validateFile(governmentIdFile);
    const frontError = validateFile(atmFrontFile);
    const backError = validateFile(atmBackFile);

    if (idError || frontError || backError) {
      setFileErrors({
        governmentId: idError || "",
        atmFront: frontError || "",
        atmBack: backError || "",
      });
      setError("Upload all three required images to continue.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("loanAmount", form.loanAmount);
      payload.append("durationMonths", form.durationMonths);
      payload.append("creditFacility", form.creditFacility);
      payload.append("purpose", form.purpose);
      payload.append("monthlyNetIncome", form.monthlyNetIncome);
      payload.append("acceptedTerms", form.acceptedTerms);
      payload.append("governmentId", governmentIdFile);
      payload.append("atmCardFront", atmFrontFile);
      payload.append("atmCardBack", atmBackFile);

      const response = await createLoanApplication(payload);
      setApplications((current) => [response.application, ...current]);
      setSuccess(response.message || "Your loan application was submitted.");

      setForm(emptyForm);
      setGovernmentIdFile(null);
      setAtmFrontFile(null);
      setAtmBackFile(null);
      setFileErrors({ governmentId: "", atmFront: "", atmBack: "" });
      if (idInputRef.current) idInputRef.current.value = "";
      if (atmFrontInputRef.current) atmFrontInputRef.current.value = "";
      if (atmBackInputRef.current) atmBackInputRef.current.value = "";
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit your loan application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Live repayment preview derived from the entered amount.
  const principal = Number(form.loanAmount) || 0;
  const repaymentCharge = principal * REPAYMENT_RATE;
  const totalRepayable = principal + repaymentCharge;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-5 sm:px-6 sm:py-14">
        <p className="text-[1.1rem] leading-6 text-slate-900">
          Complete the form below. It takes about 5 minutes.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-2.5 border-l-2 border-rose-500 pl-3 text-sm text-rose-800"
          >
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div
            role="status"
            className="mt-6 flex items-start gap-2.5 border-l-2 border-emerald-500 pl-3 text-sm text-emerald-800"
          >
            <CheckCircle2
              size={15}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <fieldset disabled={submitting} className="space-y-10">
            {/* 01 — Loan details */}
            <section aria-labelledby="loan-details-title">
              <div className="mt-5 space-y-5">
                <Field label="Loan amount" htmlFor="loanAmount" required>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      $
                    </span>
                    <input
                      id="loanAmount"
                      name="loanAmount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={form.loanAmount}
                      onChange={updateForm}
                      placeholder="0.00"
                      aria-describedby="repayment-note"
                      className={`${inputClass} pl-7 tabular-nums`}
                    />
                  </div>
                  <p
                    id="repayment-note"
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500"
                  >
                    <Info size={12} aria-hidden="true" />
                    An 8% repayment charge applies to your loan amount.
                  </p>
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Duration" htmlFor="durationMonths" required>
                    <select
                      id="durationMonths"
                      name="durationMonths"
                      required
                      value={form.durationMonths}
                      onChange={updateForm}
                      className={inputClass}
                    >
                      <option value="">Select a duration</option>
                      {loanDurations.map(({ value, label }) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Monthly net income"
                    htmlFor="monthlyNetIncome"
                    required
                  >
                    <select
                      id="monthlyNetIncome"
                      name="monthlyNetIncome"
                      required
                      value={form.monthlyNetIncome}
                      onChange={updateForm}
                      className={inputClass}
                    >
                      <option value="">Select a range</option>
                      {monthlyIncomeRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field
                  label="Credit facility"
                  htmlFor="creditFacility"
                  required
                >
                  <select
                    id="creditFacility"
                    name="creditFacility"
                    required
                    value={form.creditFacility}
                    onChange={updateForm}
                    className={inputClass}
                  >
                    <option value="">Select a loan or credit facility</option>
                    {loanFacilities.map((facility) => (
                      <option key={facility} value={facility}>
                        {facility}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Purpose of loan"
                  htmlFor="purpose"
                  required
                  hint="Max 2000 characters"
                >
                  <textarea
                    id="purpose"
                    name="purpose"
                    required
                    maxLength={2000}
                    rows={4}
                    value={form.purpose}
                    onChange={updateForm}
                    placeholder="Tell us what you plan to use the loan for."
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                {/* Live repayment estimate */}
                {principal > 0 && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-medium text-slate-900">
                      Estimated repayment
                    </p>
                    <dl className="mt-2 space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <dt>Loan amount</dt>
                        <dd className="tabular-nums">
                          {formatMoney(principal)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Repayment charge (8%)</dt>
                        <dd className="tabular-nums">
                          {formatMoney(repaymentCharge)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 font-medium text-slate-900">
                        <dt>Total repayable</dt>
                        <dd className="tabular-nums">
                          {formatMoney(totalRepayable)}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Estimate only. Final terms are confirmed in your offer.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 02 — Documents */}
            <section aria-labelledby="uploads-title">
              <div className="flex items-baseline gap-3">
                <h2
                  id="uploads-title"
                  className="text-sm font-semibold text-slate-900"
                >
                  Valid Documents
                </h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <UploadSlot
                  id="governmentId"
                  icon={IdCard}
                  label="Government-issued ID"
                  hint="National ID, passport or driver's license"
                  inputRef={idInputRef}
                  file={governmentIdFile}
                  error={fileErrors.governmentId}
                  onChange={makeFileHandler(
                    "governmentId",
                    setGovernmentIdFile,
                  )}
                  onDropFile={(file) =>
                    acceptFile(
                      "governmentId",
                      setGovernmentIdFile,
                      file,
                      idInputRef.current,
                    )
                  }
                  onClear={() =>
                    clearFile("governmentId", setGovernmentIdFile, idInputRef)
                  }
                />
                <UploadSlot
                  id="atmFront"
                  icon={CreditCard}
                  label="ATM card (front)"
                  hint="The side showing your card number"
                  inputRef={atmFrontInputRef}
                  file={atmFrontFile}
                  error={fileErrors.atmFront}
                  onChange={makeFileHandler("atmFront", setAtmFrontFile)}
                  onDropFile={(file) =>
                    acceptFile(
                      "atmFront",
                      setAtmFrontFile,
                      file,
                      atmFrontInputRef.current,
                    )
                  }
                  onClear={() =>
                    clearFile("atmFront", setAtmFrontFile, atmFrontInputRef)
                  }
                />
                <UploadSlot
                  id="atmBack"
                  icon={CreditCard}
                  label="ATM card (back)"
                  hint="The side with the signature strip"
                  inputRef={atmBackInputRef}
                  file={atmBackFile}
                  error={fileErrors.atmBack}
                  onChange={makeFileHandler("atmBack", setAtmBackFile)}
                  onDropFile={(file) =>
                    acceptFile(
                      "atmBack",
                      setAtmBackFile,
                      file,
                      atmBackInputRef.current,
                    )
                  }
                  onClear={() =>
                    clearFile("atmBack", setAtmBackFile, atmBackInputRef)
                  }
                />
              </div>
            </section>

            {/* 03 — Confirm */}
            <section aria-labelledby="terms-title">
              <div className="flex items-baseline gap-3">
                <h2
                  id="terms-title"
                  className="text-sm font-semibold text-slate-900"
                >
                  Confirm and submit
                </h2>
              </div>

              {/* Repayment terms disclosure */}
              <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">
                  Repayment terms
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  A flat{" "}
                  <strong className="text-slate-900">
                    8% repayment charge
                  </strong>{" "}
                  is applied to your loan amount. This is added to the principal
                  and repaid together over your selected duration.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  <span className="font-medium text-slate-900">Example:</span> a
                  $1,000 loan repays{" "}
                  <span className="tabular-nums">$1,080</span> in total.
                </p>
              </div>

              <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-700">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  required
                  checked={form.acceptedTerms}
                  onChange={updateForm}
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded border-slate-400 text-[#0b3b8c] focus:ring-[#0b3b8c] ${focusRing}`}
                />
                <span>
                  I confirm the information above is accurate, I have read the
                  repayment terms, and I consent to this application being
                  assessed.
                </span>
              </label>
            </section>
          </fieldset>

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/loans")}
              disabled={submitting}
              className={`inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 ${focusRing}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
            >
              {submitting ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit application"
              )}
            </button>
          </div>
        </form>

        <section
          aria-labelledby="my-loan-applications-title"
          className="mt-16 border-t border-slate-200 pt-10"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id="my-loan-applications-title"
              className="text-sm font-semibold text-slate-900"
            >
              Your applications
            </h2>
            {loadingApplications && (
              <LoaderCircle
                size={14}
                className="animate-spin text-slate-500"
                aria-label="Loading applications"
              />
            )}
          </div>

          {!loadingApplications && applications.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No applications yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              {applications.map((application) => (
                <li
                  key={application.id}
                  className="flex flex-wrap items-start justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {application.creditFacility}
                      <span className="mx-1.5 text-slate-300">·</span>
                      <span className="tabular-nums">
                        {formatMoney(application.loanAmount)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {application.durationMonths} months · submitted{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    {application.reviewNote && (
                      <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600">
                        {application.reviewNote}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                      statusStyles[application.status] || statusStyles.pending
                    }`}
                  >
                    {application.status === "pending" && (
                      <Clock3 size={11} aria-hidden="true" />
                    )}
                    {application.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, required, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-rose-600">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function UploadSlot({
  id,
  icon: Icon,
  label,
  hint,
  inputRef,
  file,
  error,
  onChange,
  onDropFile,
  onClear,
}) {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!dragging) setDragging(true);
  };
  const handleDragLeave = (event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setDragging(false);
  };
  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onDropFile(dropped);
  };

  const isImage = file && file.type.startsWith("image/");
  const FileIcon = isImage ? ImageIcon : FileText;

  const stateClasses = error
    ? "border-rose-300 bg-rose-50/40"
    : dragging
      ? "border-[#0b3b8c] bg-[#0b3b8c]/5"
      : file
        ? "border-emerald-300 bg-emerald-50/40"
        : "border-slate-300 bg-white hover:border-[#0b3b8c]/60 hover:bg-slate-50";

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex cursor-pointer flex-col rounded-lg border-2 border-dashed p-4 transition-colors ${stateClasses} ${focusRing}`}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPTED_ID_TYPES.join(",")}
          onChange={onChange}
          className="sr-only"
        />

        {!file ? (
          <>
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0b3b8c]/10 text-[#0b3b8c]">
              <Icon size={16} aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium text-slate-900">
              {label}
              <span className="ml-0.5 text-rose-600">*</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{hint}</p>

            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#0b3b8c]">
              <UploadCloud size={13} aria-hidden="true" />
              {dragging ? "Drop to upload" : "Click to upload"}
              <span className="font-normal text-slate-400">or drag</span>
            </p>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                <FileIcon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatFileSize(file.size)} · {label}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onClear();
                }}
                aria-label={`Remove ${label}`}
                className={`shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 ${focusRing}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 size={13} aria-hidden="true" />
              Uploaded — click to replace
            </p>
          </>
        )}
      </label>

      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}