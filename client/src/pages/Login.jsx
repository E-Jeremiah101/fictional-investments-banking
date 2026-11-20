// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ShieldCheck, Lock, ChevronRight, Delete } from "lucide-react";
// import { useAuth } from "../context/AuthContext.jsx";

// const inputClassName =
//   "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15";

// function Field({ id, label, required, hint, children }) {
//   return (
//     <div className="min-w-0">
//       <label
//         htmlFor={id}
//         className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600"
//       >
//         {label}
//         {required && <span className="ml-0.5 text-rose-600">*</span>}
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

// /* ---------------- PIN dots ---------------- */

// function PinDots({ length = 4, filled = 0, error = false, reveal = false }) {
//   return (
//     <div
//       className={`flex items-center justify-center gap-4 ${error ? "animate-pin-shake" : ""}`}
//     >
//       {Array.from({ length }).map((_, i) => {
//         const isFilled = i < filled;
//         return (
//           <span
//             key={i}
//             className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition ${
//               error
//                 ? "border-rose-500 bg-rose-500"
//                 : isFilled
//                   ? "border-[#0b3b8c] bg-[#0b3b8c]"
//                   : "border-slate-300 bg-transparent"
//             }`}
//           >
//             {isFilled && reveal && (
//               <span className="text-[9px] font-bold leading-none text-white">
//                 {""}
//               </span>
//             )}
//           </span>
//         );
//       })}
//     </div>
//   );
// }

// /* ---------------- PIN keypad ---------------- */

// function PinKeypad({ onDigit, onDelete, disabled }) {
//   const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

//   return (
//     <div className="mx-auto grid w-full max-w-[280px] grid-cols-3 gap-3">
//       {keys.map((key) => {
//         if (key === "") {
//           return <div key="blank" aria-hidden="true" />;
//         }
//         if (key === "del") {
//           return (
//             <button
//               key="del"
//               type="button"
//               disabled={disabled}
//               onClick={onDelete}
//               aria-label="Delete last digit"
//               className="flex h-14 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40"
//             >
//               <Delete size={22} />
//             </button>
//           );
//         }
//         return (
//           <button
//             key={key}
//             type="button"
//             disabled={disabled}
//             onClick={() => onDigit(key)}
//             className="flex h-14 items-center justify-center rounded-full text-2xl font-light text-slate-900 transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40"
//           >
//             {key}
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// /* ---------------- PIN entry screen ---------------- */

// function PinEntryScreen({
//   title,
//   subtitle,
//   pin,
//   setPin,
//   onSubmit,
//   submitting,
//   error,
//   onBack,
// }) {
//   const [showDigits, setShowDigits] = useState(false);
//   const hideTimer = useRef(null);

//   // auto-submit when 4 digits entered
//   useEffect(() => {
//     if (pin.length === 4 && !submitting) {
//       onSubmit();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pin]);

//   useEffect(() => {
//     return () => clearTimeout(hideTimer.current);
//   }, []);

//   const handleDigit = (digit) => {
//     if (pin.length >= 4) return;
//     setPin(pin + digit);
//   };

//   const handleDelete = () => {
//     setPin(pin.slice(0, -1));
//   };

//   const revealDigits = () => {
//     setShowDigits(true);
//     clearTimeout(hideTimer.current);
//     hideTimer.current = setTimeout(() => setShowDigits(false), 700);
//   };

//   return (
//     <div className="flex flex-col items-center px-4 py-8 sm:py-10">
//       <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//         <Lock size={20} />
//       </div>
//       <h2 className="mt-2 text-center text-base font-bold text-slate-900">
//         {title}
//       </h2>
//       <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-slate-500">
//         {subtitle}
//       </p>

//       <button
//         type="button"
//         onClick={revealDigits}
//         className="mt-7 mb-2 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3b8c]/30"
//         aria-label="Show entered digits"
//       >
//         <PinDots
//           filled={pin.length}
//           error={Boolean(error)}
//           reveal={showDigits}
//         />
//       </button>

//       {error && (
//         <p
//           role="alert"
//           className="mb-2 max-w-xs text-center text-[11px] font-medium text-rose-600"
//         >
//           {error}
//         </p>
//       )}

//       <div className="mt-4 w-full">
//         <PinKeypad
//           onDigit={handleDigit}
//           onDelete={handleDelete}
//           disabled={submitting}
//         />
//       </div>

//       {onBack && (
//         <button
//           type="button"
//           onClick={onBack}
//           className="mt-6 text-xs font-semibold text-[#0b3b8c] underline"
//         >
//           Use email & password instead
//         </button>
//       )}
//     </div>
//   );
// }

// /* ---------------- Login page ---------------- */

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

//   const submitPin = async () => {
//     if (pin.length !== 4 || submitting) return;
//     setError("");
//     setSubmitting(true);
//     try {
//       await verifyTransactionPin(challengeToken, pin);
//       navigate("/dashboard", { replace: true });
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Incorrect PIN. Please try again.",
//       );
//       setPin("");
//     } finally {
//       setSubmitting(false);
//     }
//   };

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
//     <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-slate-800">
//       {/* Masthead */}
//       <header className="border-b border-slate-200 bg-white">
//         <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
//           <Link to="/" className="flex min-w-0 items-center gap-2.5">
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0b1a3a] text-xs font-bold text-white shadow-lg shadow-[#0b1a3a]/20">
//               PS
//             </div>
//             <div className="min-w-0 leading-tight">
//               <div className="truncate text-[13px] font-bold text-slate-900">
//                 PrimeStone Capital
//               </div>
//               <div className="truncate text-[10px] uppercase tracking-widest text-slate-500">
//                 Online banking
//               </div>
//             </div>
//           </Link>
//           <div className="flex shrink-0 items-center gap-2 sm:gap-4">

//             <Link
//               to="/register"
//               className="rounded-lg border border-[#0b3b8c] px-3 py-2 text-[11px] font-semibold text-[#0b3b8c] transition hover:bg-[#0b3b8c] hover:text-white"
//             >
//               Open account
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-3 py-6 sm:px-4 lg:grid-cols-[minmax(0,1fr)_280px]">
//         <div className="min-w-0">
//           <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
//               <div className="flex items-start justify-between gap-3">
//                 <div className="min-w-0">
//                   <h2 className="text-base font-bold text-[#]">
//                     {challengeToken
//                       ? pinSetupRequired
//                         ? "Set your transaction PIN"
//                         : ""
//                       : ""}
//                   </h2>
//                   <p className="mt-1 text- text-slate-500">
//                     {challengeToken
//                       ? pinSetupRequired
//                         ? "Create a 4-digit PIN to finish setting up your account."
//                         : ""
//                       : "Access your PrimeStone Capital account."}
//                   </p>
//                 </div>
//                 <ShieldCheck
//                   size={26}
//                   className="hidden shrink-0 text-slate-300 sm:block"
//                 />
//               </div>
//             </div>

//             {challengeToken ? (
//               <PinEntryScreen
//                 title={
//                   pinSetupRequired
//                     ? "Create a 4-digit PIN"
//                     : "Enter your 4-digit PIN"
//                 }
//                 subtitle={
//                   pinSetupRequired
//                     ? "You'll use this PIN to authorize transfers and confirm sensitive actions."
//                     : "Enter the transaction PIN you set when opening your account."
//                 }
//                 pin={pin}
//                 setPin={setPin}
//                 onSubmit={submitPin}
//                 submitting={submitting}
//                 error={error}
//                 onBack={returnToCredentials}
//               />
//             ) : (
//               <form onSubmit={handleSubmit}>
//                 <div className="space-y-5 px-4 py-5 sm:px-6">
//                   <fieldset className="min-w-0 space-y-4">
//                     <div className="grid grid-cols-1 gap-4">
//                       <Field id="email" label="Email address" required>
//                         <input
//                           id="email"
//                           type="email"
//                           autoComplete="email"
//                           required
//                           value={email}
//                           onChange={(event) => setEmail(event.target.value)}
//                           className={inputClassName}
//                           placeholder="you@example.com"
//                         />
//                       </Field>
//                       <Field id="password" label="Password" required>
//                         <input
//                           id="password"
//                           type="password"
//                           autoComplete="current-password"
//                           required
//                           value={password}
//                           onChange={(event) => setPassword(event.target.value)}
//                           className={inputClassName}
//                           placeholder="Enter your password"
//                         />
//                       </Field>
//                     </div>
//                   </fieldset>

//                   {error && (
//                     <div
//                       role="alert"
//                       className="rounded-lg border-l-4 border-rose-500 bg-rose-50 px-3 py-2 text-xs text-rose-800"
//                     >
//                       {error}
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
//                   <div className="sm:flex-1">
//                     <span className="hidden text-[11px] text-slate-500 sm:inline">
//                       Don't have an account?{" "}
//                       <Link
//                         to="/register"
//                         className="font-semibold text-[#0b3b8c] underline"
//                       >
//                         Open one
//                       </Link>
//                     </span>
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={submitting}
//                     className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b3b8c] px-5 py-2.5 text-xs font-semibold tracking-wide text-white transition hover:bg-[#0a3478] disabled:opacity-60 sm:w-auto"
//                   >
//                     {submitting ? (
//                       "Verifying…"
//                     ) : (
//                       <>
//                         Sign In
//                         <ChevronRight size={14} />
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>

//           {!challengeToken && (
//             <p className="mt-4 text-center text-xs text-slate-600 sm:hidden">
//               Don't have an account?{" "}
//               <Link
//                 to="/register"
//                 className="font-semibold text-[#0b3b8c] underline"
//               >
//                 Open one
//               </Link>
//             </p>
//           )}
//         </div>

//         {/* Right rail — desktop only */}
//         {/* <aside className="hidden min-w-0 lg:block">
//           <div className="sticky top-4 space-y-3">
//             <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//               <div className="border-b border-slate-100 bg-slate-50 px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
//                 Sign-in steps
//               </div>
//               <ol className="divide-y divide-slate-100">
//                 <li className="flex items-start gap-2 px-3.5 py-3 text-[11px] text-slate-600">
//                   <span
//                     className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
//                       challengeToken
//                         ? "bg-emerald-100 text-emerald-700"
//                         : "bg-[#0b3b8c] text-white"
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
//                 <li className="flex items-start gap-2 px-3.5 py-3 text-[11px] text-slate-600">
//                   <span
//                     className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
//                       challengeToken
//                         ? "bg-[#0b3b8c] text-white"
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

//           </div>
//         </aside> */}
//       </main>
//     </div>
//   );
// }

// export default Login;
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  ChevronRight,
  Delete,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15";

function Field({ id, label, required, hint, children }) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600"
      >
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
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
                ? "border-rose-500 bg-rose-500"
                : isFilled
                  ? "border-[#0b3b8c] bg-[#0b3b8c]"
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
              className="flex h-14 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40"
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
            className="flex h-14 items-center justify-center rounded-full text-2xl font-light text-slate-900 transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-40"
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
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Lock size={20} />
      </div>
      <h2 className="mt-2 text-center text-base font-bold text-slate-900">
        {title}
      </h2>
      <p className="mt-1 max-w-xs text-center text-xs leading-relaxed text-slate-500">
        {subtitle}
      </p>

      <button
        type="button"
        onClick={revealDigits}
        className="mt-7 mb-2 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3b8c]/30"
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
          className="mb-2 max-w-xs text-center text-[11px] font-medium text-rose-600"
        >
          {error}
        </p>
      )}

      {submitting && (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600"
        >
          <LoaderCircle size={14} className="animate-spin" />
          Verifying PIN…
        </div>
      )}

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
          className="mt-6 text-xs font-semibold text-[#0b3b8c] underline"
        >
          Back to email & password
        </button>
      )}
    </div>
  );
}

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
      // Let the shake animation play, then clear the PIN for a fresh attempt
      setTimeout(() => setPin(""), 450);
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
    <div className="min-h-screen overflow-x-hidden bg-[#f6f8fb] text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0b1a3a] text-xs font-bold text-white shadow-lg shadow-[#0b1a3a]/20">
              PS
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[13px] font-bold text-slate-900">
                PrimeStone Capital
              </div>
  
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              to="/register"
              className="rounded-lg border border-[#0b3b8c] px-3 py-2 text-[11px] font-semibold text-[#0b3b8c] transition hover:bg-[#0b3b8c] hover:text-white"
            >
              Open account
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-3 py-6 sm:px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900">
                    {challengeToken
                      ? pinSetupRequired
                        ? "Set your transaction PIN"
                        : ""
                      : "Sign in to your account"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {challengeToken
                      ? pinSetupRequired
                        ? "Create a 4-digit PIN to finish setting up your account."
                        : ""
                      : "Access your PrimeStone Capital account."}
                  </p>
                </div>
                <ShieldCheck
                  size={26}
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
                      className="rounded-lg border-l-4 border-rose-500 bg-rose-50 px-3 py-2 text-xs text-rose-800"
                    >
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
                  <div className="sm:flex-1">
                    <span className="hidden text-[11px] text-slate-500 sm:inline">
                      Don't have an account?{" "}
                      <Link
                        to="/register"
                        className="font-semibold text-[#0b3b8c] underline"
                      >
                        Open one
                      </Link>
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b3b8c] px-5 py-2.5 text-xs font-semibold tracking-wide text-white transition hover:bg-[#0a3478] disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        Signing in…
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
                className="font-semibold text-[#0b3b8c] underline"
              >
                Open one
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Login;