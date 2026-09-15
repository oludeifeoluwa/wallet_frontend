import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, Building, CheckCircle2 } from 'lucide-react';
import { useDashboardAuth } from './AuthContext';
import { authApi } from '../api/authApi';
import { DashboardApiError } from '../types/api';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useDashboardAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.adminLogin({ email, password });
      if (!res.token) {
        throw new Error('Authentication succeeded but no authorization token was returned.');
      }

      // Fetch admin profile
      let profile;
      try {
        profile = await authApi.getAdminProfile();
      } catch {
        profile = {
          email,
          firstname: res.firstname || 'Super',
          lastname: res.lastname || 'Admin',
          role: 'Admin' as const,
          walletNumber: res.walletNumber,
        };
      }

      login('Admin', res.token, {
        email: profile.email || email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        walletNumber: profile.walletNumber,
      });

      const from = (location.state as any)?.from?.pathname || '/dashboard/admin';
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err instanceof DashboardApiError) {
        setError(err.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Unable to authenticate. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows matching Stitch palette */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#dfffbb] text-[#102b29] flex items-center justify-center font-black text-xl shadow-md">
            C
          </div>
          <span className="text-2xl font-extrabold font-heading text-white tracking-tight">
            CampusPay
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Platform Administrator Portal</span>
        </div>

        <h2 className="text-xl font-bold font-heading text-slate-100">
          Sign In to Platform Control
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Direct authentication with the CampusPay Production Backend
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@campuspay.ng"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 bg-[#dfffbb] hover:bg-[#ebffd3] text-[#102b29] font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#102b29] border-t-transparent rounded-full animate-spin" />
                  <span className="px-2">Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="px-4">Sign In as Platform Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Portal Switcher & Wallet Link */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-col gap-2.5 text-center text-xs text-slate-400">
            <p>
              Are you a School / University Administrator?{' '}
              <Link
                to="/dashboard/school/login"
                className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Go to School Portal →
              </Link>
            </p>
            <p>
              Student or Merchant?{' '}
              <a
                href="/login"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                Return to CampusPay Wallet App
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
