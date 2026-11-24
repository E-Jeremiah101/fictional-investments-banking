import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  X,
  Filter,
  Download,
  CheckCircle2,
  Clock3,
  XCircle,
  Wallet,
  UserRound,
  CreditCard,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminTransactions } from "../services/adminUserService";

const PAGE_SIZE = 25;

const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatus = (status) => {
  if (["completed", "approved", "successful"].includes(status)) {
    return "successful";
  }

  if (["rejected", "failed"].includes(status)) {
    return "failed";
  }

  return status || "pending";
};

const statusStyles = {
  successful: "bg-emerald-50 text-emerald-700 border-emerald-100",
  failed: "bg-red-50 text-red-700 border-red-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  processing: "bg-blue-50 text-blue-700 border-blue-100",
};

const StatusBadge = ({ status }) => {
  const normalizedStatus = getStatus(status);

  const Icon =
    normalizedStatus === "successful"
      ? CheckCircle2
      : normalizedStatus === "failed"
        ? XCircle
        : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
        statusStyles[normalizedStatus] ||
        "border-gray-200 bg-gray-50 text-gray-600"
      }`}
    >
      <Icon size={13} />
      {normalizedStatus}
    </span>
  );
};

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const fetchTransactions = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await getAdminTransactions(page);

        setTransactions(data.transactions || []);
        setTotalTransactions(data.totalTransactions || 0);
        setTotalPages(Math.max(data.pages || 1, 1));
      } catch (err) {
        console.error("Admin transactions error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load transactions. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page],
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const customerName = [
        transaction.user?.firstName,
        transaction.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const matchesSearch =
        !searchValue ||
        customerName.toLowerCase().includes(searchValue) ||
        transaction.user?.email?.toLowerCase().includes(searchValue) ||
        transaction.reference?.toLowerCase().includes(searchValue) ||
        transaction.description?.toLowerCase().includes(searchValue) ||
        transaction.account?.accountNumber?.toLowerCase().includes(searchValue);

      const normalizedStatus = getStatus(transaction.status);

      const matchesStatus =
        statusFilter === "all" || normalizedStatus === statusFilter;

      const matchesType =
        typeFilter === "all" || transaction.type?.toLowerCase() === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, search, statusFilter, typeFilter]);

  const statistics = useMemo(() => {
    const successful = transactions.filter(
      (item) => getStatus(item.status) === "successful",
    );

    const pending = transactions.filter(
      (item) => getStatus(item.status) === "pending",
    );

    const failed = transactions.filter(
      (item) => getStatus(item.status) === "failed",
    );

    const totalIn = successful
      .filter((item) =>
        ["deposit", "credit", "transfer_in"].includes(item.type?.toLowerCase()),
      )
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const totalOut = successful
      .filter((item) =>
        ["withdrawal", "debit", "transfer_out"].includes(
          item.type?.toLowerCase(),
        ),
      )
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      totalIn,
      totalOut,
    };
  }, [transactions]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleExport = () => {
    if (!filteredTransactions.length) return;

    const headers = [
      "Reference",
      "Customer",
      "Email",
      "Account Number",
      "Type",
      "Description",
      "Amount",
      "Currency",
      "Status",
      "Transaction Date",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.reference,
      `${transaction.user?.firstName || ""} ${transaction.user?.lastName || ""}`.trim(),
      transaction.user?.email || "",
      transaction.account?.accountNumber || "",
      transaction.type || "",
      transaction.description || "",
      transaction.amount || 0,
      transaction.currency || "USD",
      getStatus(transaction.status),
      formatDate(transaction.transactionDate || transaction.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `admin-transactions-page-${page}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="font-medium text-gray-800">All Transactions</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            All Transactions
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Monitor and review transactions across all customer accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTransactions(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={!filteredTransactions.length}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ArrowLeftRight size={21} />
            </div>
            <span className="text-xs font-medium text-gray-400">
              All records
            </span>
          </div>

          <p className="mt-4 text-sm font-medium text-gray-500">
            Total Transactions
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {totalTransactions.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>
            <span className="text-xs font-medium text-emerald-600">
              Successful
            </span>
          </div>

          <p className="mt-4 text-sm font-medium text-gray-500">
            Successful Transactions
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {statistics.successful}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={21} />
            </div>
            <span className="text-xs font-medium text-amber-600">
              Awaiting review
            </span>
          </div>

          <p className="mt-4 text-sm font-medium text-gray-500">
            Pending Transactions
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {statistics.pending}
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle size={21} />
            </div>
            <span className="text-xs font-medium text-red-600">Failed</span>
          </div>

          <p className="mt-4 text-sm font-medium text-gray-500">
            Failed Transactions
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {statistics.failed}
          </h2>
        </div>
      </div>

      {/* Transaction volume */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ArrowDownLeft size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Successful money in (current page)
            </p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(statistics.totalIn)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <ArrowUpRight size={22} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Successful money out (current page)
            </p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">
              {formatCurrency(statistics.totalOut)}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, email, reference or account number..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Filter
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-9 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-44"
              >
                <option value="all">All statuses</option>
                <option value="successful">Successful</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 sm:w-44"
            >
              <option value="all">All types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="transfer">Transfer</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => fetchTransactions()}
            className="shrink-0 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Transactions table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-gray-900">Transaction History</h2>
            <p className="mt-1 text-xs text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions on this page
            </p>
          </div>

          <span className="text-xs font-medium text-gray-400">
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <RefreshCw size={25} className="animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <ArrowLeftRight size={25} />
            </div>

            <h3 className="font-semibold text-gray-800">
              No transactions found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              No transactions match your search or selected filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Transaction</th>
                    <th className="px-5 py-4">Reference</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((transaction) => {
                    const customerName =
                      [transaction.user?.firstName, transaction.user?.lastName]
                        .filter(Boolean)
                        .join(" ") || "Unknown customer";

                    const transactionType = transaction.type || "Transaction";

                    const isMoneyIn = [
                      "deposit",
                      "credit",
                      "transfer_in",
                    ].includes(transactionType.toLowerCase());

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-gray-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                              {customerName.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {customerName}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-gray-500">
                                {transaction.user?.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold capitalize text-gray-800">
                            {transactionType.replaceAll("_", " ")}
                          </p>
                          <p className="mt-0.5 max-w-48 truncate text-xs text-gray-500">
                            {transaction.description || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-gray-600">
                            {transaction.reference || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-sm font-bold ${
                              isMoneyIn ? "text-emerald-600" : "text-gray-900"
                            }`}
                          >
                            {isMoneyIn ? "+" : ""}
                            {formatCurrency(
                              transaction.amount,
                              transaction.currency,
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarDays size={14} className="text-gray-400" />
                            {formatDate(
                              transaction.transactionDate ||
                                transaction.createdAt,
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={transaction.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages} ·{" "}
                {totalTransactions.toLocaleString()} total transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-gray-900 px-3 text-sm font-semibold text-white">
                  {page}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transaction details modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Transaction Details
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Full transaction information
                </p>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-2xl bg-gray-50 p-5 text-center">
                <p className="text-sm text-gray-500">Transaction Amount</p>

                <h3 className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(
                    selectedTransaction.amount,
                    selectedTransaction.currency,
                  )}
                </h3>

                <div className="mt-3">
                  <StatusBadge status={selectedTransaction.status} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <DetailRow
                  icon={UserRound}
                  label="Customer"
                  value={
                    [
                      selectedTransaction.user?.firstName,
                      selectedTransaction.user?.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ") || "Unknown"
                  }
                />

                <DetailRow
                  icon={UserRound}
                  label="Email"
                  value={selectedTransaction.user?.email || "—"}
                />

                <DetailRow
                  icon={CreditCard}
                  label="Account Number"
                  value={selectedTransaction.account?.accountNumber || "—"}
                />

                <DetailRow
                  icon={ArrowLeftRight}
                  label="Transaction Type"
                  value={selectedTransaction.type?.replaceAll("_", " ") || "—"}
                  capitalize
                />

                <DetailRow
                  icon={Wallet}
                  label="Description"
                  value={selectedTransaction.description || "—"}
                />

                <DetailRow
                  icon={CalendarDays}
                  label="Transaction Date"
                  value={formatDate(
                    selectedTransaction.transactionDate ||
                      selectedTransaction.createdAt,
                  )}
                />

                <DetailRow
                  icon={CalendarDays}
                  label="Record Created"
                  value={formatDate(selectedTransaction.createdAt)}
                />

                <DetailRow
                  icon={ArrowLeftRight}
                  label="Reference"
                  value={selectedTransaction.reference || "—"}
                />

                <DetailRow
                  icon={Wallet}
                  label="Source"
                  value={selectedTransaction.source || "—"}
                  capitalize
                />

                {selectedTransaction.reviewedAt && (
                  <DetailRow
                    icon={CalendarDays}
                    label="Reviewed At"
                    value={formatDate(selectedTransaction.reviewedAt)}
                  />
                )}

                {selectedTransaction.reviewedBy && (
                  <DetailRow
                    icon={UserRound}
                    label="Reviewed By"
                    value={[
                      selectedTransaction.reviewedBy.firstName,
                      selectedTransaction.reviewedBy.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                )}

                {selectedTransaction.rejectionReason && (
                  <DetailRow
                    icon={XCircle}
                    label="Rejection Reason"
                    value={selectedTransaction.rejectionReason}
                  />
                )}
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="mt-7 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, capitalize = false }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
      <Icon size={16} />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 break-words text-sm font-semibold text-gray-800 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default AdminTransactions;
