import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeftRight,
  RefreshCw,
  Copy,
  Check,
  Filter,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { TransactionDto, TransactionStatus, TransactionType } from '../types/transaction';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Detail Drawer
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
      setError(err?.message || 'Unable to load transaction records from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedStatus !== 'ALL' && tx.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      if (selectedType !== 'ALL' && tx.type?.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [transactions, selectedStatus, selectedType]);

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
          {row.reference || row.id?.slice(0, 10) || 'N/A'}
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
      header: 'Category / Type',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {row.type || 'Transfer'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'participants',
      header: 'Counterparties',
      render: (row) => (
        <div className="text-[11px] text-slate-500">
          {row.senderWalletNumber ? (
            <p>From: <span className="font-mono text-slate-700">{row.senderWalletNumber}</span></p>
          ) : null}
          {row.receiverWalletNumber ? (
            <p>To: <span className="font-mono text-slate-700">{row.receiverWalletNumber}</span></p>
          ) : null}
          {!row.senderWalletNumber && !row.receiverWalletNumber && (
            <span>{row.walletNumber || 'System Entry'}</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
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
            Transaction Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit payment movement, deposits, withdrawals, and campus merchant transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTransactions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Transactions API Notice"
          message={error}
          onRetry={loadTransactions}
          retrying={loading}
        />
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filters:</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-emerald-600 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Reversed">Reversed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 outline-none focus:border-emerald-600 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Deposit">Deposit</option>
            <option value="Transfer">Transfer</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="QRPayment">QR Payment</option>
            <option value="ScantoPay">Scan to Pay</option>
          </select>
        </div>

        {(selectedStatus !== 'ALL' || selectedType !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedStatus('ALL');
              setSelectedType('ALL');
            }}
            className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2 ml-auto cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        loading={loading}
        searchPlaceholder="Search by reference, description, or wallet..."
        searchKey={(t) => `${t.reference || ''} ${t.description || ''} ${t.senderWalletNumber || ''} ${t.receiverWalletNumber || ''} ${t.walletNumber || ''}`}
        emptyTitle="No Transactions Found"
        emptyDescription="No payment events match the selected criteria."
        onRowClick={(row) => {
          setSelectedTx(row);
          setDrawerOpen(true);
        }}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Transaction Breakdown"
        subtitle={`Ref: ${selectedTx?.reference || selectedTx?.id || '—'}`}
      >
        {selectedTx && (
          <div className="space-y-6 text-xs">
            {/* Amount Banner */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <span className="text-slate-500 text-[11px] uppercase font-semibold">
                Gross Amount
              </span>
              <p className="text-3xl font-extrabold font-heading text-slate-900">
                ₦{Number(selectedTx.amount || 0).toLocaleString()}
              </p>
              <div className="pt-2 flex justify-center">
                <StatusBadge status={selectedTx.status} />
              </div>
            </div>

            {/* Reference Copy */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Transaction Reference</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
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
                <span className="text-slate-500">Payment Category</span>
                <span className="font-semibold text-slate-800">{selectedTx.type || 'Transfer'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timestamp</span>
                <span className="text-slate-700">{selectedTx.createdAt || selectedTx.date || 'Recent'}</span>
              </div>
            </div>

            {/* Counterparty info */}
            <div className="space-y-2">
              <h4 className="font-bold font-heading text-slate-800 text-sm">
                Party Information
              </h4>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Originating Wallet</span>
                  <span className="font-mono text-slate-800">{selectedTx.senderWalletNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Beneficiary Wallet</span>
                  <span className="font-mono text-slate-800">{selectedTx.receiverWalletNumber || 'N/A'}</span>
                </div>
                {selectedTx.description && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 block mb-1">Narration / Memo</span>
                    <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg italic">
                      "{selectedTx.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
