import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  ArrowLeftRight,
  FileBarChart,
  ShieldCheck,
  LogOut,
  GraduationCap,
  Store,
  Settings,
  Server,
  X,
  ChevronRight,
} from 'lucide-react';
import { useDashboardAuth } from '../auth/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, role, logout } = useDashboardAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    const loginTarget = role === 'SchoolAdmin' ? '/dashboard/school/login' : '/dashboard/admin/login';
    navigate(loginTarget);
  };

  const adminNav = [
    { name: 'Overview', to: '/dashboard/admin', icon: LayoutDashboard, end: true },
    { name: 'Schools', to: '/dashboard/admin/schools', icon: Building2 },
    { name: 'Staff & Admins', to: '/dashboard/admin/users', icon: Users },
    { name: 'Wallets', to: '/dashboard/admin/wallets', icon: Wallet },
    { name: 'Transactions', to: '/dashboard/admin/transactions', icon: ArrowLeftRight },
    { name: 'Reports & Statements', to: '/dashboard/admin/reports', icon: FileBarChart },
    { name: 'System & Banks', to: '/dashboard/admin/system', icon: Server },
  ];

  const schoolNav = [
    { name: 'Overview', to: '/dashboard/school', icon: LayoutDashboard, end: true },
    { name: 'Students', to: '/dashboard/school/students', icon: GraduationCap },
    { name: 'Merchants', to: '/dashboard/school/merchants', icon: Store },
    { name: 'School Staff', to: '/dashboard/school/users', icon: Users },
    { name: 'School Wallet', to: '/dashboard/school/wallets', icon: Wallet },
    { name: 'Transactions', to: '/dashboard/school/transactions', icon: ArrowLeftRight },
    { name: 'Reports', to: '/dashboard/school/reports', icon: FileBarChart },
    { name: 'Settings', to: '/dashboard/school/settings', icon: Settings },
  ];

  const navItems = role === 'Admin' ? adminNav : schoolNav;

  return (
    <aside className="w-64 bg-[#102b29] text-slate-200 flex flex-col h-full border-r border-[#1a403d] select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#1a403d]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#dfffbb] text-[#102b29] flex items-center justify-center font-black text-base shadow-xs">
            C
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white font-heading">
              CampusPay
            </span>
            <span className="block text-[10px] text-emerald-400/90 font-medium -mt-0.5 tracking-wider uppercase">
              {role === 'Admin' ? 'Platform Control' : 'School Portal'}
            </span>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role / Context Badge */}
      <div className="px-4 py-3 bg-[#133633] border-b border-[#1a403d] flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">
            {user?.firstname} {user?.lastname}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {role === 'Admin' ? 'Super Administrator' : `${user?.schoolCode || 'School'} Admin`}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/60">
          {role === 'Admin' ? 'Administration' : 'Institution Management'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#dfffbb] text-[#102b29] font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#102b29]' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#102b29]" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User & Logout */}
      <div className="p-3 border-t border-[#1a403d] bg-[#0d2321]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
