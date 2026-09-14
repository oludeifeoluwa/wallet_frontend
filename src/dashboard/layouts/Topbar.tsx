import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Activity, Shield } from 'lucide-react';
import { useDashboardAuth } from '../auth/AuthContext';

interface TopbarProps {
  onOpenMobile: () => void;
}

const routeTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard/admin': { title: 'Platform Overview', subtitle: 'Global metrics and ecosystem health' },
  '/dashboard/admin/schools': { title: 'School Management', subtitle: 'Manage onboarded institutions and credentials' },
  '/dashboard/admin/users': { title: 'Staff & Administrators', subtitle: 'Manage institution administrators and roles' },
  '/dashboard/admin/wallets': { title: 'Wallet Monitoring', subtitle: 'Search, audit balances, and toggle wallet lock states' },
  '/dashboard/admin/transactions': { title: 'Platform Transactions', subtitle: 'Full record of ecosystem money movement' },
  '/dashboard/admin/reports': { title: 'Financial Statements & Reports', subtitle: 'Generate account statements and volume digests' },
  '/dashboard/admin/system': { title: 'System Health & Banks', subtitle: 'Live API status, supported banks, and connectivity' },

  '/dashboard/school': { title: 'School Overview', subtitle: 'Institutional activity and balance summary' },
  '/dashboard/school/students': { title: 'Enrolled Students', subtitle: 'Student directory and wallet mappings' },
  '/dashboard/school/merchants': { title: 'Campus Merchants', subtitle: 'Merchant applications, verifications, and approvals' },
  '/dashboard/school/users': { title: 'School Administrators', subtitle: 'Institution officers and authorized personnel' },
  '/dashboard/school/wallets': { title: 'Institutional Wallet', subtitle: 'Institution balance, search, and activity' },
  '/dashboard/school/transactions': { title: 'School Transactions', subtitle: 'Payments and transfers within your campus' },
  '/dashboard/school/reports': { title: 'School Reports', subtitle: 'Financial records and statement export' },
  '/dashboard/school/settings': { title: 'Profile & Security', subtitle: 'Account details and credentials' },
};

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile }) => {
  const location = useLocation();
  const { user, role } = useDashboardAuth();

  const currentRouteInfo = routeTitles[location.pathname] || {
    title: 'Dashboard',
    subtitle: 'CampusPay Management',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Mobile Menu & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-bold font-heading text-slate-900 leading-tight">
            {currentRouteInfo.title}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {currentRouteInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Live Backend Badge & User Chip */}
      <div className="flex items-center gap-3">
        {/* Backend Connectivity Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Backend Live (Render API v1.0)</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#102b29] text-white flex items-center justify-center font-bold text-xs">
            {user?.firstname?.charAt(0) || 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-none">
              {user?.firstname} {user?.lastname}
            </p>
            <span className="text-[10px] text-slate-500 capitalize">
              {role === 'Admin' ? 'Platform Admin' : `${user?.schoolCode || 'School'} Admin`}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
