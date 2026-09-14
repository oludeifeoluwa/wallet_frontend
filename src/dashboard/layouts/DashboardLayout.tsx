import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#102b29] z-10 animate-in slide-in-from-left duration-200">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
