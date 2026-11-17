import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  AlertCircle,
  Receipt,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2,
  Wallet,
  AlertTriangle,
  UploadCloud,
  FileText,
  X,
} from "lucide-react";
import {
  createDepositRequest,
  getMyDepositRequests,
} from "../services/depositService";
import { getMyAccount } from "../services/accountService";
import { getPaymentInstructions } from "../services/paymentInstructionsService.js";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) =>
  new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const statusConfig = {
  pending: {
    label: "Pending review",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    icon: Clock3,
  },
  approved: {
    label: "Successful",
    badge: " text-emerald-700 ",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Declined",
    badge: " text-rose-700 ",
    icon: XCircle,
  },
};

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function Deposit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isActivationDeposit =
    searchParams.get("purpose") === "trading_activation";

  const [account, setAccount] = useState(null);
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const [showBalance, setShowBalance] = useState(true);

  const [amount, setAmount] = useState(() =>
    isActivationDeposit ? "300" : "",
  );
  const [method, setMethod] = useState("bank_transfer");
  const [asset, setAsset] = useState("USDT");
  const [network, setNetwork] = useState("TRON");
  const [transactionHash, setTransactionHash] = useState("");
  const [receipt, setReceipt] = useState(null);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedField, setCopiedField] = useState(null);
  const [receiptError, setReceiptError] = useState("");

  const currency = account?.currency || "USD";

  const hasCryptoDetails = Boolean(
    paymentInstructions?.walletName || paymentInstructions?.walletAddress,
  );
  const hasBankDetails = Boolean(
    paymentInstructions?.bankName ||
    paymentInstructions?.bankAccountName ||
    paymentInstructions?.bankAccountNumber ||
    paymentInstructions?.bankRoutingNumber ||
    paymentInstructions?.bankSwiftCode,
  );

  const loadRequests = async () => {
    try {
      const response = await getMyDepositRequests();
      setRequests(response.deposits ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your deposit requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getMyDepositRequests()
      .then((response) => {
        if (active) setRequests(response.deposits ?? []);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your deposit requests.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    (async () => {
      try {
        const a = await getMyAccount();
        if (active) setAccount(a || null);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load your account information.",
          );
        }
      }
      try {
        const instructions = await getPaymentInstructions();
        if (active) setPaymentInstructions(instructions);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load payment instructions.",
          );
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const copyText = async (text, fieldKey) => {
    if (!text) {
      setError("No value available to copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      window.setTimeout(() => {
        setCopiedField((current) => (current === fieldKey ? null : current));
      }, 2000);
    } catch (copyError) {
      console.error("Copy failed:", copyError);
      setError("Unable to copy. Please copy the value manually.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setCopiedField(null);
    setReceiptError("");

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid deposit amount.");
      return;
    }
    if (isActivationDeposit && numericAmount !== 300) {
      setError("Trading activation requires a deposit of exactly $300.");
      return;
    }
    if (method === "crypto" && (!asset.trim() || !network.trim())) {
      setError("Enter the crypto asset and network.");
      return;
    }
    if (!receipt) {
      setError("Upload a payment receipt image or PDF for admin review.");
      return;
    }
    if (receipt.size > MAX_FILE_BYTES) {
      setError("Receipt file must be 5 MB or smaller.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: numericAmount,
        method,
        receipt,
        ...(isActivationDeposit ? { purpose: "trading_activation" } : {}),
        ...(method === "crypto"
          ? {
              asset: asset.trim(),
              network: network.trim(),
              transactionHash: transactionHash.trim(),
            }
          : {}),
      };

      const response = await createDepositRequest(payload);
      setSuccess(
        response.message ||
          "Your deposit request has been submitted for review.",
      );
      if (!isActivationDeposit) setAmount("");
      setTransactionHash("");
      setReceipt(null);
      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to submit your deposit request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15";

  return (
    <div className="space-y-6">
      {isActivationDeposit && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <strong>Trading activation deposit:</strong> submit exactly $300.
          After approval, $300 is credited to your total balance and trading is
          activated.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Form column */}
        <div className="rounded-md border-none bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-[14px] text-slate-800">Make a deposit</h2>
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

            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12.5px] text-emerald-800"
              >
                <CheckCircle2
                  size={15}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                >
                  Deposit Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-gray-500">
                    $
                  </span>
                  <input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    readOnly={isActivationDeposit}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-7 pr-14 text-[16px] font-semibold tabular-nums text-gray-900 outline-none transition placeholder:font-normal placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    USD
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="method"
                  className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                >
                  Deposit method
                </label>
                <div className="relative">
                  <select
                    id="method"
                    value={method}
                    onChange={(event) => {
                      setMethod(event.target.value);
                      setCopiedField(null);
                    }}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* Selected payment details */}
              <PaymentDetailsCard
                method={method}
                instructions={paymentInstructions}
                hasCryptoDetails={hasCryptoDetails}
                hasBankDetails={hasBankDetails}
                copiedField={copiedField}
                onCopy={copyText}
              />

              {method === "crypto" && (
                <div className="space-y-4 border-t border-gray-200 pt-5">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500">
                    Cryptocurrency details
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="asset"
                        className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                      >
                        Asset
                      </label>
                      <input
                        id="asset"
                        required
                        value={asset}
                        onChange={(event) => setAsset(event.target.value)}
                        placeholder="e.g. USDT"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="network"
                        className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                      >
                        Network
                      </label>
                      <div className="relative">
                        <select
                          id="network"
                          value={network}
                          onChange={(event) => setNetwork(event.target.value)}
                          className={`${inputClass} appearance-none pr-9`}
                        >
                          <option value="TRON">TRON (TRC20)</option>
                          <option value="Ethereum">Ethereum (ERC20)</option>
                          <option value="BSC">BNB Smart Chain (BEP20)</option>
                          <option value="Bitcoin">Bitcoin</option>
                        </select>
                        <ChevronDown
                          size={15}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="transactionHash"
                      className="mb-1.5 block text-[12px] font-semibold text-gray-700"
                    >
                      Transaction hash{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="transactionHash"
                      value={transactionHash}
                      onChange={(event) =>
                        setTransactionHash(event.target.value)
                      }
                      placeholder="Paste your transaction hash if available"
                      className={`${inputClass} font-mono text-[12px]`}
                    />
                  </div>
                </div>
              )}

              {/* Receipt upload + actions */}
              <div className="space-y-4 border-t border-gray-200 pt-5">
                <ReceiptUploader
                  receipt={receipt}
                  setReceipt={setReceipt}
                  error={receiptError}
                  setError={setReceiptError}
                />

                <div className="flex flex-col-reverse items-stretch gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !receipt}
                    className="flex items-center justify-center gap-2 rounded-md bg-[#0b3b8c] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Submit deposit request"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right rail */}
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
                {showBalance
                  ? formatMoney(
                      typeof account?.balanceCents === "number"
                        ? account.balanceCents / 100
                        : account?.balance,
                      currency,
                    )
                  : "••••••••"}
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
                <dt className="text-gray-500">Method</dt>
                <dd className="font-medium capitalize text-gray-900">
                  {method === "bank_transfer" ? "Bank transfer" : "Crypto"}
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
        </aside>
      </div>

      {/* History */}
      <section className="overflow-hidden rounded-md border-none bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-[14px] font-bold text-gray-900">
            Recent deposit requests
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2.5 px-6 py-12 text-[13px] text-gray-500">
            <LoaderCircle size={16} className="animate-spin" />
            Loading history…
          </div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Receipt size={22} />
            </div>
            <p className="mt-3 text-[13px] font-semibold text-gray-900">
              No deposit requests yet
            </p>
            <p className="mt-1 text-[12px] text-gray-500">
              Submitted requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-[13px]">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Amount</th>
                  <th className="px-6 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Submitted</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => {
                  const config =
                    statusConfig[request.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <tr
                      key={request.id}
                      className="transition hover:bg-gray-50/60"
                    >
                      <td className="px-6 py-3.5 font-semibold tabular-nums text-gray-900">
                        {formatMoney(request.amount)}
                      </td>
                      <td className="px-6 py-3.5 capitalize text-gray-600">
                        {request.method?.replace(/_/g, " ")}
                        {request.asset ? ` · ${request.asset}` : ""}
                        {request.purpose === "trading_activation" && (
                          <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Trading activation
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-[12px] text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${config.badge}`}
                        >
                          <StatusIcon size={11} />
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Receipt uploader — self-contained, owns all its own state          */
/* ------------------------------------------------------------------ */

function ReceiptUploader({ receipt, setReceipt, error, setError }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Build/revoke preview URL whenever the selected file changes
  useEffect(() => {
    if (!receipt || !receipt.type?.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(receipt);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [receipt]);

  const isImage = Boolean(receipt && receipt.type?.startsWith("image/"));

  const validateAndSet = (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported file type. Use JPG, PNG, WEBP, or PDF.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large. Maximum size is 5 MB.");
      return;
    }
    setError("");
    setReceipt(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files?.[0] || null);
  };

  const clear = () => {
    setReceipt(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          htmlFor="receipt"
          className="block text-[12px] font-semibold text-gray-700"
        >
          Deposit receipt
        </label>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Required
        </span>
      </div>

      {!receipt ? (
        <label
          htmlFor="receipt"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${
            dragging
              ? "border-[#0b3b8c] bg-[#0b3b8c]/5"
              : "border-gray-300 bg-gray-50 hover:border-[#0b3b8c]/60 hover:bg-[#0b3b8c]/[0.03]"
          }`}
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
              dragging
                ? "bg-[#0b3b8c] text-white"
                : "bg-white text-[#0b3b8c] ring-1 ring-gray-200 group-hover:ring-[#0b3b8c]/30"
            }`}
          >
            <UploadCloud size={20} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-gray-900">
              {dragging ? "Drop to upload" : "Click to upload or drag & drop"}
            </p>
            <p className="mt-0.5 text-[11.5px] text-gray-500">
              JPG, PNG, WEBP, or PDF · up to 5 MB
            </p>
          </div>
          <input
            ref={inputRef}
            id="receipt"
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={(e) => validateAndSet(e.target.files?.[0] || null)}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400 ring-1 ring-gray-200">
            {isImage && previewUrl ? (
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText size={22} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-gray-900">
              {receipt.name}
            </p>
            <p className="mt-0.5 text-[11.5px] text-gray-500">
              {(receipt.size / 1024 / 1024).toFixed(2)} MB ·{" "}
              {receipt.type === "application/pdf" ? "PDF" : "Image"}
            </p>
          </div>

          <button
            type="button"
            onClick={clear}
            aria-label="Remove receipt"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-red-700">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Payment details card — shows ONLY the selected method's details    */
/* ------------------------------------------------------------------ */

function PaymentDetailsCard({
  method,
  instructions,
  hasCryptoDetails,
  hasBankDetails,
  copiedField,
  onCopy,
}) {
  const isCrypto = method === "crypto";
  const hasDetails = isCrypto ? hasCryptoDetails : hasBankDetails;

  if (!hasDetails) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle size={16} />
          </span>
          <div>
            <h3 className="text-[13px] font-bold text-amber-900">
              {isCrypto
                ? "Crypto payment details not available"
                : "Bank transfer details not available"}
            </h3>
            <p className="mt-1 text-[12px] text-amber-800">
              Payment details for this method are currently not available.
              Please contact customer service.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const Icon = isCrypto ? Wallet : Building2;

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-blue-200">
      <div className="bg-gradient-to-r from-[#0b3b8c] to-[#1560d4] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white">
            <Icon size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              Fund your account via
            </p>
            <h3 className="text-[14px] font-bold text-white">
              {isCrypto ? "Cryptocurrency" : "Bank transfer"}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-1 p-4">
        <p className="mb-3 text-[12px] text-slate-600">
          Copy the details below and send the exact amount. Deposits are
          credited after review.
        </p>

        <div className="grid gap-2.5">
          {isCrypto ? (
            <>
              {instructions?.walletName && (
                <DetailRow
                  label="Wallet name"
                  value={instructions.walletName}
                  fieldKey="walletName"
                  copiedField={copiedField}
                  onCopy={onCopy}
                />
              )}
              {instructions?.walletAddress && (
                <DetailRow
                  label="Wallet address"
                  value={instructions.walletAddress}
                  fieldKey="walletAddress"
                  copiedField={copiedField}
                  onCopy={onCopy}
                  mono
                  highlight
                />
              )}
            </>
          ) : (
            <>
              {instructions?.bankName && (
                <DetailRow
                  label="Bank name"
                  value={instructions.bankName}
                  fieldKey="bankName"
                  copiedField={copiedField}
                  onCopy={onCopy}
                />
              )}
              {instructions?.bankAccountName && (
                <DetailRow
                  label="Account name"
                  value={instructions.bankAccountName}
                  fieldKey="bankAccountName"
                  copiedField={copiedField}
                  onCopy={onCopy}
                />
              )}
              {instructions?.bankAccountNumber && (
                <DetailRow
                  label="Account number"
                  value={instructions.bankAccountNumber}
                  fieldKey="bankAccountNumber"
                  copiedField={copiedField}
                  onCopy={onCopy}
                  mono
                  highlight
                />
              )}
              {instructions?.bankRoutingNumber && (
                <DetailRow
                  label="Routing number"
                  value={instructions.bankRoutingNumber}
                  fieldKey="bankRoutingNumber"
                  copiedField={copiedField}
                  onCopy={onCopy}
                  mono
                />
              )}
              {instructions?.bankSwiftCode && (
                <DetailRow
                  label="SWIFT / BIC"
                  value={instructions.bankSwiftCode}
                  fieldKey="bankSwiftCode"
                  copiedField={copiedField}
                  onCopy={onCopy}
                  mono
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  fieldKey,
  copiedField,
  onCopy,
  mono = false,
  highlight = false,
}) {
  const isCopied = copiedField === fieldKey;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition ${
        highlight ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p
          className={`mt-0.5 break-all text-[13px] text-slate-900 ${
            mono ? "font-mono" : "font-medium"
          }`}
        >
          {value}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onCopy(value, fieldKey)}
        aria-label={`Copy ${label}`}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition ${
          isCopied
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
        }`}
      >
        {isCopied ? <Check size={12} /> : <Copy size={12} />}
        {isCopied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}