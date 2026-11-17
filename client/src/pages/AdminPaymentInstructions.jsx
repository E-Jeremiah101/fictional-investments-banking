import { useEffect, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import {
  getPaymentInstructions,
  updatePaymentInstructions,
} from "../services/paymentInstructionsService.js";

const fields = [
  { name: "walletName", label: "Crypto wallet name", maxLength: 80 },
  { name: "walletAddress", label: "Crypto wallet address", maxLength: 200 },
  { name: "bankName", label: "Bank name", maxLength: 100 },
  { name: "bankAccountName", label: "Bank account name", maxLength: 100 },
  { name: "bankAccountNumber", label: "Bank account number", maxLength: 50 },
  { name: "bankRoutingNumber", label: "Routing number", maxLength: 50 },
  { name: "bankSwiftCode", label: "SWIFT / BIC code", maxLength: 30 },
];

const emptyInstructions = Object.fromEntries(
  fields.map(({ name }) => [name, ""]),
);

export default function AdminPaymentInstructions() {
  const [instructions, setInstructions] = useState(emptyInstructions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getPaymentInstructions()
      .then((data) => setInstructions({ ...emptyInstructions, ...data }))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Unable to load payment instructions.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInstructions((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await updatePaymentInstructions(instructions);
      setInstructions({ ...emptyInstructions, ...response.instructions });
      setNotice(response.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save payment instructions.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Deposit payment instructions
        </h1>

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

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading current details…
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map(({ name, label, maxLength }) => (
                <label
                  key={name}
                  className={`block text-sm font-medium text-slate-700 ${
                    name === "walletAddress" ? "sm:col-span-2" : ""
                  }`}
                >
                  {label}
                  <input
                    type="text"
                    name={name}
                    maxLength={maxLength}
                    value={instructions[name] || ""}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder={`${label} (optional)`}
                  />
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save payment details
            </button>
          </>
        )}
      </form>
    </div>
  );
}
