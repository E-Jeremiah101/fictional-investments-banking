import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  X,
  Lock,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  getMyInvestments,
  requestTradingActivation,
} from "../services/investmentService.js";
import MarketDataWidget from "../components/MarketDataWidget.jsx";
import TickerTapeWidget from "../components/TickerTapeWidget.jsx";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

const initialPrices = Array.from(
  { length: 60 },
  (_, index) => 100 + Math.sin(index / 4) * 2 + Math.cos(index / 7) * 1.4,
);

export default function Investments() {
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [prices, setPrices] = useState(initialPrices);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [showActivationModal, setShowActivationModal] = useState(false);

  

  useEffect(() => {
    let active = true;
    getMyInvestments()
      .then((data) => {
        if (active) setInvestment(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your investment information.",
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPrices((current) => [
        ...current.slice(1),
        Math.max(
          90,
          current[current.length - 1] + (Math.random() - 0.48) * 1.2,
        ),
      ]);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  const chart = useMemo(() => {
    const minimum = Math.min(...prices) - 1;
    const maximum = Math.max(...prices) + 1;
    const points = prices
      .map((price, index) => {
        const x = (index / (prices.length - 1)) * 1000;
        const y = 260 - ((price - minimum) / (maximum - minimum)) * 220;
        return `${x},${y}`;
      })
      .join(" ");
    const currentPrice = prices[prices.length - 1];
    const change = currentPrice - prices[0];
    const changePct = (change / prices[0]) * 100;
    return { points, currentPrice, change, changePct };
  }, [prices]);

  const handleContinueToDeposit = async () => {
    setActivating(true);
    setError("");
    try {
      await requestTradingActivation();
      setShowActivationModal(false);
      navigate("/deposit?purpose=trading_activation&amount=300");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to start trading activation.",
      );
    } finally {
      setActivating(false);
    }
  };



  const tradingStatus ="inactive";
  const isPositive = chart.change >= 0;
  const isActive = tradingStatus === "active";
  const isAwaitingDeposit = tradingStatus === "awaiting_deposit";

  // Disable activation when there are no deposits
  const totalDepositValue = Number(investment?.totalDeposits) || 0;
  const hasNoDeposits = totalDepositValue <= 0;
  const activationDisabled = activating || loading || hasNoDeposits;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-end">
        <div className="flex items-center gap-2">
          <StatusPill status={tradingStatus } />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-[12px] leading-5 text-rose-800">{error}</p>
        </div>
      )}

      {/* Hero: portfolio + activation banner side-by-side */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Portfolio card (dark, like a real trading app) */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1a3a] via-[#122a5c] to-[#1e3a8a] p-6 text-white shadow-xl md:p-7">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-blue-500/10" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-semibold uppercase tracking-widest text-blue-300">
                Portfolio Returns
              </p>
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
              {formatMoney(investment?.earnings)}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300">
                  Total deposits
                </p>
                <p className="mt-1 text-[15px] font-semibold tabular-nums">
                  {formatMoney(investment?.totalDeposits)}
                </p>
              </div>
            </div>
          </div>
        </section>

             <section className="overflow-hidden rounded-2xl border-none bg-white shadow-sm">          <TickerTapeWidget />
             </section>

        {/* Activation card (top-right) — no $300 hint until clicked */}
        <section className="rounded-2xl border-none bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Zap size={16} />
              </div>
              <h2 className="text-[13px] font-bold text-slate-900">
                Trading access
              </h2>
            </div>
          </div>

          <div className="px-5 py-4">
            {isActive ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <ShieldCheck
                    size={13}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <p className="text-[11.5px] leading-5 text-emerald-900">
                    <span className="font-semibold">Trading is active.</span>{" "}
                     Your trading access is enabled.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-md bg-emerald-100 px-4 py-2.5 text-[12.5px] font-semibold text-emerald-800"
                >
                  Active
                </button>
              </div>
            ) : isAwaitingDeposit && investment?.activationDepositPending ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <AlertCircle
                    size={13}
                    className="mt-0.5 shrink-0 text-amber-700"
                  />
                  <p className="text-[11.5px] leading-5 text-amber-900">
                    <span className="font-semibold">Under review.</span> Your
                    activation deposit is awaiting review.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                  Awaiting approval
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[12px] leading-5 text-slate-600">
                  Start trading with a quick activation.
                </p>
                <button
                  type="button"
                  onClick={() => setShowActivationModal(true)}
                  disabled={activationDisabled}
                  title={
                    hasNoDeposits
                      ? "Make a deposit first to enable trading activation."
                      : undefined
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock size={14} />
                  Activate trading
                </button>
                
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Chart card */}
      <section className="overflow-hidden rounded-2xl border-none bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[14px] font-bold text-slate-900">BLU/USD</h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Live Chart
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Current price
              </p>
              <p className="mt-0.5 text-xl font-bold tabular-nums tracking-tight text-slate-900">
                {chart.currentPrice.toFixed(2)}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-semibold tabular-nums ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {isPositive ? "+" : ""}
              {chart.change.toFixed(2)} ({chart.changePct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="relative h-[260px] w-full bg-gradient-to-b from-slate-50/80 to-white">
          <svg
            viewBox="0 0 1000 260"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity="0.18"
                />
                <stop
                  offset="100%"
                  stopColor={isPositive ? "#10b981" : "#f43f5e"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                x2="1000"
                y1={40 + i * 45}
                y2={40 + i * 45}
                stroke="#e2e8f0"
                strokeDasharray="3 4"
                strokeWidth="1"
              />
            ))}

            <polygon
              points={`0,260 ${chart.points} 1000,260`}
              fill="url(#chartFill)"
            />

            <polyline
              points={chart.points}
              fill="none"
              stroke={isPositive ? "#10b981" : "#f43f5e"}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          <div className="pointer-events-none absolute inset-y-0 right-2 flex flex-col justify-between py-4 text-[10px] font-medium tabular-nums text-slate-400">
            <span>{Math.max(...prices).toFixed(2)}</span>
            <span>
              {((Math.max(...prices) + Math.min(...prices)) / 2).toFixed(2)}
            </span>
            <span>{Math.min(...prices).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <MarketDataWidget />
        </div>
      </section>

      {/* Activation modal — the $300 is ONLY revealed here */}
      {showActivationModal && (
        <ActivationModal
          onClose={() => !activating && setShowActivationModal(false)}
          onContinue={handleContinueToDeposit}
          activating={activating}
          error={error}
        />
      )}

    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    inactive: {
      label: "Not active",
      className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
      dot: "bg-slate-400",
    },
    awaiting_deposit: {
      label: "Awaiting review",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      dot: "bg-amber-500",
    },
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dot: "bg-emerald-500",
    },
  };
  const config = map[status] || map.inactive;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function ActivationModal({ onClose, onContinue, activating, error }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activation-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Lock size={18} />
            </div>
            <div>
              <h2
                id="activation-title"
                className="text-[15px] font-bold text-slate-900"
              >
                Activate trading
              </h2>
              <p className="mt-0.5 text-[11.5px] text-slate-500">
                A one-time activation step to start trading.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={activating}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-800"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
              Activation fee
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
              $300.00
            </p>
          </div>

          <ul className="space-y-2.5">
            <Feature>Submit a $300 deposit to activate trading.</Feature>
            <Feature>
              Once paid, the full $300 is credited to your total balance.
            </Feature>
            <Feature>
              Your trading manager reviews the deposit before trading
              activates.
            </Feature>
          </ul>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={activating}
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[12.5px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onContinue}
            disabled={activating}
            className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue to deposit
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({ children }) {
  return (
    <li className="flex items-start gap-2 text-[12px] text-slate-600">
      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="leading-5">{children}</span>
    </li>
  );
}