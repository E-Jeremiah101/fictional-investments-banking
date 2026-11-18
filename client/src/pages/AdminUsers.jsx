import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import {
  adjustAdminUserBalance,
  deactivateAdminUser,
  getAdminUserDetails,
  getAdminUsers,
} from "../services/adminUserService";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Date unavailable";
  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const transactionLabel = (type) =>
  ({
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    adjustment_credit: "Administrator adjustment — credit",
    adjustment_debit: "Administrator adjustment — debit",
    investment_earnings_credit: "Investment earnings increase",
    investment_earnings_debit: "Investment earnings decrease",
  })[type] || type;

function AdminUserDetail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm text-slate-800">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedId, setSelectedId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async (requestedPage = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminUsers(requestedPage);
      setUsers(response.users || []);
      setTotalUsers(response.totalUsers || 0);
      setPage(response.page || requestedPage);
      setPages(Math.max(1, response.pages || 1));
      setSelectedId((current) =>
        response.users?.some((user) => user.id === current)
          ? current
          : response.users?.[0]?.id || "",
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load the customer directory.",
      );
    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedUser(null);
      return undefined;
    }

    let active = true;
    setDetailsLoading(true);
    setError("");

    getAdminUserDetails(selectedId)
      .then((response) => {
        if (active) setSelectedUser(response.user);
      })
      .catch((err) => {
        if (active) {
          setSelectedUser(null);
          setError(
            err.response?.data?.message || "Unable to load customer details.",
          );
        }
      })
      .finally(() => {
        if (active) setDetailsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  const refreshSelectedUser = async () => {
    await Promise.all([loadUsers(page), getAdminUserDetails(selectedId).then(
      (response) => setSelectedUser(response.user),
    )]);
  };

  const handleAdjustment = async (event) => {
    event.preventDefault();
    if (!selectedUser?.id) return;

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await adjustAdminUserBalance(selectedUser.id, {
        direction,
        amount: Number(amount),
        reason: reason.trim(),
      });
      setNotice(response.message);
      setAmount("");
      setReason("");
      await refreshSelectedUser();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to record the balance change.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUser?.id || selectedUser.accountStatus !== "active") return;

    const confirmed = window.confirm(
      `Deactivate access for ${selectedUser.firstName} ${selectedUser.lastName}? Their account and transaction history will be retained.`,
    );
    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await deactivateAdminUser(selectedUser.id);
      setNotice(response.message);
      await refreshSelectedUser();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to deactivate customer access.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <Users size={19} />
              <span className="text-xs font-bold uppercase tracking-wider">
                User Management
              </span>
            </div>


            <div>
              <button
                type="button"
                onClick={() => loadUsers(page)}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>


        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        {notice && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Registered customers
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                  {totalUsers}
                </p>
              </div>
              <Users className="text-blue-700" size={24} />
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-4">
                <h3 className="font-bold">Customers</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Select a user to review their account and history.
                </p>
              </div>
              {users.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">
                  No customers found.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => {
                        setSelectedId(user.id);
                        setNotice("");
                      }}
                      className={`w-full p-4 text-left transition hover:bg-slate-50 ${
                        selectedId === user.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-500">
                            {user.email}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                            user.accountStatus === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.accountStatus}
                        </span>
                      </span>
                      <span className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {user.account?.accountNumber || "No account"}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatMoney(user.account?.balance)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-slate-100 p-3">
                <button
                  type="button"
                  onClick={() => loadUsers(Math.max(1, page - 1))}
                  disabled={loading || page <= 1}
                  aria-label="Previous page"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ArrowLeft size={17} />
                </button>
                <span className="text-xs text-slate-500">
                  Page {page} of {pages}
                </span>
                <button
                  type="button"
                  onClick={() => loadUsers(Math.min(pages, page + 1))}
                  disabled={loading || page >= pages}
                  aria-label="Next page"
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {selectedUser ? (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <UserRound size={23} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </h3>
                        <p className="truncate text-sm text-slate-500">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700">
                      {selectedUser.accountStatus}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Wallet size={15} /> Current balance
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        {formatMoney(selectedUser.account?.balance)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Account
                      </p>
                      <p className="mt-2 break-all text-sm font-semibold">
                        {selectedUser.account?.accountNumber || "Unavailable"}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {selectedUser.account
                          ? `${selectedUser.account.accountType || "Account type unavailable"} · ${selectedUser.account.accountCategory || "Category unavailable"} · ${selectedUser.account.accountStatus || "Status unavailable"}`
                          : "No account"}
                      </p>
                      {selectedUser.account && (
                        <p className="mt-1 text-xs text-slate-500">
                          Trading: {selectedUser.account.tradingStatus || "inactive"}
                          {" · "}Earnings:{" "}
                          {formatMoney(selectedUser.account.earnings)}
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Registered
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h4 className="text-sm font-bold text-slate-900">
                      Application details
                    </h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <AdminUserDetail
                        label="Phone number"
                        value={selectedUser.phoneNumber}
                      />
                      <AdminUserDetail
                        label="Monthly salary / income"
                        value={
                          selectedUser.monthlySalary == null
                            ? null
                            : formatMoney(selectedUser.monthlySalary)
                        }
                      />
                      <AdminUserDetail
                        label="House address"
                        value={[
                          selectedUser.houseAddress,
                          selectedUser.city,
                          selectedUser.state,
                          selectedUser.zipCode,
                          selectedUser.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      />
                      <AdminUserDetail
                        label="Next of kin"
                        value={[
                          selectedUser.nextOfKinName,
                          selectedUser.nextOfKinRelationship,
                          selectedUser.nextOfKinPhone,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                    </div>
                  </div>
                  {selectedUser.accountStatus === "active" ? (
                    <button
                      type="button"
                      onClick={handleDeactivate}
                      disabled={submitting}
                      className="mt-5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Deactivate customer access
                    </button>
                  ) : (
                    <p className="mt-5 text-sm text-slate-500">
                      Customer access is deactivated; historical records are
                      retained.
                    </p>
                  )}
                </section>

                {selectedUser.account &&
                  selectedUser.accountStatus === "active" && (
                    <form
                      onSubmit={handleAdjustment}
                      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                    >
                      <div>
                        <h3 className="font-bold">Balance adjustment</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Every change is labeled in the customer transaction
                          history and requires a reason.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Adjustment
                          </label>
                          <select
                            value={direction}
                            onChange={(event) =>
                              setDirection(event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
                          >
                            <option value="credit">Credit</option>
                            <option value="debit">Debit</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Amount (USD)
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            max="1000000"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Reason
                        </label>
                        <textarea
                          required
                          maxLength={200}
                          rows={2}
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                          placeholder="Explain why this adjustment is needed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting || !amount || !reason.trim()}
                        className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting
                          ? "Saving..."
                          : `Record ${direction} transaction`}
                      </button>
                    </form>
                  )}

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 p-5">
                    <h3 className="font-bold">Transaction history</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest {selectedUser.transactions?.length || 0} ledger
                      entries
                    </p>
                  </div>
                  {!selectedUser.transactions?.length ? (
                    <p className="p-6 text-sm text-slate-500">
                      No transactions recorded.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {selectedUser.transactions.map((transaction) => {
                        const incoming = [
                          "deposit",
                          "adjustment_credit",
                          "investment_earnings_credit",
                        ].includes(transaction.type);

                        return (
                          <article
                            key={transaction.id}
                            className="flex flex-wrap items-start justify-between gap-3 p-4 sm:px-5"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <span
                                className={`mt-0.5 rounded-lg p-2 ${
                                  incoming
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {incoming ? (
                                  <ArrowDownLeft size={17} />
                                ) : (
                                  <ArrowUpRight size={17} />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold">
                                  {transactionLabel(transaction.type)}
                                </p>
                                <p className="mt-1 break-words text-xs text-slate-500">
                                  {transaction.description}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {formatDate(transaction.createdAt)} ·{" "}
                                  {transaction.status}
                                </p>
                              </div>
                            </div>
                            <p
                              className={`text-sm font-bold tabular-nums ${
                                incoming ? "text-emerald-700" : "text-slate-800"
                              }`}
                            >
                              {incoming ? "+" : "-"}
                              {formatMoney(transaction.amount)}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  )}
                  {selectedUser.transactionsLimited && (
                    <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                      Showing the latest 100 transactions.
                    </p>
                  )}
                </section>
              </>
            ) : (
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Select a customer to review their account.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
