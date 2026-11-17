// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   ShieldCheck,
//   Lock,
//   Loader2,
//   Phone,
//   FileText,
//   ChevronRight,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext.jsx";

// const inputClassName =
//   "w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0a2d4d] focus:ring-1 focus:ring-[#0a2d4d]";

// function Field({ id, label, required, hint, children }) {
//   return (
//     <div className="min-w-0">
//       <label
//         htmlFor={id}
//         className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600"
//       >
//         {label}
//         {required && <span className="ml-0.5 text-red-600">*</span>}
//       </label>
//       {children}
//       {hint && (
//         <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
//           {hint}
//         </p>
//       )}
//     </div>
//   );
// }

// function Login() {
//   const navigate = useNavigate();
//   const { login, verifyTransactionPin } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [challengeToken, setChallengeToken] = useState("");
//   const [pinSetupRequired, setPinSetupRequired] = useState(false);
//   const [pin, setPin] = useState("");
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError("");
//     setSubmitting(true);

//     try {
//       if (challengeToken) {
//         await verifyTransactionPin(challengeToken, pin);
//         navigate("/dashboard", { replace: true });
//       } else {
//         const response = await login(email, password);
//         if (!response.challengeToken) {
//           throw new Error("Unable to start secure login.");
//         }
//         setPassword("");
//         setChallengeToken(response.challengeToken);
//         setPinSetupRequired(response.pinSetupRequired === true);
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to log in. Please try again.",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const returnToCredentials = () => {
//     setChallengeToken("");
//     setPinSetupRequired(false);
//     setPin("");
//     setError("");
//   };

//   return (
//     <div className="min-h-screen overflow-x-hidden bg-[#f4f5f7] text-slate-800">

//       {/* Masthead */}
//       <header className="border-b border-slate-200 bg-white">
//         <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
//           <Link to="/" className="flex min-w-0 items-center gap-2.5">
//             <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0a2d4d] text-xs font-bold text-white">
//               PS
//             </div>
//             <div className="min-w-0 leading-tight">
//               <div className="truncate text-[13px] font-bold text-[#0a2d4d]">
//                 PrimeStone Capital
//               </div>
//               <div className="truncate text-[10px] uppercase tracking-widest text-slate-500">
//                 Online banking · Account application
//               </div>
//             </div>
//           </Link>
//           <div className="flex shrink-0 items-center gap-2 sm:gap-4">
//             <div className="hidden items-center gap-1.5 text-[11px] text-slate-600 md:flex">
//               <Lock size={12} className="text-emerald-600" />
//               Secure · TLS 1.3
//             </div>
//             <Link
//               to="/register"
//               className="border border-[#0a2d4d] px-2.5 py-1.5 text-[11px] font-semibold text-[#0a2d4d] transition hover:bg-[#0a2d4d] hover:text-white sm:px-3"
//             >
//               Open account
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Page header */}
//       <div className="border-b border-slate-200 bg-white">

//       </div>

//       <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
//         {/* Main column */}
//         <div className="min-w-0">
//           <form
//             onSubmit={handleSubmit}
//             className="min-w-0 border border-slate-200 bg-white"
//           >
//             <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
//               <div className="flex items-start justify-between gap-3">
//                 <div className="min-w-0">

//                   <h2 className="mt-0.5 text-base font-semibold text-[#0a2d4d]">
//                     {challengeToken
//                       ? pinSetupRequired
//                         ? "Set transaction PIN"
//                         : ""
//                       : "Sign in to your account"}
//                   </h2>
//                   <p className="mt-1 text-xs leading-relaxed text-slate-500">
//                     {challengeToken
//                       ? pinSetupRequired
//                         ? "Create a four-digit transaction PIN to finish setting up your account."
//                         : "Enter your transaction PIN to complete your login."
//                       : ""}
//                   </p>
//                 </div>
//                 <ShieldCheck
//                   size={28}
//                   className="hidden shrink-0 text-slate-300 sm:block"
//                 />
//               </div>
//             </div>

//             <div className="space-y-5 px-4 py-5 sm:px-6">
//               {challengeToken ? (
//                 <fieldset className="min-w-0 space-y-4">

//                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                     <Field
//                       id="transactionPin"
//                       label={
//                         pinSetupRequired
//                           ? "Create 4-digit transaction PIN"
//                           : "4-digit transaction PIN"
//                       }
//                       required
//                       hint={
//                         pinSetupRequired
//                           ? "You'll use this PIN to authorize transfers and confirm sensitive actions."
//                           : ""
//                       }
//                     >
//                       <input
//                         id="transactionPin"
//                         type="password"
//                         inputMode="numeric"
//                         autoComplete="one-time-code"
//                         pattern="[0-9]{4}"
//                         maxLength={4}
//                         minLength={4}
//                         required
//                         autoFocus
//                         value={pin}
//                         onChange={(event) =>
//                           setPin(
//                             event.target.value.replace(/\D/g, "").slice(0, 4),
//                           )
//                         }
//                         className={inputClassName}
//                         placeholder={
//                           pinSetupRequired
//                             ? "Create a 4-digit PIN"
//                             : "Enter your 4-digit PIN"
//                         }
//                       />
//                     </Field>
//                   </div>
//                 </fieldset>
//               ) : (
//                 <fieldset className="min-w-0 space-y-4">

//                   <div className="grid grid-cols-1 gap-4">
//                     <Field id="email" label="Email address" required>
//                       <input
//                         id="email"
//                         type="email"
//                         autoComplete="email"
//                         required
//                         value={email}
//                         onChange={(event) => setEmail(event.target.value)}
//                         className={inputClassName}
//                         placeholder="you@example.com"
//                       />
//                     </Field>
//                     <Field id="password" label="Password" required>
//                       <input
//                         id="password"
//                         type="password"
//                         autoComplete="current-password"
//                         required
//                         value={password}
//                         onChange={(event) => setPassword(event.target.value)}
//                         className={inputClassName}
//                         placeholder="Enter your password"
//                       />
//                     </Field>
//                   </div>
//                 </fieldset>
//               )}

//               {error && (
//                 <div
//                   role="alert"
//                   className="border-l-4 border-red-600 bg-red-50 px-3 py-2 text-xs text-red-800"
//                 >
//                   {error}
//                 </div>
//               )}

//             </div>

//             {/* Footer actions */}
//             <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
//               <div className="sm:flex-1">
//                 {challengeToken ? (
//                   <button
//                     type="button"
//                     onClick={returnToCredentials}
//                     className="w-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:py-2"
//                   >
//                     Back to email & password
//                   </button>
//                 ) : (
//                   <span className="hidden text-[11px] text-slate-500 sm:inline">
//                     Don't have an account?{" "}
//                     <Link
//                       to="/register"
//                       className="font-semibold text-[#0a2d4d] underline"
//                     >
//                       Open one
//                     </Link>
//                   </span>
//                 )}
//               </div>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="inline-flex w-full items-center justify-center gap-2 bg-[#0a2d4d] px-5 py-2.5 text-xs font-semibold  tracking-wide text-white transition hover:bg-[#081f36] disabled:opacity-60 sm:w-auto sm:py-2"
//               >
//                 {submitting ? (
//                   <>
//                     <Loader2 size={14} className="animate-spin" />
//                     Verifying…
//                   </>
//                 ) : challengeToken ? (
//                   pinSetupRequired ? (
//                     <>Set PIN & sign in</>
//                   ) : (
//                     <>Verify PIN</>
//                   )
//                 ) : (
//                   <>
//                     Sign In
//                     <ChevronRight size={14} />
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>

//           {/* Mobile-only: no-account CTA (footer already links it, but this gives a clear path) */}
//           {!challengeToken && (
//             <p className="mt-4 text-center text-xs text-slate-600 sm:hidden">
//               Don't have an account?{" "}
//               <Link
//                 to="/register"
//                 className="font-semibold text-[#0a2d4d] underline"
//               >
//                 Open one
//               </Link>
//             </p>
//           )}

//         </div>

//         {/* Right rail — desktop only */}
//         <aside className="hidden min-w-0 lg:block">
//           <div className="sticky top-4 space-y-3">
//             <div className="border border-slate-200 bg-white">
//               <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
//                 Sign-in steps
//               </div>
//               <ol className="divide-y divide-slate-100">
//                 <li className="flex items-start gap-2 px-3 py-2 text-[11px] text-slate-600">
//                   <span
//                     className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[9px] font-bold ${
//                       challengeToken
//                         ? "bg-emerald-100 text-emerald-700"
//                         : "bg-[#0a2d4d] text-white"
//                     }`}
//                   >
//                     {challengeToken ? "✓" : "1"}
//                   </span>
//                   <span>
//                     <span className="block font-semibold text-slate-800">
//                       Email & password
//                     </span>
//                     Verify your identity
//                   </span>
//                 </li>
//                 <li className="flex items-start gap-2 px-3 py-2 text-[11px] text-slate-600">
//                   <span
//                     className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[9px] font-bold ${
//                       challengeToken
//                         ? "bg-[#0a2d4d] text-white"
//                         : "bg-slate-100 text-slate-500"
//                     }`}
//                   >
//                     2
//                   </span>
//                   <span>
//                     <span className="block font-semibold text-slate-800">
//                       Transaction PIN
//                     </span>
//                     {pinSetupRequired
//                       ? "Set your PIN to finish"
//                       : "Confirm your 4-digit PIN"}
//                   </span>
//                 </li>
//               </ol>
//             </div>

//             <div className="border border-slate-200 bg-white p-3 text-[10px] leading-relaxed text-slate-500">
//               <p className="mb-1 font-semibold text-slate-700">Disclosures</p>
//               <p>
//                 PrimeStone Capital is a fictional institution operating solely
//                 for educational simulation. It is not a bank and is not FDIC
//                 insured. All account numbers, balances, and transactions are
//                 generated for demonstration purposes.
//               </p>
//             </div>
//           </div>
//         </aside>
//       </main>

//     </div>
//   );
// }

// export default Login;

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, Loader2, ChevronRight, Delete } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const inputClassName =
  "w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0a2d4d] focus:ring-1 focus:ring-[#0a2d4d]";

function Field({ id, label, required, hint, children }) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600"
      >
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

/* ---------------- iPhone-style PIN pad ---------------- */

function PinDots({ length = 4, filled = 0, error = false, reveal = false }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 ${error ? "animate-pin-shake" : ""}`}
    >
      {Array.from({ length }).map((_, i) => {
        const isFilled = i < filled;
        return (
          <span
            key={i}
            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition ${
              error
                ? "border-red-500 bg-red-500"
                : isFilled
                  ? "border-[#0a2d4d] bg-[#0a2d4d]"
                  : "border-slate-300 bg-transparent"
            }`}
          >
            {isFilled && reveal && (
              <span className="text-[9px] font-bold leading-none text-white">
                {""}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function PinKeypad({ onDigit, onDelete, disabled }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="mx-auto grid w-full max-w-[280px] grid-cols-3 gap-3">
      {keys.map((key) => {
        if (key === "") {
          return <div key="blank" aria-hidden="true" />;
        }
        if (key === "del") {
          return (
            <button
              key="del"
              type="button"
              disabled={disabled}
              onClick={onDelete}
              aria-label="Delete last digit"
              className="flex h-14 items-center justify-center rounded-full text-slate-700 transition active:bg-slate-200 disabled:opacity-40"
            >
              <Delete size={22} />
            </button>
          );
        }
        return (
          <button
            key={key}
            type="button"
            disabled={disabled}
            onClick={() => onDigit(key)}
            className="flex h-14 items-center justify-center rounded-full text-2xl font-light text-slate-900 transition active:bg-slate-200 disabled:opacity-40"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}

function PinEntryScreen({
  title,
  subtitle,
  pin,
  setPin,
  onSubmit,
  submitting,
  error,
  onBack,
}) {
  const [showDigits, setShowDigits] = useState(false);
  const hideTimer = useRef(null);

  // auto-submit when 4 digits entered (iPhone behavior)
  useEffect(() => {
    if (pin.length === 4 && !submitting) {
      onSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  useEffect(() => {
    return () => clearTimeout(hideTimer.current);
  }, []);

  const handleDigit = (digit) => {
    if (pin.length >= 4) return;
    setPin(pin + digit);
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const revealDigits = () => {
    setShowDigits(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowDigits(false), 700);
  };

  return (
    <div className="flex flex-col items-center px-4 py-8 sm:py-10">
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        <Lock size={18} className="text-slate-700" />
      </div>
      <h2 className="mt-2 text-center text-base font-semibold text-[#0a2d4d]">
        {title}
      </h2>
      <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-slate-500">
        {subtitle}
      </p>

      {/* Dots */}
      <button
        type="button"
        onClick={revealDigits}
        className="mt-7 mb-2 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a2d4d]/30"
        aria-label="Show entered digits"
      >
        <PinDots
          filled={pin.length}
          error={Boolean(error)}
          reveal={showDigits}
        />
      </button>

      {error && (
        <p
          role="alert"
          className="mb-2 max-w-xs text-center text-[11px] font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {submitting && (
        <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <Loader2 size={12} className="animate-spin" />
          Verifying…
        </p>
      )}

      {/* Keypad */}
      <div className="mt-4 w-full">
        <PinKeypad
          onDigit={handleDigit}
          onDelete={handleDelete}
          disabled={submitting}
        />
      </div>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-xs font-semibold text-[#0a2d4d] underline"
        >
          Use email & password instead
        </button>
      )}
    </div>
  );
}

/* ---------------- Login page ---------------- */

function Login() {
  const navigate = useNavigate();
  const { login, verifyTransactionPin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [pinSetupRequired, setPinSetupRequired] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitPin = async () => {
    if (pin.length !== 4 || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await verifyTransactionPin(challengeToken, pin);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Incorrect PIN. Please try again.",
      );
      // clear PIN so the user can retry, but keep error visible for shake
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (challengeToken) {
        // handled by submitPin; this branch is only for keyboard users
        await verifyTransactionPin(challengeToken, pin);
        navigate("/dashboard", { replace: true });
      } else {
        const response = await login(email, password);
        if (!response.challengeToken) {
          throw new Error("Unable to start secure login.");
        }
        setPassword("");
        setChallengeToken(response.challengeToken);
        setPinSetupRequired(response.pinSetupRequired === true);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const returnToCredentials = () => {
    setChallengeToken("");
    setPinSetupRequired(false);
    setPin("");
    setError("");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f5f7] text-slate-800">
      {/* Masthead */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0a2d4d] text-xs font-bold text-white">
              PS
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-bold text-[#0a2d4d]">
                PrimeStone Capital
              </div>
              <div className="truncate text-[10px] uppercase tracking-widest text-slate-500">
                Online banking · Account application
              </div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-1.5 text-[11px] text-slate-600 md:flex">
              <Lock size={12} className="text-emerald-600" />
              Secure · TLS 1.3
            </div>
            <Link
              to="/register"
              className="border border-[#0a2d4d] px-2.5 py-1.5 text-[11px] font-semibold text-[#0a2d4d] transition hover:bg-[#0a2d4d] hover:text-white sm:px-3"
            >
              Open account
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div className="min-w-0 border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="mt-0.5 text-base font-semibold text-[#0a2d4d]">
                    {challengeToken
                      ? pinSetupRequired
                        ? "Set your transaction PIN"
                        : "Enter your transaction PIN"
                      : "Sign in to your account"}
                  </h2>
                  {!challengeToken && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Enter the email and password associated with your account.
                    </p>
                  )}
                </div>
                <ShieldCheck
                  size={28}
                  className="hidden shrink-0 text-slate-300 sm:block"
                />
              </div>
            </div>

            {challengeToken ? (
              <PinEntryScreen
                title={
                  pinSetupRequired
                    ? "Create a 4-digit PIN"
                    : "Enter your 4-digit PIN"
                }
                subtitle={
                  pinSetupRequired
                    ? "You'll use this PIN to authorize transfers and confirm sensitive actions."
                    : "Enter the transaction PIN you set when opening your account."
                }
                pin={pin}
                setPin={setPin}
                onSubmit={submitPin}
                submitting={submitting}
                error={error}
                onBack={returnToCredentials}
              />
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-5 px-4 py-5 sm:px-6">
                  <fieldset className="min-w-0 space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Field id="email" label="Email address" required>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className={inputClassName}
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field id="password" label="Password" required>
                        <input
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className={inputClassName}
                          placeholder="Enter your password"
                        />
                      </Field>
                    </div>
                  </fieldset>

                  {error && (
                    <div
                      role="alert"
                      className="border-l-4 border-red-600 bg-red-50 px-3 py-2 text-xs text-red-800"
                    >
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
                  <div className="sm:flex-1">
                    <span className="hidden text-[11px] text-slate-500 sm:inline">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="font-semibold text-[#0a2d4d] underline"
                      >
                        Open one
                      </Link>
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#0a2d4d] px-5 py-2.5 text-xs font-semibold tracking-wide text-white transition hover:bg-[#081f36] disabled:opacity-60 sm:w-auto sm:py-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Sign In
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {!challengeToken && (
            <p className="mt-4 text-center text-xs text-slate-600 sm:hidden">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#0a2d4d] underline"
              >
                Open one
              </Link>
            </p>
          )}
        </div>

        {/* Right rail — desktop only */}
        <aside className="hidden min-w-0 lg:block">
          <div className="sticky top-4 space-y-3">
            <div className="border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                Sign-in steps
              </div>
              <ol className="divide-y divide-slate-100">
                <li className="flex items-start gap-2 px-3 py-2 text-[11px] text-slate-600">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[9px] font-bold ${
                      challengeToken
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#0a2d4d] text-white"
                    }`}
                  >
                    {challengeToken ? "✓" : "1"}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800">
                      Email & password
                    </span>
                    Verify your identity
                  </span>
                </li>
                <li className="flex items-start gap-2 px-3 py-2 text-[11px] text-slate-600">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[9px] font-bold ${
                      challengeToken
                        ? "bg-[#0a2d4d] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    2
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-800">
                      Transaction PIN
                    </span>
                    {pinSetupRequired
                      ? "Set your PIN to finish"
                      : "Confirm your 4-digit PIN"}
                  </span>
                </li>
              </ol>
            </div>

            <div className="border border-slate-200 bg-white p-3 text-[10px] leading-relaxed text-slate-500">
              <p className="mb-1 font-semibold text-slate-700">Disclosures</p>
              <p>
                PrimeStone Capital is a fictional institution operating solely
                for educational simulation. It is not a bank and is not FDIC
                insured. All account numbers, balances, and transactions are
                generated for demonstration purposes.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Login;