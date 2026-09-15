import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Store,
  RefreshCw,
  MapPin,
  Check,
  X,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { schoolAdminApi } from '../api/schoolAdminApi';
import { MerchantDto } from '../types/merchant';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

const COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-blue-100 text-blue-800',
  'bg-amber-100 text-amber-800',
  'bg-purple-100 text-purple-800',
  'bg-rose-100 text-rose-800',
  'bg-cyan-100 text-cyan-800',
];
function colorFor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export const MerchantsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<MerchantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [targetMerchant, setTargetMerchant] = useState<MerchantDto | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantDto | null>(null);

  const loadMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getMerchants();
      setMerchants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve merchants from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  const pending = merchants.filter((m) => !m.isApproved);
  const approved = merchants.filter((m) => m.isApproved);

  const filtered = useMemo(() => {
    if (filterTab === 'APPROVED') return approved;
    if (filterTab === 'PENDING') return pending;
    return merchants;
  }, [merchants, filterTab]);

  const handleApprove = async () => {
    const merchantId = targetMerchant?.id || targetMerchant?.merchantId;
    if (!merchantId) return;
    setApproveLoading(true);
    setApproveError(null);
    try {
      await schoolAdminApi.approveMerchant(merchantId);
      setApproveModalOpen(false);
      setTargetMerchant(null);
      if (selectedMerchant?.id === merchantId)
        setSelectedMerchant({ ...selectedMerchant, isApproved: true });
      await loadMerchants();
    } catch (err: any) {
      setApproveError(err?.message || 'Failed to approve merchant.');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    const merchantId = targetMerchant?.id || targetMerchant?.merchantId;
    if (!merchantId) return;
    setRejectLoading(true);
    setRejectError(null);
    try {
      await schoolAdminApi.rejectMerchant(merchantId);
      setRejectModalOpen(false);
      setTargetMerchant(null);
      if (selectedMerchant?.id === merchantId)
        setSelectedMerchant({ ...selectedMerchant, isApproved: false });
      await loadMerchants();
    } catch (err: any) {
      setRejectError(err?.message || 'Failed to reject merchant.');
    } finally {
      setRejectLoading(false);
    }
  };

  const columns: ColumnDef<MerchantDto>[] = [
    {
      key: 'businessName',
      header: 'BUSINESS NAME',
      sortable: true,
      render: (row) => {
        const init = initials(row.businessName);
        const color = colorFor(row.businessName);
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${color}`}
            >
              {init}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{row.businessName}</p>
              <p className="text-[11px] text-slate-400">{row.shopLocation || 'Campus Store'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'EMAIL',
      render: (row) => <span className="text-slate-600 text-xs">{row.email}</span>,
    },
    {
      key: 'walletNumber',
      header: 'OWNER (MATRIC)',
      render: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.walletNumber || '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'APP. DATE',
      render: (row) => (
        <span className="text-xs text-slate-500">{(row as any).createdAt || '—'}</span>
      ),
    },
    {
      key: 'isApproved',
      header: 'STATUS',
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.isApproved ? 'Approved' : 'Pending'} size="sm" />
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedMerchant(row);
              setDrawerOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!row.isApproved ? (
            <button
              onClick={() => {
                setTargetMerchant(row);
                setApproveError(null);
                setApproveModalOpen(true);
              }}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Approve"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={() => {
              setTargetMerchant(row);
              setRejectError(null);
              setRejectModalOpen(true);
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Reject"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Merchant Approvals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and manage onboarding requests from campus vendors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Pending count badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PENDING APPROVALS</span>
            <span className="text-lg font-black text-amber-900 leading-none">{loading ? '—' : pending.length}</span>
          </div>
          <button
            onClick={loadMerchants}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">New Today</p>
            <p className="text-3xl font-extrabold text-slate-900 leading-tight mt-1">
              {loading ? '—' : pending.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Total Approved</p>
            <p className="text-3xl font-extrabold text-slate-900 leading-tight mt-1">
              {loading ? '—' : approved.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Approval Rate</p>
            <p className="text-3xl font-extrabold text-slate-900 leading-tight mt-1">
              {loading || merchants.length === 0
                ? '—'
                : `${Math.round((approved.length / merchants.length) * 100)}%`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Merchants Service Notice"
          message={error}
          onRetry={loadMerchants}
          retrying={loading}
        />
      )}

      {/* Filter Tabs + Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
            {(['ALL', 'PENDING', 'APPROVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterTab === tab
                    ? 'bg-white shadow-xs text-emerald-800 border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'ALL' ? `All Applications` : tab === 'PENDING' ? 'Pending' : 'Approved'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Showing 1–{filtered.length} of {filtered.length} results
          </p>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchPlaceholder="Search merchants by business name, location, or email..."
          searchKey={(m) => `${m.businessName} ${m.shopLocation} ${m.email} ${m.walletNumber}`}
          emptyTitle="No Merchants Found"
          emptyDescription="No campus merchants match the selected status filter."
          onRowClick={(row) => {
            setSelectedMerchant(row);
            setDrawerOpen(true);
          }}
        />
      </div>

      {/* Admin Tip */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-sm">
          💡
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">Admin Tip</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Click "View Details" (eye icon) to review a merchant's full application — business info,
            owner details, bank, and shop location — before approving.
          </p>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Approve Campus Merchant"
        description={`Grant payment acceptance privileges to "${targetMerchant?.businessName}" located at "${targetMerchant?.shopLocation}"?`}
        confirmLabel="Authorize Merchant"
        onConfirm={handleApprove}
        loading={approveLoading}
        error={approveError}
      />

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject / Revoke Merchant"
        description={`Revoke payment processing approval for "${targetMerchant?.businessName}"? The merchant will be notified and cannot accept campus transfers.`}
        confirmLabel="Reject Application"
        variant="danger"
        icon="warning"
        onConfirm={handleReject}
        loading={rejectLoading}
        error={rejectError}
      />

      {/* Merchant Detail Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedMerchant?.businessName || 'Merchant Details'}
        subtitle={selectedMerchant?.shopLocation || 'Campus Shop'}
        footerActions={
          selectedMerchant && (
            <>
              {!selectedMerchant.isApproved ? (
                <button
                  onClick={() => {
                    setTargetMerchant(selectedMerchant);
                    setApproveError(null);
                    setApproveModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Application</span>
                </button>
              ) : null}
              <button
                onClick={() => {
                  setTargetMerchant(selectedMerchant);
                  setRejectError(null);
                  setRejectModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )
        }
      >
        {selectedMerchant && (
          <div className="space-y-6 text-xs">
            {/* Business Info */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <Store className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-800 text-sm">Business Information</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Business Name</p>
                    <p className="font-bold text-slate-900">{selectedMerchant.businessName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Shop Location</p>
                    <p className="font-semibold text-slate-800">{selectedMerchant.shopLocation || '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Contact Email</p>
                  <p className="text-slate-700">{selectedMerchant.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Current Status</p>
                  <StatusBadge status={selectedMerchant.isApproved ? 'Approved' : 'Pending'} size="sm" />
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-800">Bank Information</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">NUBAN Account Number</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedMerchant.accountNumber || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bank Name / Code</span>
                  <span className="font-medium text-slate-800">
                    {selectedMerchant.bankName || selectedMerchant.bankCode || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
