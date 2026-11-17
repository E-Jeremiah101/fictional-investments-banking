import {
  Wallet,
  ArrowLeftRight,
  ArrowDownToLine,
  Search,
  Eye,
  EyeOff,
  CreditCard,
  History,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { useState, useEffect, useMemo } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { getMyAccount, getMyTransactions } from "../services/accountService";
import { useAuth } from "../context/AuthContext";

const formatMoney = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getTransactionAmount = (transaction) => {
  if (typeof transaction.amountCents === "number") {
    return transaction.amountCents / 100;
  }
  return Number(transaction.amount) || 0;
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  if (searchParams.get("tab") === "settings") {
    return <Navigate to="/settings" replace />;
  }
  if (searchParams.get("tab") === "help") {
    return <Navigate to="/support" replace />;
  }
  const activePage = searchParams.get("tab") || "overview";

  const setActivePage = (page) => {
    const key = page.toLowerCase();
    setSearchParams(key === "overview" ? {} : { tab: key }, { replace: true });
  };

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [accountLoading, setAccountLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [transactionError, setTransactionError] = useState("");

  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const currency = account?.currency || "USD";

  const loadAccount = async () => {
    try {
      setAccountError("");
      const accountData = await getMyAccount();
      setAccount(accountData || null);
    } catch (error) {
      setAccountError(
        error.response?.data?.message ||
          "Unable to load your account information.",
      );
    } finally {
      setAccountLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactionError("");
      const transactionData = await getMyTransactions();
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
    } catch (error) {
      setTransactionError(
        error.response?.data?.message || "Unable to load your transactions.",
      );
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
    loadTransactions();
  }, []);

  const balance = useMemo(() => {
    if (!account) return 0;
    if (typeof account.balanceCents === "number") {
      return account.balanceCents / 100;
    }
    return Number(account.balance) || 0;
  }, [account]);

  const filteredTransactions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return transactions;
    return transactions.filter((transaction) =>
      [
        transaction.description,
        transaction.reference,
        transaction.type,
        transaction.status,
        transaction.source,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search)),
    );
  }, [transactions, searchTerm]);

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Customer";

 const dashboardActions = [
   {
     title: "Send Money",
     icon: ArrowLeftRight,
     cardBg: "bg-violet-50 hover:bg-violet-100 border-violet-100",
     iconColor: "bg-violet-100 text-violet-600",
     onClick: () => navigate("/withdrawal"),
   },
   {
     title: "Deposit",
     icon: ArrowDownToLine,
     cardBg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
     iconColor: "bg-emerald-100 text-emerald-600",
     onClick: () => navigate("/deposit"),
   },
   {
     title: "History",
     icon: History,
     cardBg: "bg-orange-50 hover:bg-orange-100 border-orange-100",
     iconColor: "bg-orange-100 text-orange-600",
     onClick: () => navigate("/history"),
   },
   {
     title: "My Wallet",
     icon: Wallet,
     cardBg: "bg-blue-50 hover:bg-blue-100 border-blue-100",
     iconColor: "bg-blue-100 text-blue-600",
     onClick: () => setActivePage("wallet"),
   },
 ];
  return (
    <div className="space-y-6 ">
      {/* Overview */}
      {activePage === "overview" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-700">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <h3 className="mt-1 text-2xl tracking-tight text-slate-900 ">
                Hello, <span className="capitalize">{firstName}</span>
              </h3>
            </div>
          </div>

          {/* Balance card */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1a3a] via-[#122a5c] to-[#1e3a8a] p-6 text-white shadow-xl md:p-8">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5" />
            <div className="absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-blue-500/10" />
            <div className="absolute right-8 top-8 opacity-20">
              <CreditCard size={80} strokeWidth={1} />
            </div>

            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-blue-200">
                Total Balance
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                  className="rounded p-0.5 transition hover:bg-white/10"
                >
                  {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>
              <h3 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {accountLoading
                  ? ""
                  : accountError
                    ? ""
                    : showBalance
                      ? formatMoney(balance, currency)
                      : "••••••••"}
              </h3>
              {accountError && (
                <p className="mt-2 text-xs text-rose-200">{accountError}</p>
              )}
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300">
                    Account number
                  </p>
                  <p className="mt-1 font-mono text-sm tracking-wide">
                    {accountLoading ? "Loading…" : account?.accountNumber || ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur">
                  <ShieldCheck size={18} className="text-blue-200" />
                  <span className="text-xs font-medium">Savings Account</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick actions */}
          <div className="lg:px-8">
            <section
              aria-label="Quick actions"
              className="grid grid-cols-2 gap-4 sm:grid-cols-2  "
            >
              {dashboardActions.map((action) => (
                <DashboardActionCard key={action.title} {...action} />
              ))}
            </section>

            {/* Recent transactions */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <h3 className="text-lg  text-slate-900">
                    Recent Transactions
                  </h3>
                </div>
                <button
                  onClick={() => setActivePage("history")}
                  className="flex items-center gap-1 text-xs  text-blue-600 hover:text-blue-800"
                >
                  View all
                  <ChevronRight size={14} />
                </button>
              </div>
              <TransactionTable
                transactions={transactions.slice(0, 5)}
                loading={transactionsLoading}
                error={transactionError}
                currency={currency}
              />
            </section>
          </div>
        </>
      )}

      {/* Transaction history */}
      {activePage === "history" && (
        <section className="overflow-hidden rounded-2xl border-none bg-white shadow-sm ">
          <div className="flex flex-wrap items-center justify-between gap-3 border-none p-5 ">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Transaction history
              </h3>
            </div>
            <div className="relative w-full sm:w-64">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
          <TransactionTable
            transactions={filteredTransactions}
            loading={transactionsLoading}
            error={transactionError}
            currency={currency}
          />
        </section>
      )}

      {/* Wallet */}
      {activePage === "wallet" && (
        <section className="space-y-5">
          <div className="rounded-2xl border-none bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Wallet size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">My Wallet</h3>
                <p className="text-xs text-slate-500">
                  Your Account Information
                </p>
              </div>
            </div>

            {accountLoading ? (
              <p className="mt-6 text-sm text-slate-500">Loading account…</p>
            ) : accountError ? (
              <p className="mt-6 text-sm text-rose-600">{accountError}</p>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <WalletDetail
                  label="Available Balance"
                  value={formatMoney(balance, currency)}
                />
                <WalletDetail
                  label="Account number"
                  value={account?.accountNumber || "Unavailable"}
                />
                <WalletDetail
                  label="Account name"
                  value={account?.accountName || "Unavailable"}
                />
                <WalletDetail
                  label="Account type"
                  value={account?.accountType || "Unavailable"}
                />
                <WalletDetail
                  label="Account category"
                  value={account?.accountCategory || "Unavailable"}
                />
                <WalletDetail label="Currency" value={currency} />
                <WalletDetail
                  label="Account status"
                  value={account?.accountStatus || "Unavailable"}
                />
                <WalletDetail
                  label="Phone number"
                  value={account?.profile?.phoneNumber || "Unavailable"}
                />
                <WalletDetail
                  label="Address"
                  value={
                    account?.profile
                      ? [
                          account.profile.houseAddress,
                          account.profile.city,
                          account.profile.state,
                          account.profile.zipCode,
                          account.profile.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Unavailable"
                      : "Unavailable"
                  }
                />
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}

function TransactionTable({ transactions, loading, error, currency }) {
  if (loading) {
    return <p className="p-6 text-sm text-slate-500">Loading transactions…</p>;
  }
  if (error) {
    return <p className="p-6 text-sm text-rose-600">{error}</p>;
  }
  if (!transactions.length) {
    return (
      <div className="text-center mb-12">
        <p className="p-5 text-[1.2rem] text-slate-500">No transactions yet.</p>
        <p className="pb-4 text-sm text-slate-500">
          {" "}
          Your transactions history will appear here
        </p>

        <button
          className="bg-[#1e3a8a] text-slate-200 py-2 px-3 rounded text-sm"
          onClick={() => setActivePage("deposit")}
        >
          Make your first deposit
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-3.5 font-semibold">Txn No</th>
            <th className="px-5 py-3.5 font-semibold">Date</th>
            <th className="px-5 py-3.5 font-semibold">Type</th>
            <th className="px-5 py-3.5 text-right font-semibold">Amount</th>
            <th className="px-5 py-3.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const type = String(transaction.type || "").toLowerCase();
            const isIncoming =
              type === "deposit" ||
              type === "adjustment_credit" ||
              type === "investment_earnings_credit";
            const amount = getTransactionAmount(transaction);
            const status = String(transaction.status || "").toLowerCase();

            return (
              <tr
                key={transaction.id}
                className="transition hover:bg-slate-50/60"
              >
                <td className="px-5 py-4 font-medium text-slate-800">
                
                  {transaction.reference && (
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                       {transaction.reference}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  {formatDate(transaction.createdAt)}
                </td>
                <td className="px-5 py-4 capitalize text-slate-600">
                  {type === "adjustment_credit"
                    ? "Credit"
                    : type === "adjustment_debit"
                      ? "Debit"
                      : type === "investment_earnings_credit"
                        ? "Investment earnings credit"
                        : type === "investment_earnings_debit"
                          ? "Investment earnings debit"
                          : transaction.type || "Transaction"}
                </td>
                <td
                  className={`px-5 py-4 text-right font-semibold ${
                    isIncoming ? "text-emerald-600" : "text-slate-800"
                  }`}
                >
                  {isIncoming ? "+" : "−"}
                  {formatMoney(amount, transaction.currency || currency)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : status === "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        status === "completed"
                          ? "bg-emerald-500"
                          : status === "rejected"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                      }`}
                    />
                    {transaction.status || "Unknown"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DashboardActionCard({
  title,
  description,
  icon: Icon,
  cardBg,
  iconColor,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl  p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 `}
    >
      <div className={`shrink-0 rounded-xl p-3 ${iconColor}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-sm  text-slate-900">{title}</h3>
      {  <p className="text-xs text-slate-700"></p>}
    </button>
  );
}

function WalletDetail({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default Dashboard;
