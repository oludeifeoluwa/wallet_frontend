import React, { useState } from 'react';
import {
  Wallet,
  Search,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Building,
  User,
  Shield,
} from 'lucide-react';
import { walletApi } from '../api/walletApi';
import { WalletDto } from '../types/transaction';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const WalletsPage: React.FC = () => {
  const [walletNumberInput, setWalletNumberInput] = useState('');
  const [searchedWallet, setSearchedWallet] = useState<WalletDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock/Unlock Modal
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!walletNumberInput.trim()) {
      setError('Please enter a valid wallet number to search.');
      return;
    }

    setLoading(true);
    setError(null);
    setActionSuccess(null);

    try {
      const data = await walletApi.searchWalletNumber(walletNumberInput.trim());
      if (!data) {
        setError(`No wallet record found matching "${walletNumberInput}".`);
        setSearchedWallet(null);
      } else {
        setSearchedWallet(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve wallet details.');
      setSearchedWallet(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (!searchedWallet?.walletNumber) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await walletApi.lockOrUnlockWallet(searchedWallet.walletNumber);
      const nextState = !searchedWallet.isLocked;
      setSearchedWallet({ ...searchedWallet, isLocked: nextState });
      setActionSuccess(`Wallet successfully ${nextState ? 'locked' : 'unlocked'}.`);
      setLockModalOpen(false);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update wallet lock state.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Wallet Operations & Audit
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Authoritative balance lookup, status verification, and administrative lock control
        </p>
      </div>

      {/* Search Form Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs max-w-2xl">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Search Wallet Number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={walletNumberInput}
                onChange={(e) => setWalletNumberInput(e.target.value)}
                placeholder="Enter wallet number (e.g. WAL-98234 or matric/account)"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-[#102b29] bg-[#dfffbb] hover:bg-[#ebffd3] rounded-xl transition-colors shadow-2xs font-heading disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-[#102b29] border-t-transparent rounded-full animate-spin" />}
              <span>Lookup</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Authoritative data directly queried from Swagger <code className="text-emerald-700">POST /Wallet/Search/WalletNumber</code>
          </p>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* Searched Wallet Result Card */}
      {searchedWallet && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs max-w-2xl space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 font-heading text-lg">
                    {searchedWallet.walletNumber}
                  </h3>
                  <StatusBadge status={searchedWallet.isLocked ? 'Locked' : 'Active'} size="sm" />
                </div>
                <p className="text-xs text-slate-500">
                  {searchedWallet.ownerName || searchedWallet.ownerEmail || 'Account Holder'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActionError(null);
                setLockModalOpen(true);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                searchedWallet.isLocked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {searchedWallet.isLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Wallet</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Wallet</span>
                </>
              )}
            </button>
          </div>

          {/* Authoritative Balances */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Available Balance
              </span>
              <p className="text-2xl font-bold font-heading text-slate-900 mt-1">
                ₦{Number(searchedWallet.balance ?? searchedWallet.availableBalance ?? 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Authoritative from API</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Ledger / Total Balance
              </span>
              <p className="text-2xl font-bold font-heading text-slate-900 mt-1">
                ₦{Number(searchedWallet.ledgerBalance ?? searchedWallet.balance ?? 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Settled funds</span>
            </div>
          </div>

          {/* Attributes */}
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">School Code</span>
              <span className="font-mono font-semibold text-slate-800">
                {searchedWallet.schoolCode || 'N/A'}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Account Type / Role</span>
              <span className="font-semibold text-slate-800 capitalize">
                {searchedWallet.role || 'Digital Wallet Account'}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Operational Status</span>
              <span className="font-medium text-slate-700">
                {searchedWallet.isLocked ? 'Restricted: Outflows and payments disabled' : 'Normal: Full transactions permitted'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Lock/Unlock Confirmation Modal */}
      <Modal
        isOpen={lockModalOpen}
        onClose={() => setLockModalOpen(false)}
        title={searchedWallet?.isLocked ? 'Unlock Digital Wallet' : 'Lock Digital Wallet'}
        description={
          searchedWallet?.isLocked
            ? `Restore transactional privileges for wallet ${searchedWallet?.walletNumber}?`
            : `Suspend transactional operations for wallet ${searchedWallet?.walletNumber}? The account holder will be unable to transfer or withdraw funds.`
        }
        confirmLabel={searchedWallet?.isLocked ? 'Confirm Unlock' : 'Confirm Lock'}
        variant={searchedWallet?.isLocked ? 'primary' : 'danger'}
        icon="warning"
        onConfirm={handleToggleLock}
        loading={actionLoading}
        error={actionError}
      />
    </div>
  );
};
