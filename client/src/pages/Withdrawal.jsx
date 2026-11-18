import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Wallet,
  AlertCircle,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Info,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { createWithdrawalRequest } from "../services/withdrawalService";
import { getMyAccount, getMyTransactions } from "../services/accountService";
import { bankCountries, ibanCountryCodes } from "../data/bankCountries";
import {
  otherBankOption,
  popularBanksByCountry,
} from "../data/popularBanks";

const cryptoOptions = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "USDC", label: "USD Coin (USDC)" },
  { value: "SOL", label: "Solana (SOL)" },
];

const networkOptions = {
  BTC: ["Bitcoin"],
  ETH: ["Ethereum (ERC20)"],
  USDT: ["TRC20", "ERC20", "BEP20"],
  USDC: ["ERC20", "SOL"],
  SOL: ["Solana"],
};

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const isValidUsRoutingNumber = (routingNumber) =>
  /^\d{9}$/.test(routingNumber) &&
  [...routingNumber].reduce(
    (sum, digit, index) => sum + Number(digit) * [3, 7, 1][index % 3],
    0,
  ) %
    10 ===
    0;

export default function Withdrawal() {
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(true);

  const [method, setMethod] = useState("bank_transfer");
  const [amount, setAmount] = useState("");

  const [bankName, setBankName] = useState("");
  const [bankChoice, setBankChoice] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [recipientCountry, setRecipientCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [bankSwiftBic, setBankSwiftBic] = useState("");

  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRC20");
  const [walletAddress, setWalletAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedWithdrawalId, setSubmittedWithdrawalId] = useState("");

  const currency = account?.currency || "USD";

  const balance = useMemo(() => {
    if (!account) return 0;
    if (typeof account.balanceCents === "number")
      return account.balanceCents / 100;
    return Number(account.balance) || 0;
  }, [account]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const a = await getMyAccount();
        if (!cancelled) setAccount(a || null);
      } catch {
        /* silent */
      }
      try {
        const t = await getMyTransactions();
        if (!cancelled) setTransactions(Array.isArray(t) ? t : []);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAssetChange = (value) => {
    setAsset(value);
    setNetwork(networkOptions[value][0]);
  };

  const handleCountrySearch = (value) => {
    setCountrySearch(value);
    const selectedCountry = bankCountries.find(
      ({ code, name }) =>
        name.toLowerCase() === value.trim().toLowerCase() ||
        code.toLowerCase() === value.trim().toLowerCase(),
    );
    const nextCountry = selectedCountry?.code || "";

    if (nextCountry !== recipientCountry) {
      setRecipientCountry(nextCountry);
      setBankChoice("");
      setBankName("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return setError("Please enter a valid withdrawal amount.");
    }

    if (numericAmount > balance) {
      return setError(
        `Insufficient balance. Your available balance is ${formatMoney(balance, currency)}.`,
      );
    }

    if (method === "bank_transfer") {
      const selectedBankName =
        bankChoice === otherBankOption ? bankName.trim() : bankChoice;

      if (!selectedBankName || !bankAccountName.trim() || !recipientCountry) {
        return setError("Please complete your bank details.");
      }
      if (recipientCountry === "US") {
        if (!/^\d{4,17}$/.test(bankAccountNumber.trim())) {
          return setError("Enter a valid US bank account number.");
        }
        if (!isValidUsRoutingNumber(bankRoutingNumber.trim())) {
          return setError("Enter a valid 9-digit US routing number.");
        }
      } else if (ibanCountryCodes.has(recipientCountry)) {
        if (
          !bankIban.trim() ||
          !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(
            bankSwiftBic.trim().toUpperCase(),
          )
        ) {
          return setError("Enter the recipient IBAN and SWIFT/BIC.");
        }
      } else if (
        !/^[A-Za-z0-9][A-Za-z0-9 .-]{2,33}$/.test(bankAccountNumber.trim()) ||
        !/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(
          bankSwiftBic.trim().toUpperCase(),
        )
      ) {
        return setError("Enter the recipient account number and SWIFT/BIC.");
      }
    }

    if (method === "crypto") {
      if (!asset || !network || !walletAddress.trim()) {
        return setError(
          "Please complete your cryptocurrency withdrawal details.",
        );
      }
    }

    try {
      setSubmitting(true);
      const payload = { amount: numericAmount, method };
      if (method === "bank_transfer") {
        payload.bankName =
          bankChoice === otherBankOption ? bankName.trim() : bankChoice;
        payload.bankAccountName = bankAccountName.trim();
        payload.recipientCountry = recipientCountry;
        payload.bankAccountNumber =
          recipientCountry === "US" || !ibanCountryCodes.has(recipientCountry)
            ? bankAccountNumber.trim()
            : "";
        payload.bankRoutingNumber =
          recipientCountry === "US" ? bankRoutingNumber.trim() : "";
        payload.bankIban = ibanCountryCodes.has(recipientCountry)
          ? bankIban.replace(/\s/g, "").toUpperCase()
          : "";
        payload.bankSwiftBic =
          recipientCountry !== "US" ? bankSwiftBic.trim().toUpperCase() : "";
      }
      if (method === "crypto") {
        payload.asset = asset;
        payload.network = network;
        payload.walletAddress = walletAddress.trim();
      }

      const response = await createWithdrawalRequest(payload);
      const withdrawal = response.withdrawal;
      const withdrawalId = withdrawal?._id || withdrawal?.id;
      if (!withdrawalId) {
        throw new Error(
          "The withdrawal request was created, but its reference was not returned.",
        );
      }
      setSubmittedWithdrawalId(withdrawalId);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit your withdrawal request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15";

  return (
    <div className="space-y-6">
      {submittedWithdrawalId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
        >
          <section
            aria-labelledby="virtual-card-required-title"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
            role="dialog"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-[#0b3b8c]">
              <ShieldCheck size={22} />
            </div>
            <h2
              id="virtual-card-required-title"
              className="mt-4 text-[18px] font-bold text-gray-900"
            >
              Virtual Card application required
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-gray-600">
              Your withdrawal request has been created. To continue, please
              submit a Virtual Card application. Once applied,
              you&apos;ll proceed.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/my-requests")}
                className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Continue later
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/cards?withdrawalId=${encodeURIComponent(submittedWithdrawalId)}`,
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70]"
              >
                Apply for Virtual Card
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Form */}
        <div className="rounded-md border-none bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-[14px] font-bold text-gray-900">
              Withdrawal request
            </h2>
            <p className="mt-0.5 text-[12px] text-gray-500">
              All fields are required.
            </p>
          </div>

          <div className="px-6 py-5">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] text-red-800"
              >
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-red-600"
                />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                >
                  Amount to withdraw
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-gray-500">
                    $
                  </span>
                  <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-7 pr-14 text-[16px] font-semibold tabular-nums text-gray-900 outline-none transition placeholder:font-normal placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15"
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    USD
                  </span>
                </div>
                <p className="mt-1.5 flex items-center justify-between text-[11.5px] text-gray-500">
                  <span>From your available balance</span>
                  <span className="font-medium tabular-nums text-gray-700">
                    {formatMoney(balance, currency)}
                  </span>
                </p>
              </div>

              {/* Method */}
              <div>
                <p className="mb-1.5 text-[12px] font-semibold text-gray-700">
                  Destination
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      key: "bank_transfer",
                      icon: Building2,
                      title: "Bank account",
                      desc: "International bank transfer",
                    },
                    {
                      key: "crypto",
                      icon: Wallet,
                      title: "Crypto wallet",
                      desc: "BTC, ETH, USDT & more",
                    },
                  ].map(({ key, icon: Icon, title, desc }) => {
                    const active = method === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMethod(key)}
                        className={`flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition ${
                          active
                            ? "border-[#0b3b8c] bg-[#0b3b8c]/5"
                            : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded ${
                            active
                              ? "bg-[#0b3b8c] text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-[13px] ${
                              active
                                ? "font-semibold text-[#0b3b8c]"
                                : "font-medium text-gray-900"
                            }`}
                          >
                            {title}
                          </p>
                          <p className="text-[11px] text-gray-500">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bank */}
              {method === "bank_transfer" && (
                <div className="space-y-4 border-t border-gray-200 pt-5">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                    International bank details
                  </p>

                  <div>
                    <label
                      htmlFor="recipientCountry"
                      className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                    >
                      Search destination country
                    </label>
                    <input
                      id="recipientCountry"
                      type="search"
                      list="withdrawal-country-options"
                      value={countrySearch}
                      onChange={(e) => handleCountrySearch(e.target.value)}
                      placeholder="Type a country name"
                      autoComplete="off"
                      className={inputClass}
                      required
                    />
                    <datalist id="withdrawal-country-options">
                      {bankCountries.map(({ code, name }) => (
                        <option key={code} value={name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label
                      htmlFor="bankName"
                      className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                    >
                      Bank name
                    </label>
                    <div className="relative">
                      <select
                        id="bankName"
                        value={bankChoice}
                        onChange={(e) => {
                          setBankChoice(e.target.value);
                          if (e.target.value !== otherBankOption) {
                            setBankName("");
                          }
                        }}
                        className={`${inputClass} appearance-none pr-9`}
                        required
                      >
                        <option value="">
                          {recipientCountry
                            ? "Select a bank"
                            : "Select a country first"}
                        </option>
                        {(popularBanksByCountry[recipientCountry] || []).map(
                          (bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ),
                        )}
                        <option value={otherBankOption}>
                          Other / my bank is not listed
                        </option>
                      </select>
                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                    {bankChoice === otherBankOption && (
                      <input
                        id="customBankName"
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Enter your bank name"
                        autoComplete="organization"
                        className={`${inputClass} mt-2`}
                        required
                      />
                    )}
                    {recipientCountry &&
                      !popularBanksByCountry[recipientCountry] && (
                        <p className="mt-1.5 text-[11px] text-gray-500">
                          No popular banks are listed for this country yet.
                          Choose “Other” to enter the bank name.
                        </p>
                      )}
                  </div>

                  <div>
                    <label
                      htmlFor="bankAccountName"
                      className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                    >
                      Account holder name
                    </label>
                    <input
                      id="bankAccountName"
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>

                  {recipientCountry === "US" && (
                    <>
                      <div>
                        <label
                          htmlFor="bankAccountNumber"
                          className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                        >
                          Account number
                        </label>
                        <input
                          id="bankAccountNumber"
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={bankAccountNumber}
                          onChange={(e) =>
                            setBankAccountNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 17),
                            )
                          }
                          className={`${inputClass} tabular-nums tracking-wide`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="bankRoutingNumber"
                          className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                        >
                          ABA routing number
                        </label>
                        <input
                          id="bankRoutingNumber"
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          value={bankRoutingNumber}
                          onChange={(e) =>
                            setBankRoutingNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 9),
                            )
                          }
                          className={`${inputClass} tabular-nums tracking-wide`}
                          required
                        />
                      </div>
                    </>
                  )}

                  {recipientCountry === "US" && (
                    <>
                      <div>
                        <label
                          htmlFor="bankAccountNumber"
                          className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                        >
                          Account number
                        </label>
                        <input
                          id="bankAccountNumber"
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          value={bankAccountNumber}
                          onChange={(e) =>
                            setBankAccountNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 17),
                            )
                          }
                          className={`${inputClass} tabular-nums tracking-wide`}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="bankRoutingNumber"
                          className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                        >
                          ABA routing number
                        </label>
                        <input
                          id="bankRoutingNumber"
                          type="text"
                          inputMode="numeric"
                          maxLength={9}
                          value={bankRoutingNumber}
                          onChange={(e) =>
                            setBankRoutingNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 9),
                            )
                          }
                          className={`${inputClass} tabular-nums tracking-wide`}
                          required
                        />
                      </div>
                    </>
                  )}

                  {recipientCountry && ibanCountryCodes.has(recipientCountry) && (
                    <div>
                      <label
                        htmlFor="bankIban"
                        className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                      >
                        IBAN
                      </label>
                      <input
                        id="bankIban"
                        type="text"
                        autoComplete="off"
                        maxLength={34}
                        value={bankIban}
                        onChange={(e) => setBankIban(e.target.value)}
                        className={`${inputClass} font-mono uppercase`}
                        required
                      />
                    </div>
                  )}

                  {recipientCountry && recipientCountry !== "US" && (
                    <div>
                      <label
                        htmlFor="bankSwiftBic"
                        className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                      >
                        SWIFT / BIC
                      </label>
                      <input
                        id="bankSwiftBic"
                        type="text"
                        maxLength={11}
                        autoComplete="off"
                        value={bankSwiftBic}
                        onChange={(e) =>
                          setBankSwiftBic(
                            e.target.value.replace(/\s/g, "").toUpperCase(),
                          )
                        }
                        className={`${inputClass} font-mono uppercase`}
                        required
                      />
                    </div>
                  )}

                  {recipientCountry &&
                    recipientCountry !== "US" &&
                    !ibanCountryCodes.has(recipientCountry) && (
                      <div>
                        <label
                          htmlFor="bankAccountNumber"
                          className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                        >
                          Account number
                        </label>
                        <input
                          id="bankAccountNumber"
                          type="text"
                          autoComplete="off"
                          maxLength={34}
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          className={`${inputClass} tabular-nums tracking-wide`}
                          required
                        />
                      </div>
                    )}

                  {recipientCountry && (
                    <p className="flex items-start gap-1.5 text-[11px] leading-5 text-gray-500">
                      <Info size={12} className="mt-0.5 shrink-0" />
                      {recipientCountry === "US"
                        ? "US transfers use an account number and 9-digit ABA routing number."
                        : ibanCountryCodes.has(recipientCountry)
                          ? "This destination uses an IBAN and SWIFT/BIC for international transfers."
                          : "Provide the destination account number and the bank's SWIFT/BIC."}
                    </p>
                  )}
                </div>
              )}

              {/* Crypto */}
              {method === "crypto" && (
                <div className="space-y-4 border-t border-gray-200 pt-5">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                    Cryptocurrency wallet
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                        Asset
                      </label>
                      <div className="relative">
                        <select
                          value={asset}
                          onChange={(e) => handleAssetChange(e.target.value)}
                          className={`${inputClass} appearance-none pr-9`}
                        >
                          {cryptoOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                        Network
                      </label>
                      <div className="relative">
                        <select
                          value={network}
                          onChange={(e) => setNetwork(e.target.value)}
                          className={`${inputClass} appearance-none pr-9`}
                        >
                          {networkOptions[asset].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-gray-700">
                      Wallet address
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className={`${inputClass} font-mono text-[12px]`}
                      required
                    />
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Info size={11} />
                      Double-check the address and network. Transfers cannot be
                      reversed.
                    </p>
                  </div>
                </div>
              )}


              {/* Submit */}
              <div className="flex flex-col-reverse items-stretch gap-2 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    "Submitting…"
                  ) : (
                    "Withdraw"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Side summary */}
        <aside className="space-y-4">
          <div className="rounded-md border-none bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Available balance
              </p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                aria-label={showBalance ? "Hide balance" : "Show balance"}
                className="text-gray-400 hover:text-gray-700"
              >
                {showBalance ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="text-[20px] font-bold tabular-nums tracking-tight text-gray-900">
                {showBalance ? formatMoney(balance, currency) : "••••••••"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-gray-500">
                {account?.accountNumber
                  ? `Account ••${String(account.accountNumber).slice(-4)}`
                  : "Account ••0000"}
              </p>
            </div>
          </div>

          <div className="rounded-md border-none bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Summary
              </p>
            </div>
            <dl className="divide-y divide-gray-100 text-[12.5px]">
              <div className="flex items-center justify-between px-4 py-2.5">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-semibold tabular-nums text-gray-900">
                  {amount ? formatMoney(Number(amount), currency) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5">
                <dt className="text-gray-500">Destination</dt>
                <dd className="font-medium text-gray-900">
                  {method === "bank_transfer"
                    ? bankCountries.find(
                        ({ code }) => code === recipientCountry,
                      )?.name || "Bank account"
                    : "Crypto wallet"}
                </dd>
              </div>
              {method === "crypto" && (
                <div className="flex items-center justify-between px-4 py-2.5">
                  <dt className="text-gray-500">Asset / Network</dt>
                  <dd className="font-medium text-gray-900">
                    {asset} · {network}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex items-start gap-2 rounded-md border-none bg-white px-4 py-3">
            <Lock size={13} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-[11px] leading-5 text-gray-500">
              Requests are reviewed before processing. You can track
              status under{" "}
              <span className="font-medium text-gray-700">My Requests</span>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
