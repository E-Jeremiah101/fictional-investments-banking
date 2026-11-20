import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
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

export default function LoanApplication() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await createLoanApplication({
        ...form,
        loanAmount: Number(form.loanAmount),
        durationMonths: Number(form.durationMonths),
      });
      setApplications((current) => [response.application, ...current]);
      setSuccess(response.message || "Your loan application was submitted.");
      setForm(emptyForm);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to submit your loan application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-blue-100";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/loans"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b3b8c] hover:underline"
          >
            <ArrowLeft size={15} />
            Back to Information
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            Loan Application Form
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Complete the form below to apply for your loan.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          <span className="text-rose-600">*</span> Required fields
        </p>
      </div>

  

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <fieldset disabled={submitting} className="space-y-8 p-5 sm:p-8">
          <section aria-labelledby="loan-details-title">
            <h2
              id="loan-details-title"
              className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900"
            >
              Loan Details
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-700">
                Loan Amount (USD) <Required />
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    $
                  </span>
                  <input
                    name="loanAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.loanAmount}
                    onChange={updateForm}
                    placeholder="0.00"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Duration <Required />
                <select
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
              </label>

              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Credit Facility <Required />
                <select
                  name="creditFacility"
                  required
                  value={form.creditFacility}
                  onChange={updateForm}
                  className={inputClass}
                >
                  <option value="">Select a loan/credit facility</option>
                  {loanFacilities.map((facility) => (
                    <option key={facility} value={facility}>
                      {facility}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Purpose of Loan <Required />
                <textarea
                  name="purpose"
                  required
                  maxLength={2000}
                  rows={4}
                  value={form.purpose}
                  onChange={updateForm}
                  placeholder="Tell us what you plan to use the loan for."
                  className={`${inputClass} resize-y`}
                />
              </label>
            </div>
          </section>

          <section aria-labelledby="financial-info-title">
            <h2
              id="financial-info-title"
              className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900"
            >
              Financial Information
            </h2>
            <label className="mt-5 block text-sm font-semibold text-slate-700">
              Monthly Net Income <Required />
              <select
                name="monthlyNetIncome"
                required
                value={form.monthlyNetIncome}
                onChange={updateForm}
                className={inputClass}
              >
                <option value="">Select an income range</option>
                {monthlyIncomeRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="space-y-3">
            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                name="acceptedTerms"
                required
                checked={form.acceptedTerms}
                onChange={updateForm}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0b3b8c] focus:ring-[#0b3b8c]"
              />
              <span>
                I agree to the terms and conditions. I confirm the information
                is accurate and consent to it being used to review this
                 application.
              </span>
            </label>

          </section>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/loans")}
            disabled={submitting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b3b8c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Loan Application"
            )}
          </button>
        </div>
      </form>

      <section aria-labelledby="my-loan-applications-title">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="my-loan-applications-title"
            className="text-lg font-bold text-slate-900"
          >
            My Loan Applications
          </h2>
          {loadingApplications && (
            <LoaderCircle
              size={17}
              className="animate-spin text-slate-500"
              aria-label="Loading applications"
            />
          )}
        </div>
        {!loadingApplications && applications.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
            You have no loan applications yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {application.creditFacility} ·{" "}
                    {formatMoney(application.loanAmount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {application.durationMonths} months · Submitted{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                  {application.reviewNote && (
                    <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-600">
                      Review note: {application.reviewNote}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                    statusStyles[application.status] || statusStyles.pending
                  }`}
                >
                  {application.status === "pending" && <Clock3 size={13} />}
                  {application.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Required() {
  return <span className="text-rose-600"> *</span>;
}
