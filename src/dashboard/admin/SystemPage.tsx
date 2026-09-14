import React, { useState, useEffect, useCallback } from 'react';
import {
  Server,
  Building,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { BankDto } from '../types/auth';
import { DataTable, ColumnDef } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';

export const SystemPage: React.FC = () => {
  const [banks, setBanks] = useState<BankDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getBanks();
      setBanks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve bank list from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  const columns: ColumnDef<BankDto>[] = [
    {
      key: 'name',
      header: 'Financial Institution / Bank',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            <Building className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">Slug: {row.slug || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'CBN Bank Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Account Type',
      render: (row) => (
        <span className="text-xs uppercase text-slate-600 font-medium">
          {row.type || 'NUBAN'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Transfer Support',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-600/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Supported
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
            System Connectivity & Settlement Banks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real backend infrastructure parameters and Central Bank of Nigeria bank codes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadBanks}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <a
            href="https://campus-pay-na3y.onrender.com/swagger/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs font-heading"
          >
            <span>OpenAPI Swagger</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Bank Directory Notice"
          message={error}
          onRetry={loadBanks}
          retrying={loading}
        />
      )}

      {/* Connectivity Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Backend Host</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-bold text-slate-900 text-sm font-mono truncate">
            campus-pay-na3y.onrender.com
          </p>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live & Responding
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">API Version</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="font-bold text-slate-900 text-sm font-mono">
            /api/v1.0 (REST OpenAPI 3.0.4)
          </p>
          <p className="text-[11px] text-slate-500">
            Strict non-mock data architecture
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Connected Banks</span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <p className="font-bold text-slate-900 text-2xl font-heading">
            {banks.length}
          </p>
          <p className="text-[11px] text-slate-500">
            Licensed Nigerian commercial banks
          </p>
        </div>
      </div>

      {/* Supported Banks Directory */}
      <div className="space-y-3">
        <h3 className="text-base font-bold font-heading text-slate-800">
          Supported Disbursement & Transfer Banks
        </h3>
        <DataTable
          columns={columns}
          data={banks}
          loading={loading}
          searchPlaceholder="Search by bank name or CBN code..."
          searchKey={(b) => `${b.name} ${b.code}`}
          emptyTitle="No Banks Loaded"
          emptyDescription="Connected banks will be listed here from the backend."
        />
      </div>
    </div>
  );
};
