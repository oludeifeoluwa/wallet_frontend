import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Store,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Building,
  CreditCard,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { schoolAdminApi } from '../api/schoolAdminApi';
import { MerchantDto } from '../types/merchant';
import { DataTable, ColumnDef } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

export const MerchantsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<MerchantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  // Approve Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [targetMerchant, setTargetMerchant] = useState<MerchantDto | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Detail Drawer
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

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      if (filterStatus === 'APPROVED') return m.isApproved === true;
      if (filterStatus === 'PENDING') return m.isApproved !== true;
      return true;
    });
  }, [merchants, filterStatus]);

  const handleApprove = async () => {
    const merchantId = targetMerchant?.id || targetMerchant?.merchantId;
    if (!merchantId) return;
    setApproveLoading(true);
    setApproveError(null);
    try {
      await schoolAdminApi.approveMerchant(merchantId);
      setApproveModalOpen(false);
      setTargetMerchant(null);
      if (selectedMerchant?.id === merchantId) {
        setSelectedMerchant({ ...selectedMerchant, isApproved: true });
      }
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
      if (selectedMerchant?.id === merchantId) {
        setSelectedMerchant({ ...selectedMerchant, isApproved: false });
      }
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
      header: 'Business / Shop',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.businessName}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{row.shopLocation || 'Campus Store'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact Email',
      render: (row) => <span className="text-slate-600">{row.email}</span>,
    },
    {
      key: 'isApproved',
      header: 'Verification Status',
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.isApproved ? 'Approved' : 'Pending'} size="sm" />
      ),
    },
    {
      key: 'walletNumber',
      header: 'Wallet',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.walletNumber || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Verification Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {!row.isApproved ? (
            <button
              onClick={() => {
                setTargetMerchant(row);
                setApproveError(null);
                setApproveModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Approve</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setTargetMerchant(row);
                setRejectError(null);
                setRejectModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reject</span>
            </button>
          )}
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
            Campus Merchants
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review merchant registrations and authorize campus payment acceptance
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {error && (
        <ErrorState
          title="Merchants Service Notice"
          message={error}
          onRetry={loadMerchants}
          retrying={loading}
        />
      )}

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center gap-2 text-xs w-fit">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-[#102b29] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({merchants.length})
        </button>
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterStatus === 'PENDING'
              ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Pending Review ({merchants.filter((m) => !m.isApproved).length})</span>
        </button>
        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterStatus === 'APPROVED'
              ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Approved ({merchants.filter((m) => m.isApproved).length})</span>
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredMerchants}
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
                  className="px-4 py-2 text-xs font-semibold text-[#102b29] bg-[#dfffbb] hover:bg-[#ebffd3] rounded-xl transition-colors cursor-pointer font-heading flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Merchant</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTargetMerchant(selectedMerchant);
                    setRejectError(null);
                    setRejectModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Revoke Approval</span>
                </button>
              )}
            </>
          )
        }
      >
        {selectedMerchant && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Business Name</span>
                <span className="font-bold text-slate-900">{selectedMerchant.businessName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shop / Complex Location</span>
                <span className="font-semibold text-slate-800">{selectedMerchant.shopLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Contact Email</span>
                <span className="text-slate-700">{selectedMerchant.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Status</span>
                <StatusBadge status={selectedMerchant.isApproved ? 'Approved' : 'Pending'} size="sm" />
              </div>
            </div>

            {/* Settlement Bank Details */}
            <div className="space-y-2">
              <h4 className="font-bold font-heading text-slate-800 text-sm">
                Settlement Bank Information
              </h4>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
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
