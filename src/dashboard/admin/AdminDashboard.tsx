import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Users,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../api/analyticsApi';
import { schoolApi } from '../api/schoolApi';
import { transactionApi } from '../api/transactionApi';
import { SystemDashboardDto } from '../types/analytics';
import { SchoolDto } from '../types/school';
import { TransactionDto } from '../types/transaction';
import { MetricCard } from '../components/MetricCard';
import { VolumeBarChart, RatioBreakdown } from '../components/Charts';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState } from '../components/ErrorState';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemDashboardDto | null>(null);
  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, schoolList, txList] = await Promise.all([
        analyticsApi.getSystemDashboard().catch(() => ({})),
        schoolApi.getAllSchools().catch(() => []),
        transactionApi.getTransactionHistory().catch(() => []),
      ]);

      setMetrics(analyticsData);
      setSchools(schoolList);
      setRecentTx(Array.isArray(txList) ? txList.slice(0, 5) : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load platform analytics from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived values from live data
  const totalSchoolsCount = schools.length || metrics?.totalSchools || 0;
  const totalWalletsCount = metrics?.totalWallets ?? 0;
  const totalTxCount = recentTx.length || metrics?.totalTransactions || 0;
  const totalVolumeAmount = metrics?.totalVolume ?? 0;

  // Chart data
  const statusItems = [
    { label: 'Successful', value: metrics?.successfulTransactions ?? (recentTx.filter(t => t.status === 'Successful').length || 0), color: '#10b981' },
    { label: 'Pending', value: metrics?.pendingTransactions ?? (recentTx.filter(t => t.status === 'Pending').length || 0), color: '#f59e0b' },
    { label: 'Failed', value: metrics?.failedTransactions ?? (recentTx.filter(t => t.status === 'Failed').length || 0), color: '#f43f5e' },
  ];

  // Use real daily/weekly breakdown from analytics if available, otherwise empty
  const volumeChartData: { label: string; value: number }[] = (() => {
    const raw = (metrics as any)?.dailyVolume || (metrics as any)?.weeklyVolume || (metrics as any)?.volumeByDay;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((item: any) => ({
        label: item.label || item.day || item.date || '',
        value: Number(item.value || item.amount || item.volume || 0),
      }));
    }
    // If backend returns total volume only, show it as a single bar
    if (totalVolumeAmount > 0) {
      return [{ label: 'Volume', value: totalVolumeAmount }];
    }
    return [];
  })();

  const columns: ColumnDef<TransactionDto>[] = [
    {
      key: 'reference',
      header: 'Reference',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 font-semibold">
          {row.reference || row.id?.slice(0, 8) || 'N/A'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          ₦{Number(row.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span className="text-slate-600 font-medium">{row.type || 'Transfer'}</span>,
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
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Ecosystem Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operations, liquidity, and institution activity across CampusPay
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/admin/schools')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#102b29] bg-[#dfffbb] hover:bg-[#ebffd3] rounded-xl transition-colors shadow-2xs font-heading cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Institution</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Backend Connection Note"
          message={error}
          onRetry={loadData}
          retrying={loading}
        />
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Institutions"
          value={totalSchoolsCount}
          icon={Building2}
          color="emerald"
          subtitle="Partner universities active"
          loading={loading}
          onClick={() => navigate('/dashboard/admin/schools')}
        />
        <MetricCard
          title="Active Wallets"
          value={totalWalletsCount}
          icon={Wallet}
          color="blue"
          subtitle="Students, merchants & school"
          loading={loading}
          onClick={() => navigate('/dashboard/admin/wallets')}
        />
        <MetricCard
          title="Platform Volume"
          value={`₦${totalVolumeAmount.toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
          subtitle="Total transacted capital"
          loading={loading}
          onClick={() => navigate('/dashboard/admin/reports')}
        />
        <MetricCard
          title="Total Transactions"
          value={totalTxCount}
          icon={ArrowLeftRight}
          color="purple"
          subtitle="Processed payment events"
          loading={loading}
          onClick={() => navigate('/dashboard/admin/transactions')}
        />
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeBarChart
            data={volumeChartData}
            title="Weekly Transaction Volume"
            subtitle="Normalized volume activity across partner schools"
          />
        </div>
        <div>
          <RatioBreakdown
            title="Transaction Status Ratio"
            items={statusItems}
          />
        </div>
      </div>

      {/* Recent Platform Transactions Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-heading text-slate-800">
            Recent Platform Activity
          </h3>
          <button
            onClick={() => navigate('/dashboard/admin/transactions')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Records</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <DataTable
          columns={columns}
          data={recentTx}
          loading={loading}
          searchPlaceholder="Search recent transactions..."
          emptyTitle="No platform transactions recorded"
          emptyDescription="As payments and transfers are executed, they will appear in real time here."
          onRowClick={() => navigate('/dashboard/admin/transactions')}
        />
      </div>
    </div>
  );
};
