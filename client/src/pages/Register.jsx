import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  ChevronRight,
  Check,
  Phone,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { bankCountries } from "../data/bankCountries.js";

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phoneNumber: "",
  houseAddress: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  nextOfKinName: "",
  nextOfKinRelationship: "",
  nextOfKinPhone: "",
  monthlySalary: "",
  accountType: "checking",
  accountCategory: "personal",
  transactionPin: "",
};

const inputClassName =
  "w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0a2d4d] focus:ring-1 focus:ring-[#0a2d4d]";

const steps = [
  {
    key: "personal",
    label: "Personal",
    title: "Applicant details",

  },
  {
    key: "contact",
    label: "Contact",
    title: "Contact & residency",
  },
  {
    key: "Account",
    label: "Account",
    title: "Account selection",
  },
  {
    key: "security",
    label: "Security",
    title: "Login & security",
  },
];

function FormField({
  id,
  label,
  hint,
  type = "text",
  required,
  children,
  ...inputProps
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600"
      >
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children || (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          className={inputClassName}
          {...inputProps}
        />
      )}
      {hint && (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

function FormSection({ title, note, children }) {
  return (
    <fieldset className="min-w-0 space-y-4">
      <legend className="mb-3 w-full border-b border-slate-200 pb-1.5 text-xs font-bold uppercase tracking-wide text-[#0a2d4d] sm:text-sm">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
      {note && (
        <p className="border-l-2 border-slate-300 pl-3 text-[11px] leading-relaxed text-slate-500">
          {note}
        </p>
      )}
    </fieldset>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex min-w-0 justify-between gap-3 border-b border-slate-100 py-1.5 text-[11px] last:border-0">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-slate-800">
        {value || <span className="text-slate-300">—</span>}
      </dd>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const formRef = useRef(null);
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleContinue = () => {
    if (formRef.current?.reportValidity()) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({
        ...formData,
        monthlySalary: Number(formData.monthlySalary),
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

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
                Online Account application
              </div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-1.5 text-[11px] text-slate-600 md:flex">
              <Lock size={12} className="text-emerald-600" />
              Secure · TLS 1.3
            </div>
            <Link
              to="/login"
              className="border border-[#0a2d4d] px-2.5 py-1.5 text-[11px] font-semibold text-[#0a2d4d] transition hover:bg-[#0a2d4d] hover:text-white sm:px-3"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-3 py-3 sm:px-4 sm:py-4">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-[#0a2d4d] sm:text-lg">
                Personal Account Application
              </h1>
   
            </div>
            <div className="text-[11px] text-slate-500 sm:text-right">
 
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        {/* Main column */}
        <div className="min-w-0">
          {/* Stepper — horizontal scroll on mobile, segmented bar on sm+ */}
          <div className="mb-4 -mx-3 overflow-x-auto sm:mx-0 sm:overflow-visible">
            <ol className="flex w-max min-w-full items-stretch border border-slate-200 bg-white sm:w-full">
              {steps.map((s, index) => {
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep;
                return (
                  <li
                    key={s.key}
                    className={`flex-1 border-r border-slate-200 last:border-r-0 ${
                      isCurrent ? "bg-[#0a2d4d] text-white" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-bold ${
                          isComplete
                            ? "bg-emerald-100 text-emerald-700"
                            : isCurrent
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isComplete ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide ${
                          isCurrent
                            ? "text-white"
                            : isComplete
                              ? "text-slate-700"
                              : "text-slate-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Form card */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="min-w-0 border border-slate-200 bg-white"
          >
            <div className=" border-slate-200 px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">

                <ShieldCheck
                  size={28}
                  className="hidden shrink-0 text-slate-300 sm:block"
                />
              </div>
            </div>

            <div className="space-y-7 px-4 py-5 sm:px-6">
              {currentStep === 0 && (
                <FormSection title=" Personal information">
                  <FormField
                    id="firstName"
                    label="First name"
                    required
                    autoComplete="given-name"
                    maxLength={50}
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="As shown on ID"
                  />
                  <FormField
                    id="lastName"
                    label="Last name"
                    required
                    autoComplete="family-name"
                    maxLength={50}
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="As shown on ID"
                  />
                </FormSection>
              )}

              {currentStep === 1 && (
                <>
                  <FormSection
                    title=" Contact details"
                  >
                    <FormField
                      id="phoneNumber"
                      label="Phone number"
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={30}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+1 (555) 010-0100"
                    />
                    <div className="sm:col-span-2">
                      <FormField
                        id="houseAddress"
                        label="House address"
                        autoComplete="street-address"
                        required
                        maxLength={150}
                        value={formData.houseAddress}
                        onChange={handleChange}
                        placeholder="Street number and name, apt/unit"
                      />
                    </div>
                    <FormField
                      id="city"
                      label="City"
                      autoComplete="address-level2"
                      required
                      maxLength={80}
                      value={formData.city}
                      onChange={handleChange}
                    />
                    <FormField
                      id="state"
                      label="State / province / region"
                      autoComplete="address-level1"
                      required
                      maxLength={80}
                      value={formData.state}
                      onChange={handleChange}
                    />
                    <FormField
                      id="zipCode"
                      label="ZIP / postal code"
                      autoComplete="postal-code"
                      required
                      maxLength={20}
                      value={formData.zipCode}
                      onChange={handleChange}
                    />
                    <FormField id="country" label="Country" required>
                      <select
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        required
                        value={formData.country}
                        onChange={handleChange}
                        className={inputClassName}
                      >
                        <option value="">Select a country</option>
                        {bankCountries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </FormSection>

                  <FormSection
                    title=" Next of kin"
                    
                  >
                    <FormField
                      id="nextOfKinName"
                      label="Full name"
                      required
                      maxLength={100}
                      value={formData.nextOfKinName}
                      onChange={handleChange}
                    />
                    <FormField
                      id="nextOfKinRelationship"
                      label="Relationship"
                      required
                      maxLength={50}
                      value={formData.nextOfKinRelationship}
                      onChange={handleChange}
                      placeholder="For example, parent"
                    />
                    <FormField
                      id="nextOfKinPhone"
                      label="Phone number"
                      type="tel"
                      required
                      maxLength={30}
                      value={formData.nextOfKinPhone}
                      onChange={handleChange}
                      placeholder="+1 (555) 010-0100"
                    />
                  </FormSection>
                </>
              )}

              {currentStep === 2 && (
                <FormSection
                  title="1. Account setup"

                >
                  <FormField id="accountType" label="Account type" required>
                    <select
                      id="accountType"
                      name="accountType"
                      required
                      value={formData.accountType}
                      onChange={handleChange}
                      className={inputClassName}
                    >
                      <option value="checking">Everyday Checking</option>
                      <option value="savings">High-Yield Savings</option>
                    </select>
                  </FormField>
                  <FormField
                    id="accountCategory"
                    label="Account category"
                    required
                  >
                    <select
                      id="accountCategory"
                      name="accountCategory"
                      required
                      value={formData.accountCategory}
                      onChange={handleChange}
                      className={inputClassName}
                    >
                      <option value="personal">Personal</option>
                      <option value="student">Student</option>
                      <option value="business">Business</option>
                    </select>
                  </FormField>
                  <FormField
                    id="monthlySalary"
                    label="Monthly salary / income (USD)"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.monthlySalary}
                    onChange={handleChange}
                    placeholder="0.00"
  
                  />
                  <FormField
                    id="transactionPin"
                    label="4-digit transaction PIN"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    minLength={4}
                    required
                    value={formData.transactionPin}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setFormData((previous) => ({
                        ...previous,
                        transactionPin: value,
                      }));
                    }}
                    placeholder="••••"
                    title="Enter exactly 4 digits."
                    hint="Required to authorize transactions. Do not share this PIN."
                  />
                </FormSection>
              )}

              {currentStep === 3 && (
                <>
                  <FormSection
                    title=" Security"
                  >
                    <FormField
                      id="email"
                      label="Email address"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                    <FormField
                      id="password"
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      hint="Minimum 8 characters. Mix of letters, numbers, and symbols recommended."
                    />
                  </FormSection>

                  <div className="border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600">
                    <p className="font-semibold text-slate-800">
                      Security notice
                    </p>
                    <p className="mt-1">
                      PrimeStone Capital will never contact you asking for your
                      password or PIN. If you suspect fraud, contact us at{" "}
                      <span className="break-all font-mono text-slate-800">
                        1-800-555-0100
                      </span>
                      .
                    </p>
                  </div>
                </>
              )}

              {error && (
                <div
                  role="alert"
                  className="border-l-4 border-red-600 bg-red-50 px-3 py-2 text-xs text-red-800"
                >
                  {error}
                </div>
              )}
            </div>

            {/* Form footer / actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
              <div className="sm:flex-1">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="w-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:py-2"
                  >
                    Back
                  </button>
                )}
              </div>
              {!isLast ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex w-full items-center justify-center gap-1.5 bg-[#0a2d4d] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#081f36] sm:w-auto sm:py-2"
                >
                  Continue
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#0a2d4d] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#081f36] disabled:opacity-60 sm:w-auto sm:py-2"
                >
                  {submitting ? (
                    "Creating account…"
                  ) : (
                    <>Create account</>
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#0a2d4d] underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>


    </div>
  );
}

export default Register;
