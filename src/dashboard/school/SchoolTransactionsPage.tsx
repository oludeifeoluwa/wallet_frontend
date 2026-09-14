import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  RefreshCw,
  Copy,
  Check,
  Filter,
} from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { TransactionDto } from '../types/transaction';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

export const SchoolTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionDto | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionApi.getTransactionHistory();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve campus transaction history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
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
      header: 'Category',
      render: (row) => <span className="font-medium text-slate-700">{row.type || 'Transfer'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
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
            Campus Transactions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit payments between enrolled students and approved campus merchants
          </p>
        </div>

        <button
          onClick={loadTransactions}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <ErrorState
          title="Transactions Notice"
          message={error}
          onRetry={loadTransactions}
          retrying={loading}
        />
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        searchPlaceholder="Search by reference, description, or wallet..."
        searchKey={(t) => `${t.reference || ''} ${t.description || ''} ${t.senderWalletNumber || ''}`}
        emptyTitle="No Campus Transactions"
        emptyDescription="Transactions will appear here as payments are transacted."
        onRowClick={(row) => {
          setSelectedTx(row);
          setDrawerOpen(true);
        }}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Transaction Record"
        subtitle={`Ref: ${selectedTx?.reference || selectedTx?.id || '—'}`}
      >
        {selectedTx && (
          <div className="space-y-6 text-xs">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <span className="text-slate-500 text-[11px] uppercase font-semibold">Amount</span>
              <p className="text-3xl font-bold font-heading text-slate-900">
                ₦{Number(selectedTx.amount || 0).toLocaleString()}
              </p>
              <div className="pt-2 flex justify-center">
                <StatusBadge status={selectedTx.status} />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Reference</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900">
                    {selectedTx.reference || selectedTx.id || 'N/A'}
                  </span>
                  {selectedTx.reference && (
                    <button
                      onClick={() => handleCopyRef(selectedTx.reference!)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-slate-800">{selectedTx.type || 'Transfer'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timestamp</span>
                <span className="text-slate-700">{selectedTx.createdAt || selectedTx.date || 'Recent'}</span>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
