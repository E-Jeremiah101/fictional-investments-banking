import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
  ChevronDown,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  createATMCardRequest,
  getMyATMCardRequests,
} from "../services/atmCardService";



function VisaLogo({ className = "h-4" }) {
  return (
    <svg
      viewBox="0 0 780 250"
      className={className}
      role="img"
      aria-label="Visa"
    >
      <path
        fill="#1434CB"
        d="M293.2 15.2 199 232.2h-58.7L94 61.8c-2.6-10.4-4.9-14.2-12.9-18.6C68.6 36.2 46.3 29.4 26.6 25l1.3-6.3h92.6c11.8 0 22.4 7.9 25.1 21.5l24.4 129.8 60.5-151.3h62.7Zm248.6 147.9c.3-57.4-79.4-60.6-78.8-86.2.2-7.8 7.6-16.1 23.8-18.3 8-.9 30.1-1.6 55.2 9.7l9.8-45.9c-13.5-4.9-30.8-9.6-52.4-9.6-55.4 0-94.4 29.4-94.8 71.6-.4 31.2 27.8 48.6 49.1 59 21.9 10.6 29.2 17.4 29.2 26.9-.2 14.5-17.5 20.9-33.7 21.2-28.3.4-44.7-7.7-57.7-13.7l-10.1 47.4c13 6 37 11.2 61.9 11.5 58.8 0 97.2-29 97.5-74Zm146.1 69.1h55.4L697 15.2h-51.1c-11.5 0-21.2 6.7-25.5 17L538 232.2h58.7l11.7-32.4h71.7l6.7 32.4Zm-62.2-76.8 29.4-81.1 16.9 81.1h-46.3ZM436 15.2l-46.1 217h-56L380 15.2h56Z"
      />
    </svg>
  );
}

function MastercardLogo({ className = "h-4" }) {
  return (
    <svg
      viewBox="0 0 152 100"
      className={className}
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="52" cy="50" r="38" fill="#EB001B" />
      <circle cx="100" cy="50" r="38" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M76 17.7a38 38 0 0 1 0 64.6 38 38 0 0 1 0-64.6Z"
      />
    </svg>
  );
}

function AmexLogo({ className = "h-4" }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="American Express"
    >
      <rect width="200" height="200" rx="6" fill="#2E77BC" />
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="34"
        fontWeight="900"
        letterSpacing="-1"
        fill="#FFFFFF"
      >
        AMEX
      </text>
      <path
        fill="#FFFFFF"
        d="M40 56h120v8H40zM40 136h120v8H40z"
        opacity="0.4"
      />
    </svg>
  );
}

/* ============================================================
   Config
   ============================================================ */

const brands = [
  {
    id: "visa",
    name: "Visa",
    tagline: "Accepted worldwide, suitable for most online purchases",
    Logo: VisaLogo,
  },
  {
    id: "mastercard",
    name: "Mastercard",
    tagline: "Global acceptance with enhanced security features",
    Logo: MastercardLogo,
  },
  {
    id: "amex",
    name: "American Express",
    tagline: "Premium benefits and exclusive rewards program",
    Logo: AmexLogo,
  },
];

const levels = [
  {
    id: "standard",
    name: "Standard",
    fee: 5,
    dailyLimit: 1000,
    accent: "from-slate-700 to-slate-900",
  },
  {
    id: "gold",
    name: "Gold",
    fee: 15,
    dailyLimit: 3000,
    accent: "from-amber-500 to-amber-700",
  },
  {
    id: "platinum",
    name: "Platinum",
    fee: 25,
    dailyLimit: 6000,
    accent: "from-slate-400 to-slate-600",
  },
  {
    id: "black",
    name: "Black",
    fee: 50,
    dailyLimit: 10000,
    accent: "from-zinc-800 to-black",
  },
];

const faqs = [
  {
    q: "Will I receive a real Virtual Card?",
    a: "No. After approval, the app displays a fictional, non-functional card number and expiry for educational use. No physical or usable card is issued.",
  },
  {
    q: "Can I use this card for purchases or cash withdrawals?",
    a: "No. The card preview and application process are simulated and cannot be used for real purchases or withdrawals.",
  },
  {
    q: "What are the differences between card levels?",
    a: "The four simulated levels have different fictional fees and starting daily limits. You can adjust the limit within the range shown on the application.",
  },
  {
    q: "Will a real fee be charged?",
    a: "No. The displayed fees and any receipt submitted for review are fictional demonstration data only.",
  },
];

const formatMoney = (n, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);

/* ============================================================
   Live card preview
   ============================================================ */

function CardPreview({
  brand,
  level,
  cardholderName,
  demoCardNumber,
  demoCardExpiry,
}) {
  const levelObj = levels.find((l) => l.id === level);
  const brandObj = brands.find((b) => b.id === brand);
  const Logo = brandObj?.Logo;

  const displayName = (cardholderName || "CARDHOLDER NAME").toUpperCase();

  return (
    <div className="mx-auto w-full max-w-sm">
      <div
        className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${levelObj?.accent} p-5 text-white shadow-2xl shadow-black/20`}
      >
        {/* subtle pattern */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[24px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-white/5" />

        <div className="relative flex h-full flex-col justify-between">
          {/* top row */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                PrimeStone Capital
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-white/90">
                {levelObj?.name} Virtual Card
              </p>
            </div>
            <div className="rounded bg-white/15 px-2 py-1 backdrop-blur-sm">
              {Logo ? <Logo className="h-4" /> : null}
            </div>
          </div>

          {/* chip + numbers */}
          <div>
            <div className="mb-3 h-7 w-10 rounded bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-inner">
              <div className="grid h-full grid-cols-3 gap-0.5 p-1 opacity-40">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-sm bg-black/40" />
                ))}
              </div>
            </div>
            <p className="font-mono text-[15px] tracking-[0.15em] text-white/95">
              {demoCardNumber
                ? demoCardNumber.match(/.{1,4}/g)?.join(" ")
                : "•••• •••• •••• ••••"}
            </p>
          </div>

          {/* bottom row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-white/60">
                Cardholder
              </p>
              <p className="truncate text-[12px] font-semibold tracking-wide">
                {displayName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-white/60">
                Expires
              </p>
              <p className="text-[12px] font-semibold tracking-wide">
                {demoCardExpiry || "--/--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Small helpers
   ============================================================ */

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-[13px] font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[12px] leading-5 text-gray-500">
            {description}
          </p>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Field({ id, label, hint, children }) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-gray-500"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-[11px] leading-4 text-gray-500">{hint}</p>
      )}
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */

export default function ATMCardApplication() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const withdrawalId = searchParams.get("withdrawalId");

  const [brand, setBrand] = useState("visa");
  const [level, setLevel] = useState("standard");
  const [currency, setCurrency] = useState("USD");
  const [dailyLimit, setDailyLimit] = useState(1000);
  const [cardholderName, setCardholderName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  const selectedLevel = levels.find((l) => l.id === level);
  const activeRequest = requests.find((request) =>
    ["awaiting_payment", "awaiting_admin_approval"].includes(request.status),
  );

  useEffect(() => {
    let cancelled = false;

    const loadRequests = async () => {
      try {
        const response = await getMyATMCardRequests();
        if (!cancelled) {
          setRequests(response.atmCardRequests || []);
        }
      } catch (err) {
        if (!cancelled) {
          setRequestsError(
            err.response?.data?.message ||
              "Unable to load your Virtual Card applications.",
          );
        }
      } finally {
        if (!cancelled) {
          setRequestsLoading(false);
        }
      }
    };

    loadRequests();
    const refreshInterval = window.setInterval(loadRequests, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    if (requestsLoading) return;
    const readyRequest = requests.find(
      (request) =>
        request.withdrawalStatus === "awaiting_tax_pin" &&
        (!withdrawalId || String(request.withdrawalId) === withdrawalId),
    );

    if (readyRequest?.withdrawalId) {
      navigate(
        `/tax-pin?withdrawalId=${encodeURIComponent(readyRequest.withdrawalId)}`,
        { replace: true },
      );
    }
  }, [navigate, requests, requestsLoading, withdrawalId]);

  const handleSubmit = async () => {
    setError("");
    if (!cardholderName.trim()) {
      setError("Cardholder name is required.");
      return;
    }
    if (!billingAddress.trim()) {
      setError("Billing address is required.");
      return;
    }
    if (
      !Number.isInteger(dailyLimit) ||
      dailyLimit < 1000 ||
      dailyLimit > 10000 ||
      dailyLimit % 100 !== 0
    ) {
      setError("Choose a daily limit from 1,000 to 10,000 in steps of 100.");
      return;
    }
    if (!agreed) {
      setError("Please accept the terms and conditions to continue.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await createATMCardRequest({
        brand,
        level,
        currency,
        dailyLimit,
        cardholderName: cardholderName.trim(),
        billingAddress: billingAddress.trim(),
        acceptedTerms: agreed,
        ...(withdrawalId ? { withdrawalId } : {}),
      });
      const requestId =
        response.atmCardRequest?.id || response.atmCardRequest?._id;

      if (!requestId) {
        throw new Error(
          "Your Virtual Card application was received without a request reference.",
        );
      }

      navigate(
        `/cards/payment/${encodeURIComponent(requestId)}${
          withdrawalId
            ? `?withdrawalId=${encodeURIComponent(withdrawalId)}`
            : ""
        }`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit your simulated Virtual Card application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#0b3b8c] to-[#092f70] p-6 text-white sm:p-8">
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Apply for a Virtual Card
            </h1>
          </div>

        </div>
      </div>

      {requestsError && (
        <div
          role="alert"
          className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12px] text-rose-800"
        >
          {requestsError}
        </div>
      )}

      <Section title="Your Card">
        {requestsLoading ? (
          <p className="text-[12px] text-gray-500">Loading applications…</p>
        ) : requests.length === 0 ? (
          <p className="text-[12px] text-gray-500">
            You have no Virtual Card applications yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => {
              const requestId = request.id || request._id;
              const needsPayment =
                request.status === "awaiting_payment" &&
                request.paymentStatus === "not_submitted";
              const readyForTaxPinPayment =
                request.withdrawalStatus === "ready_for_withdrawal" &&
                request.withdrawalId;

              return (
                <div
                  key={requestId}
                  className="space-y-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
   
  
                    {needsPayment && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/cards/payment/${encodeURIComponent(requestId)}${
                              request.withdrawalId
                                ? `?withdrawalId=${encodeURIComponent(request.withdrawalId)}`
                                : ""
                            }`,
                          )
                        }
                        className="rounded-md bg-[#0b3b8c] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#092f70]"
                      >
                        Continue to payment
                      </button>
                    )}
     
                    {request.status === "rejected" && (
                      <span className="text-[11px] font-semibold text-rose-700">
                        Application rejected
                      </span>
                    )}
                  </div>
                  {request.status === "approved" && request.demoCardNumber && (
                    <div className="grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-[minmax(0,380px)_1fr]">
                      <CardPreview
                        brand={request.brand}
                        level={request.level}
                        cardholderName={request.cardholderName}
                        demoCardNumber={request.demoCardNumber}
                        demoCardExpiry={request.demoCardExpiry}
                      />
                      <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="text-[12px] font-bold text-gray-900">
                          Card details
                        </h3>
                        <dl className="mt-2 divide-y divide-gray-100">
                          <Row
                            label="Card number"
                            value={request.demoCardNumber
                              .match(/.{1,4}/g)
                              ?.join(" ")}
                          />
                          <Row label="Expiry" value={request.demoCardExpiry} />
                          <Row label="CCV" value={request.demoCardCcv} />
                          <Row
                            label="Network"
                            value={
                              brands.find((b) => b.id === request.brand)?.name
                            }
                          />
                          <Row
                            label="Cardholder"
                            value={request.cardholderName}
                          />
                          <Row label="Currency" value={request.currency} />
                          <Row
                            label="Daily limit"
                            value={formatMoney(
                              request.dailyLimit,
                              request.currency,
                            )}
                          />
                        </dl>
  
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5">
          <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
          <p className="text-[12px] leading-5 text-rose-800">{error}</p>
        </div>
      )}

      {/* Preview + configuration */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Right: form */}
        <div className="space-y-6">
          {/* Brand picker */}
          <Section
            title="Choose Details"
            description="Card Types"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {brands.map((b) => {
                const isSelected = brand === b.id;
                const Logo = b.Logo;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBrand(b.id)}
                    className={`relative flex flex-col rounded-lg border bg-white p-4 text-left transition ${
                      isSelected
                        ? "border-[#0b3b8c] ring-1 ring-[#0b3b8c]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex h-10 items-center justify-between">
                      <div className="flex  items-center justify-between">
                        <span
                          className={`h-4 w-4 m-0 p-0 rounded-full border ${
                            isSelected
                              ? "border-[#0b3b8c] bg-[#0b3b8c] ring-2 ring-white ring-offset-1"
                              : "border-gray-300"
                          }`}
                        />
                        <span className="p-2 text-[12.5px] font-bold text-gray-900">
                          {b.name}
                        </span>
                      </div>

                      <div className="flex h-8 items-center">
                        <Logo className="h-5" />
                      </div>
                    </div>

                    <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
                      {b.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section
            title="Choose card level"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {levels.map((cardLevel) => {
                const isSelected = level === cardLevel.id;
                return (
                  <button
                    key={cardLevel.id}
                    type="button"
                    onClick={() => {
                      setLevel(cardLevel.id);
                      setDailyLimit(cardLevel.dailyLimit);
                    }}
                    aria-pressed={isSelected}
                    className={`rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? "border-[#0b3b8c] bg-[#f3f6fc] ring-1 ring-[#0b3b8c]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] font-bold text-gray-900">
                        {cardLevel.name}
                      </span>
                      <span className="text-[12px] font-bold text-[#0b3b8c]">
                        {formatMoney(cardLevel.fee)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Starting daily limit:{" "}
                      {formatMoney(cardLevel.dailyLimit, currency)}
                    </p>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Limits & currency */}
          <Section title="Limits & currency">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="dailyLimit"
                label="Daily spending limit"

              >
                <div className="flex items-stretch gap-2">
                  <input
                    id="dailyLimit"
                    type="number"
                    min={1000}
                    max={10000}
                    step={100}
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value) || 0)}
                    readOnly
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[13px] tabular-nums text-gray-900 outline-none focus:border-[#0b3b8c] focus:ring-1 focus:ring-[#0b3b8c]"
                  />
                  <div className="flex items-center rounded-md border border-gray-300 bg-gray-50 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    {currency}
                  </div>
                </div>
              </Field>
              <Field id="currency" label="Currency">
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[13px] text-gray-900 outline-none focus:border-[#0b3b8c] focus:ring-1 focus:ring-[#0b3b8c]"
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Billing */}
          <Section
            title="Billing information"
            
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="cardholderName"
                label="Cardholder name *"
              >
                <input
                  id="cardholderName"
                  type="text"
                  maxLength={100}
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Name on card"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-[#0b3b8c] focus:ring-1 focus:ring-[#0b3b8c]"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  id="billingAddress"
                  label="Billing address *"
                >
                  <textarea
                    id="billingAddress"
                    rows={3}
                    maxLength={300}
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="Street, city, state, ZIP, country"
                    className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-[#0b3b8c] focus:ring-1 focus:ring-[#0b3b8c]"
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>
        {/* Left: sticky preview */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <CardPreview
            brand={brand}
            level={level}
            cardholderName={cardholderName}
          />
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500">
              Summary
            </p>
            <dl className="mt-2 divide-y divide-gray-100">
              <Row
                label="Network"
                value={brands.find((b) => b.id === brand)?.name}
              />
              <Row label="Level" value={selectedLevel?.name} />
              <Row label="Currency" value={currency} />
              <Row
                label="Daily limit"
                value={formatMoney(dailyLimit, currency)}
              />
              <Row
                label="Issuance fee"
                value={formatMoney(selectedLevel?.fee || 0)}
                highlight
              />
            </dl>
          </div>
        </aside>
      </div>

      {/* Fee breakdown */}
      <Section title="Card issuance fees">
        <div className="divide-y divide-gray-100">
          {levels.map((l) => (
            <div
              key={l.id}
              className={`flex items-center justify-between rounded-md px-3 py-2 ${
                level === l.id ? "bg-[#f3f6fc]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-6 w-10 rounded bg-gradient-to-r ${l.accent}`}
                />
                <span className="text-[12.5px] font-semibold text-gray-800">
                  {l.name}
                </span>
                {level === l.id && (
                  <span className="rounded-full bg-[#0b3b8c] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Selected
                  </span>
                )}
              </div>
              <span className="text-[12.5px] font-bold tabular-nums text-gray-900">
                {formatMoney(l.fee)}
              </span>
            </div>
          ))}
        </div>


        {/* Terms */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <label className="flex items-start gap-2.5 text-[12px] leading-5 text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-[#0b3b8c]"
            />
            <span>
              I confirm the information is fictional and understand this is a
              simulated banking environment. No card or real payment will be
              issued.
            </span>
          </label>
        </div>
      </Section>

      {/* FAQ */}
      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-[13px] font-bold text-gray-900">
            Frequently asked questions
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-5 py-3">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-[12.5px] font-semibold text-gray-800">
                {faq.q}
                <ChevronDown
                  size={14}
                  className="shrink-0 text-gray-400 transition group-open:rotate-180"
                />
              </summary>
              <p className="mt-2 text-[12px] leading-5 text-gray-500">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Action bar */}
      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-gray-500">
          Selected:{" "}
          <span className="font-semibold text-gray-900">
            {selectedLevel?.name} {brands.find((b) => b.id === brand)?.name}{" "}
            card
          </span>
          {" · "}
          <span className="font-semibold tabular-nums text-gray-900">
            {formatMoney(selectedLevel?.fee || 0)}
          </span>
        </p>
        {activeRequest && (
          <p className="text-[11px] leading-4 text-amber-700 sm:ml-auto sm:mr-3">
            Finish your current application before starting another.
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || requestsLoading || Boolean(activeRequest)}
            className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle size={14} className="animate-spin" />
                Processing…
              </>
            ) : (
              <>
                {activeRequest
                  ? "Application in progress"
                  : "Apply for Virtual Card"}
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 text-[11.5px]">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={`text-right font-semibold ${
          highlight ? "text-[#0b3b8c]" : "text-gray-900"
        }`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}