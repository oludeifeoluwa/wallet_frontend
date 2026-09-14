import React, { useState } from 'react';
import {
  Settings,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Building,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useDashboardAuth } from '../auth/AuthContext';
import { authApi } from '../api/authApi';
import { DashboardApiError } from '../types/api';

export const SchoolSettingsPage: React.FC = () => {
  const { user } = useDashboardAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Please provide both your current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err instanceof DashboardApiError) {
        setError(err.message);
      } else {
        setError(err?.message || 'Failed to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Profile & Security Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your school administrator credentials and campus configuration
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold font-heading text-slate-800 text-sm flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-700" />
          <span>Institutional Account Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500">Administrator Name</span>
            <p className="font-bold text-slate-900 mt-0.5">{user?.firstname} {user?.lastname}</p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500">Work Email</span>
            <p className="font-bold text-slate-900 mt-0.5">{user?.email}</p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500">Institution Code</span>
            <p className="font-mono font-bold text-emerald-800 mt-0.5">{user?.schoolCode || 'Assigned School'}</p>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500">Role Privilege</span>
            <p className="font-semibold text-slate-800 mt-0.5">School Administrator</p>
          </div>
        </div>
      </div>

      {/* Change Password Form Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-700" />
          <h3 className="font-bold font-heading text-slate-800 text-sm">
            Change Account Password
          </h3>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="show-pass"
              checked={showPass}
              onChange={(e) => setShowPass(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="show-pass" className="text-slate-600 cursor-pointer">
              Show password characters
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs font-heading cursor-pointer disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};
