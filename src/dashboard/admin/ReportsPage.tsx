import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  Printer,
} from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { TransactionDto, StatementQuery, TransactionType, TransactionStatus } from '../types/transaction';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState } from '../components/ErrorState';

export const ReportsPage: React.FC = () => {
  const [statementItems, setStatementItems] = useState<TransactionDto[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query Parameters
  const [query, setQuery] = useState<StatementQuery>({
    PageNumber: 1,
    PageSize: 20,
    Type: undefined,
    Status: undefined,
    StartDate: '',
    EndDate: '',
    MinAmount: undefined,
    MaxAmount: undefined,
    Search: '',
  });

  const fetchStatement = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionApi.getWalletStatement({
        ...query,
        StartDate: query.StartDate || undefined,
        EndDate: query.EndDate || undefined,
        Search: query.Search?.trim() || undefined,
      });
      setStatementItems(res.items);
      setTotalRecords(res.totalCount || res.items.length);
    } catch (err: any) {
      setError(err?.message || 'Unable to generate financial statement from backend.');
      setStatementItems([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchStatement();
  }, [fetchStatement]);

  const handlePrint = () => {
    window.print();
  };

  const columns: ColumnDef<TransactionDto>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {row.reference || row.id?.slice(0, 8) || 'N/A'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">
          ₦{Number(row.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Transaction Type',
      render: (row) => <span className="font-medium text-slate-700">{row.type || 'Transfer'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'walletNumber',
      header: 'Account / Wallet',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.walletNumber || row.senderWalletNumber || 'System'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (row) => (
        <span className="text-slate-500 text-xs">
          {row.createdAt || row.date || 'Recent'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Financial Statements & Reporting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query authoritative ledger statements using the live Swagger <code className="text-emerald-700">/Wallet/Statement</code> endpoint
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatement}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={statementItems.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs font-heading cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Statement Query Notice"
          message={error}
          onRetry={fetchStatement}
          retrying={loading}
        />
      )}

      {/* Statement Query Filters Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold font-heading text-slate-800">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Statement Query Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Transaction Category</label>
            <select
              value={query.Type || ''}
              onChange={(e) =>
                setQuery({ ...query, Type: (e.target.value as TransactionType) || undefined })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            >
              <option value="">All Categories</option>
              <option value="Deposit">Deposit</option>
              <option value="Transfer">Transfer</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="QRPayment">QR Payment</option>
              <option value="ScantoPay">Scan to Pay</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Status</label>
            <select
              value={query.Status || ''}
              onChange={(e) =>
                setQuery({ ...query, Status: (e.target.value as TransactionStatus) || undefined })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            >
              <option value="">All Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={query.StartDate}
              onChange={(e) => setQuery({ ...query, StartDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1">End Date</label>
            <input
              type="date"
              value={query.EndDate}
              onChange={(e) => setQuery({ ...query, EndDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Statement Table */}
      <DataTable
        columns={columns}
        data={statementItems}
        loading={loading}
        searchPlaceholder="Filter statement records..."
        emptyTitle="No Statement Records"
        emptyDescription="No transactions found matching your specified query parameters."
      />
    </div>
  );
};
