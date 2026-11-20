import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  getPendingLoanApplications,
  reviewLoanApplication,
} from "../services/adminLoanService.js";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date unavailable";

export default function AdminLoans() {
  const [applications, setApplications] = useState([]);
  const [reviewNotes, setReviewNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPendingLoanApplications();
      setApplications(response.applications || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load pending loan applications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleReview = async (application, decision) => {
    setReviewingId(application.id);
    setError("");
    setNotice("");

    try {
      const response = await reviewLoanApplication(application.id, {
        decision,
        reviewNote: reviewNotes[application.id] || "",
      });
      setApplications((current) =>
        current.filter((item) => item.id !== application.id),
      );
      setNotice(response.message);
      setReviewNotes((current) => {
        const next = { ...current };
        delete next[application.id];
        return next;
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to review this loan application.",
      );
    } finally {
      setReviewingId("");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Loan applications
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Review customer-submitted loan applications.
          </p>
        </div>
        <button
          type="button"
          onClick={loadApplications}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <div
        role="note"
        className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
      >
        These are simulated applications. Approving an application records a
        review decision only; it does not perform a credit check or transfer
        funds.
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
      {notice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-14 text-sm text-slate-500">
          <RefreshCw size={16} className="animate-spin" />
          Loading applications…
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <FileText size={24} className="mx-auto text-slate-400" />
          <h2 className="mt-3 text-sm font-bold text-slate-900">
            No pending loan applications
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            New applications will appear here for review.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {applications.map((application) => {
            const isReviewing = reviewingId === application.id;
            const applicantName = [
              application.user?.firstName,
              application.user?.lastName,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li
                key={application.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {applicantName || "Customer unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {application.user?.email || "No email supplied"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                    <Clock3 size={13} />
                    Pending
                  </span>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Detail
                    label="Requested amount"
                    value={formatMoney(application.loanAmount)}
                  />
                  <Detail
                    label="Credit facility"
                    value={application.creditFacility}
                  />
                  <Detail
                    label="Duration"
                    value={`${application.durationMonths} months`}
                  />
                  <Detail
                    label="Monthly net income"
                    value={application.monthlyNetIncome}
                  />
                  <Detail
                    label="Submitted"
                    value={formatDate(application.createdAt)}
                  />
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Detail label="Purpose" value={application.purpose} />
                  </div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2 lg:col-span-3">
                    Review note (optional)
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={reviewNotes[application.id] || ""}
                      onChange={(event) =>
                        setReviewNotes((current) => ({
                          ...current,
                          [application.id]: event.target.value,
                        }))
                      }
                      disabled={isReviewing}
                      placeholder="Add a note for the applicant."
                      className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal normal-case text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                    />
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleReview(application, "reject")}
                    disabled={isReviewing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle size={15} />
                    {isReviewing ? "Processing…" : "Reject"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(application, "approve")}
                    disabled={isReviewing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b3b8c] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 size={15} />
                    {isReviewing ? "Processing…" : "Approve"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}
