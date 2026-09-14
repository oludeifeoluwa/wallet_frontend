import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  RefreshCw,
  TrendingUp,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { walletApi } from '../api/walletApi';
import { transactionApi } from '../api/transactionApi';
import { WalletDto, TransactionDto } from '../types/transaction';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState } from '../components/ErrorState';

export const SchoolWalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWalletData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletData, txList] = await Promise.all([
        walletApi.getWallet().catch(() => null),
        transactionApi.getWalletTransactions().catch(() => []),
      ]);

      setWallet(walletData);
      setTransactions(Array.isArray(txList) ? txList : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve institutional wallet records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

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
            Institutional Wallet
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authoritative balance and transaction records for campus accounts
          </p>
        </div>

        <button
          onClick={loadWalletData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <ErrorState
          title="Institutional Wallet Notice"
          message={error}
          onRetry={loadWalletData}
          retrying={loading}
        />
      )}

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-linear-to-br from-[#102b29] to-[#1a4441] text-white rounded-3xl shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span className="font-semibold uppercase tracking-wider">Available Balance</span>
            <Wallet className="w-4 h-4 text-[#dfffbb]" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-white">
            ₦{Number(wallet?.balance ?? wallet?.availableBalance ?? 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs text-emerald-100">
            <span className="font-mono">{wallet?.walletNumber || 'School Wallet'}</span>
            <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
              Live Reserve
            </span>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Ledger / Settlement Balance
          </span>
          <p className="text-3xl font-bold font-heading text-slate-900">
            ₦{Number(wallet?.ledgerBalance ?? wallet?.balance ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">
            Authoritative settled funds
          </p>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Wallet Status
          </span>
          <div className="pt-1">
            <StatusBadge status={wallet?.isLocked ? 'Locked' : 'Active'} />
          </div>
          <p className="text-xs text-slate-500">
            Operational and ready to receive transactions
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-heading text-slate-800">
          Institutional Wallet Movement
        </h3>
        <DataTable
          columns={columns}
          data={transactions}
          loading={loading}
          searchPlaceholder="Search wallet transactions..."
          emptyTitle="No Wallet Movement"
          emptyDescription="Transactions impacting the school wallet will be listed here."
        />
      </div>
    </div>
  );
};
