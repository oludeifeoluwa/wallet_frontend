import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Store,
  Wallet,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useDashboardAuth } from '../auth/AuthContext';
import { analyticsApi } from '../api/analyticsApi';
import { schoolAdminApi } from '../api/schoolAdminApi';
import { SchoolDashboardDto } from '../types/analytics';
import { StudentDto } from '../types/student';
import { MerchantDto } from '../types/merchant';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState } from '../components/ErrorState';

export const SchoolDashboard: React.FC = () => {
  const { user } = useDashboardAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<SchoolDashboardDto | null>(null);
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [merchants, setMerchants] = useState<MerchantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchoolData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashMetrics, studentList, merchantList] = await Promise.all([
        analyticsApi.getSchoolDashboard().catch(() => ({})),
        schoolAdminApi.getStudents().catch(() => []),
        schoolAdminApi.getMerchants().catch(() => []),
      ]);

      setAnalytics(dashMetrics);
      setStudents(Array.isArray(studentList) ? studentList : []);
      setMerchants(Array.isArray(merchantList) ? merchantList : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve school metrics from the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchoolData();
  }, [loadSchoolData]);

  const pendingMerchants = merchants.filter((m) => !m.isApproved);
  const approvedMerchants = merchants.filter((m) => m.isApproved);

  const totalStudentsCount = students.length || analytics?.totalStudents || 0;
  const totalMerchantsCount = merchants.length || analytics?.totalMerchants || 0;
  const pendingCount = pendingMerchants.length || analytics?.pendingMerchantApprovals || 0;
  const schoolBalance = analytics?.schoolWalletBalance ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {user?.schoolCode || 'Campus'}
            </span>
            <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Institution Workspace
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor student enrollments, merchant compliance, and institutional payment flows
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSchoolData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/school/merchants')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#102b29] bg-[#dfffbb] hover:bg-[#ebffd3] rounded-xl transition-colors shadow-2xs font-heading cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Review Merchants ({pendingCount})</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="School Dashboard Notice"
          message={error}
          onRetry={loadSchoolData}
          retrying={loading}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Enrolled Students"
          value={totalStudentsCount}
          icon={GraduationCap}
          color="emerald"
          subtitle="Verified campus wallets"
          loading={loading}
          onClick={() => navigate('/dashboard/school/students')}
        />
        <MetricCard
          title="Active Merchants"
          value={approvedMerchants.length || totalMerchantsCount}
          icon={Store}
          color="blue"
          subtitle="Approved campus vendors"
          loading={loading}
          onClick={() => navigate('/dashboard/school/merchants')}
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingCount}
          icon={Clock}
          color="amber"
          subtitle="Awaiting staff verification"
          loading={loading}
          onClick={() => navigate('/dashboard/school/merchants')}
        />
        <MetricCard
          title="Institutional Balance"
          value={`₦${schoolBalance.toLocaleString()}`}
          icon={Wallet}
          color="purple"
          subtitle="Direct school wallet reserve"
          loading={loading}
          onClick={() => navigate('/dashboard/school/wallets')}
        />
      </div>

      {/* Pending Merchant Approvals Callout */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-sm font-heading">
                {pendingCount} Campus Merchant Application{pendingCount > 1 ? 's' : ''} Pending Review
              </h3>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Campus business owners have registered for your school. Please review their shop location and bank details to grant payment processing privileges.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/school/merchants')}
            className="px-4 py-2 bg-amber-800 text-white font-semibold text-xs rounded-xl hover:bg-amber-900 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            Review Applications →
          </button>
        </div>
      )}

      {/* Quick Summary Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-heading text-slate-800 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Recently Enrolled Students</span>
            </h3>
            <button
              onClick={() => navigate('/dashboard/school/students')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({totalStudentsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {students.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No students enrolled yet for this institution.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.slice(0, 4).map((s) => (
                <div key={s.id || s.matricNumber} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{s.firstname} {s.lastname}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Matric: {s.matricNumber}</p>
                  </div>
                  <span className="font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    {s.walletNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Merchants Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-heading text-slate-800 text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-700" />
              <span>Campus Merchants Status</span>
            </h3>
            <button
              onClick={() => navigate('/dashboard/school/merchants')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({totalMerchantsCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {merchants.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No merchants onboarded yet for this campus.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {merchants.slice(0, 4).map((m) => (
                <div key={m.id || m.email} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{m.businessName}</p>
                    <p className="text-[11px] text-slate-400">{m.shopLocation}</p>
                  </div>
                  <StatusBadge status={m.isApproved ? 'Approved' : 'Pending'} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
