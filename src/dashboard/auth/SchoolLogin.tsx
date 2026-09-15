import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useDashboardAuth } from './AuthContext';
import { authApi } from '../api/authApi';
import { DashboardApiError } from '../types/api';

export const SchoolLogin: React.FC = () => {
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
      setError('Please enter both your institutional email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.schoolAdminLogin({ email, password });
      if (!res.token) {
        throw new Error('Authentication succeeded but no authorization token was returned.');
      }

      // Fetch SchoolAdmin profile
      let profile;
      try {
        profile = await authApi.getSchoolAdminProfile();
      } catch {
        profile = {
          email,
          firstname: res.firstname || 'School',
          lastname: res.lastname || 'Admin',
          role: 'SchoolAdmin' as const,
          schoolCode: res.schoolCode,
          walletNumber: res.walletNumber,
        };
      }

      login('SchoolAdmin', res.token, {
        email: profile.email || email,
        firstname: profile.firstname,
        lastname: profile.lastname,
        schoolCode: profile.schoolCode || res.schoolCode,
        schoolName: profile.schoolName,
        walletNumber: profile.walletNumber,
      });

      const from = (location.state as any)?.from?.pathname || '/dashboard/school';
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err instanceof DashboardApiError) {
        setError(err.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Unable to authenticate. Please check your institutional credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#102b29] text-[#dfffbb] flex items-center justify-center font-black text-xl shadow-md">
            C
          </div>
          <span className="text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
            CampusPay
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Institution & School Admin Portal</span>
        </div>

        <h2 className="text-xl font-bold font-heading text-slate-900">
          Campus Administrator Access
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Manage campus students, merchants, transfers, and wallet activity
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu.ng"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Staff Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 bg-[#102b29] hover:bg-[#163b38] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="px-2">Verifying Institutional Access...</span>
                </>
              ) : (
                <>
                  <span className="px-4">Sign In to School Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Portal Switcher & Wallet Link */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2.5 text-center text-xs text-slate-500">
            <p>
              Are you a CampusPay Platform Administrator?{' '}
              <Link
                to="/dashboard/admin/login"
                className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
              >
                Go to Platform Admin Portal →
              </Link>
            </p>
            <p>
              Student or Merchant?{' '}
              <a
                href="/login"
                className="text-slate-500 hover:text-slate-800 transition-colors"
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
