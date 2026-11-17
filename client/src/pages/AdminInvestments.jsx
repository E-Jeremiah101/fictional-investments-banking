import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, TrendingUp, Wallet } from "lucide-react";
import {
  adjustInvestorEarnings,
  getAdminInvestors,
} from "../services/investmentService.js";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

export default function AdminInvestments() {
  const [investors, setInvestors] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [direction, setDirection] = useState("increase");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInvestors = useCallback(async () => {
    try {
      const users = await getAdminInvestors();
      setInvestors(users);
      setSelectedId((current) =>
        users.some((user) => user.id === current)
          ? current
          : users[0]?.id || "",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load active investors.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getAdminInvestors()
      .then((users) => {
        if (!active) return;
        setInvestors(users);
        setSelectedId(users[0]?.id || "");
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load active investors.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedInvestor = investors.find((user) => user.id === selectedId);

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    loadInvestors();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedInvestor) return;
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await adjustInvestorEarnings(selectedId, {
        direction,
        amount: Number(amount),
        reason: reason.trim(),
      });
      setNotice(response.message);
      setAmount("");
      setReason("");
      await loadInvestors();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to adjust this investor's earnings.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Investment management
          </h1>
 
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>


      {error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-bold text-slate-900">Active investors</h2>
            <p className="mt-1 text-sm text-slate-500">
              {investors.length} active trading account
              {investors.length === 1 ? "" : "s"}
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center p-10 text-slate-500">
              <LoaderCircle className="animate-spin" />
            </div>
          ) : investors.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No active trading accounts yet. Approving a customer's activation
              deposit adds them here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {investors.map((investor) => (
                <button
                  type="button"
                  key={investor.id}
                  onClick={() => setSelectedId(investor.id)}
                  className={`flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50 ${
                    selectedId === investor.id ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {investor.firstName} {investor.lastName}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {investor.email} · {investor.accountNumber}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-xs text-slate-500">
                      Earnings
                    </span>
                    <span className="font-semibold tabular-nums text-emerald-700">
                      {formatMoney(investor.earnings)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-slate-900">Adjust earnings</h2>
          {selectedInvestor ? (
            <>
              <p className="mt-1 text-sm text-slate-500">
                {selectedInvestor.firstName} {selectedInvestor.lastName}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs text-emerald-800">
                    <TrendingUp size={14} /> Earnings
                  </p>
                  <p className="mt-2 font-bold tabular-nums text-emerald-900">
                    {formatMoney(selectedInvestor.earnings)}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="flex items-center gap-1.5 text-xs text-blue-800">
                    <Wallet size={14} /> Balance
                  </p>
                  <p className="mt-2 font-bold tabular-nums text-blue-900">
                    {formatMoney(selectedInvestor.balance)}
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Adjustment
                  <select
                    value={direction}
                    onChange={(event) => setDirection(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                  >
                    <option value="increase">Increase earnings</option>
                    <option value="decrease">Decrease earnings</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Amount (USD)
                  <input
                    type="number"
                    min="0.01"
                    max="1000000"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                    placeholder="0.00"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Reason
                  <input
                    type="text"
                    maxLength={200}
                    required
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"
                    placeholder="Adjustment note"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save earnings adjustment"}
                </button>
              </form>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              {loading ? "Loading investors…" : "Select an active investor."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
