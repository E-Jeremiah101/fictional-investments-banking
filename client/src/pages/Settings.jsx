import { useEffect, useMemo, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Home,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyAccount } from "../services/accountService";
import api from "../services/axios.js";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#0b3b8c] focus:ring-2 focus:ring-[#0b3b8c]/15";

/* ---------- small helpers ---------- */

function useAutoDismiss(state, setState, ms = 4500) {
  useEffect(() => {
    if (!state.message) return;
    const t = window.setTimeout(
      () => setState((s) => ({ ...s, message: "" })),
      ms,
    );
    return () => window.clearTimeout(t);
  }, [state.message, setState, ms]);
}

function Feedback({ state }) {
  if (!state.message) return null;
  const ok = state.type === "success";
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`mt-4 flex items-start gap-2 rounded-md border px-3 py-2.5 text-[12.5px] ${
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800"
      }`}
    >
      <Icon
        size={15}
        className={`mt-0.5 shrink-0 ${ok ? "text-emerald-600" : "text-rose-600"}`}
      />
      <span>{state.message}</span>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  required = true,
  error,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-semibold text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClass} pr-10 ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-rose-700">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

function PinInput({ id, label, value, onChange, placeholder, error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[12px] font-semibold text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} text-center text-[18px] font-bold tracking-[0.5em] ${error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15" : ""}`}
        required
      />
      {error && (
        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-rose-700">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- main ---------- */

export default function Settings() {
  const { user } = useAuth();

  const [account, setAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [tab, setTab] = useState("password"); // "password" | "pin"

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pinForm, setPinForm] = useState({
    currentPassword: "",
    newPin: "",
    confirmPin: "",
  });

  const [passwordState, setPasswordState] = useState({
    loading: false,
    message: "",
    type: "",
  });
  const [pinState, setPinState] = useState({
    loading: false,
    message: "",
    type: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [pinErrors, setPinErrors] = useState({});

  useAutoDismiss(passwordState, setPasswordState);
  useAutoDismiss(pinState, setPinState);

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      try {
        const data = await getMyAccount();
        if (active) setAccount(data || null);
      } catch (error) {
        console.error("Unable to load account information.", error);
      } finally {
        if (active) setLoadingAccount(false);
      }
    };
    loadAccount();
    return () => {
      active = false;
    };
  }, []);

  /* live password strength */
  const strength = useMemo(() => {
    const p = passwordForm.newPassword;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0..5
  }, [passwordForm.newPassword]);

  const strengthLabel = [
    "Too weak",
    "Weak",
    "Fair",
    "Good",
    "Strong",
    "Excellent",
  ][strength];
  const strengthColor = [
    "bg-rose-400",
    "bg-rose-400",
    "bg-amber-400",
    "bg-amber-400",
    "bg-emerald-400",
    "bg-emerald-500",
  ][strength];

  const validatePassword = () => {
    const e = {};
    if (!passwordForm.currentPassword)
      e.currentPassword = "Enter your current password.";
    if (passwordForm.newPassword.length < 8)
      e.newPassword = "Use at least 8 characters.";
    if (
      passwordForm.newPassword &&
      passwordForm.newPassword === passwordForm.currentPassword
    )
      e.newPassword = "New password must differ from current password.";
    if (passwordForm.confirmPassword !== passwordForm.newPassword)
      e.confirmPassword = "Passwords do not match.";
    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePin = () => {
    const e = {};
    if (!pinForm.currentPassword)
      e.currentPassword = "Enter your current password.";
    if (!/^\d{4}$/.test(pinForm.newPin))
      e.newPin = "PIN must be exactly 4 digits.";
    if (pinForm.newPin !== pinForm.confirmPin)
      e.confirmPin = "PINs do not match.";
    setPinErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordState({ loading: true, message: "", type: "" });
    if (!validatePassword()) {
      setPasswordState({ loading: false, message: "", type: "" });
      return;
    }
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordState({
        loading: false,
        message: response.data.message || "Password updated successfully.",
        type: "success",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
    } catch (error) {
      setPasswordState({
        loading: false,
        message:
          error.response?.data?.message ||
          "Unable to change your password right now.",
        type: "error",
      });
    }
  };

  const handlePinChange = async (event) => {
    event.preventDefault();
    setPinState({ loading: true, message: "", type: "" });
    if (!validatePin()) {
      setPinState({ loading: false, message: "", type: "" });
      return;
    }
    try {
      const response = await api.post("/auth/change-transaction-pin", {
        currentPassword: pinForm.currentPassword,
        newPin: pinForm.newPin,
        confirmPin: pinForm.confirmPin,
      });
      setPinState({
        loading: false,
        message:
          response.data.message || "Transaction PIN updated successfully.",
        type: "success",
      });
      setPinForm({ currentPassword: "", newPin: "", confirmPin: "" });
      setPinErrors({});
    } catch (error) {
      setPinState({
        loading: false,
        message:
          error.response?.data?.message ||
          "Unable to update your transaction PIN right now.",
        type: "error",
      });
    }
  };

  const personalFields = [
    { icon: User, label: "First name", value: user?.firstName },
    { icon: User, label: "Last name", value: user?.lastName },
    { icon: Mail, label: "Email address", value: user?.email },
    { icon: Phone, label: "Phone number", value: user?.phoneNumber },
    {
      icon: ShieldCheck,
      label: "Account number",
      value: account?.accountNumber,
    },
    { icon: MapPin, label: "Country", value: user?.country },
    { icon: MapPin, label: "State", value: user?.state },
    { icon: MapPin, label: "City", value: user?.city },
    { icon: Home, label: "Address", value: user?.houseAddress },
    { icon: Home, label: "ZIP code", value: user?.zipCode },
    { icon: Users, label: "Next of kin", value: user?.nextOfKinName },
    { icon: Users, label: "Relationship", value: user?.nextOfKinRelationship },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
    

      {/* Personal info */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Personal information
              </h2>
              <p className="text-xs text-slate-500">
                Your registered account details
              </p>
            </div>
          </div>
        </div>

        {loadingAccount ? null : (
          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {personalFields.map((f) => (
              <Detail
                key={f.label}
                icon={f.icon}
                label={f.label}
                value={f.value}
              />
            ))}
          </div>
        )}
      </section>

      {/* Security — tabbed */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Security</h2>
            <p className="text-xs text-slate-500">
              Protect your account with a strong password and a transaction PIN
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { id: "password", label: "Password", icon: Lock },
              { id: "pin", label: "Transaction PIN", icon: KeyRound },
            ].map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-[13px] font-semibold transition ${
                    active
                      ? "border-[#0b3b8c] text-[#0b3b8c]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {tab === "password" ? (
            <form
              onSubmit={handlePasswordChange}
              className="max-w-md space-y-4"
            >
              <PasswordInput
                id="currentPassword"
                label="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((c) => ({
                    ...c,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter your current password"
                autoComplete="current-password"
                error={passwordErrors.currentPassword}
              />

              <div>
                <PasswordInput
                  id="newPassword"
                  label="New password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((c) => ({
                      ...c,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                  minLength={8}
                  error={passwordErrors.newPassword}
                />
                {passwordForm.newPassword && (
                  <div className="mt-2">
                    <div className="flex h-1.5 gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition ${i <= strength ? strengthColor : "bg-slate-200"}`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Strength:{" "}
                      <span className="font-semibold text-slate-700">
                        {strengthLabel}
                      </span>{" "}
                      · use 8+ characters with upper, lower, number & symbol.
                    </p>
                  </div>
                )}
              </div>

              <PasswordInput
                id="confirmPassword"
                label="Confirm password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((c) => ({
                    ...c,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm your new password"
                autoComplete="new-password"
                minLength={8}
                error={passwordErrors.confirmPassword}
              />

              <Feedback state={passwordState} />

              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={passwordState.loading}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0b3b8c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordState.loading
                    ? "Updating password…"
                    : "Update password"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePinChange} className="max-w-md space-y-4">
              <PasswordInput
                id="pinCurrentPassword"
                label="Current password"
                value={pinForm.currentPassword}
                onChange={(e) =>
                  setPinForm((c) => ({ ...c, currentPassword: e.target.value }))
                }
                placeholder="Enter your current password"
                autoComplete="current-password"
                error={pinErrors.currentPassword}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <PinInput
                  id="newPin"
                  label="New PIN"
                  value={pinForm.newPin}
                  onChange={(e) =>
                    setPinForm((c) => ({
                      ...c,
                      newPin: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  placeholder="••••"
                  error={pinErrors.newPin}
                />
                <PinInput
                  id="confirmPin"
                  label="Confirm PIN"
                  value={pinForm.confirmPin}
                  onChange={(e) =>
                    setPinForm((c) => ({
                      ...c,
                      confirmPin: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  placeholder="••••"
                  error={pinErrors.confirmPin}
                />
              </div>

              <p className="rounded-md bg-slate-50 px-3 py-2 text-[11.5px] text-slate-600">
                Your 4-digit PIN is required to authorize withdrawals and
                trades. Don't share it with anyone.
              </p>

              <Feedback state={pinState} />

              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={pinState.loading}
                  className="inline-flex items-center gap-2 rounded-md bg-[#0b3b8c] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#092f70] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pinState.loading
                    ? "Updating PIN…"
                    : "Update transaction PIN"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- detail tile ---------- */

function Detail({ icon: Icon, label, value }) {
  const empty = !value;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
        <Icon size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p
          className={`mt-1 truncate text-[13px] ${empty ? "italic text-slate-400" : "font-medium text-slate-800"}`}
        >
          {empty ? "Not provided" : value}
        </p>
      </div>
    </div>
  );
}