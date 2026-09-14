import React, { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart,
  RefreshCw,
  Printer,
  Filter,
} from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { TransactionDto, StatementQuery, TransactionType, TransactionStatus } from '../types/transaction';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState } from '../components/ErrorState';

export const SchoolReportsPage: React.FC = () => {
  const [statementItems, setStatementItems] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<StatementQuery>({
    PageNumber: 1,
    PageSize: 20,
    Type: undefined,
    Status: undefined,
    StartDate: '',
    EndDate: '',
  });

  const fetchStatements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionApi.getWalletStatement({
        ...query,
        StartDate: query.StartDate || undefined,
        EndDate: query.EndDate || undefined,
      });
      setStatementItems(res.items);
    } catch (err: any) {
      setError(err?.message || 'Unable to load school statements.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

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
      header: 'Type',
      render: (row) => <span className="font-medium text-slate-700">{row.type || 'Transfer'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
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
            Institutional Financial Statements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified financial audit records for campus student payments and merchant disbursements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatements}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Generate</span>
          </button>
          <button
            onClick={() => window.print()}
            disabled={statementItems.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs font-heading cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Reports Notice"
          message={error}
          onRetry={fetchStatements}
          retrying={loading}
        />
      )}

      {/* Query Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 font-bold">
          <Filter className="w-4 h-4 text-emerald-700" />
          <span>Filter:</span>
        </div>

        <div>
          <select
            value={query.Type || ''}
            onChange={(e) =>
              setQuery({ ...query, Type: (e.target.value as TransactionType) || undefined })
            }
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
          >
            <option value="">All Types</option>
            <option value="Deposit">Deposit</option>
            <option value="Transfer">Transfer</option>
            <option value="Withdrawal">Withdrawal</option>
          </select>
        </div>

        <div>
          <select
            value={query.Status || ''}
            onChange={(e) =>
              setQuery({ ...query, Status: (e.target.value as TransactionStatus) || undefined })
            }
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-emerald-600"
          >
            <option value="">All Statuses</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-500">From:</span>
          <input
            type="date"
            value={query.StartDate}
            onChange={(e) => setQuery({ ...query, StartDate: e.target.value })}
            className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-slate-500">To:</span>
          <input
            type="date"
            value={query.EndDate}
            onChange={(e) => setQuery({ ...query, EndDate: e.target.value })}
            className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* Statement Table */}
      <DataTable
        columns={columns}
        data={statementItems}
        loading={loading}
        searchPlaceholder="Search statement records..."
        emptyTitle="No Report Records"
        emptyDescription="No transaction records match the specified filters."
      />
    </div>
  );
};
