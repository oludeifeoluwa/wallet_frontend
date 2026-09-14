import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDashboardAuth } from './AuthContext';
import { DashboardRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: DashboardRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, role, loading } = useDashboardAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-700">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide">Verifying authorization...</p>
      </div>
    );
  }

  if (!user || !role) {
    const loginPath = allowedRole === 'SchoolAdmin' ? '/dashboard/school/login' : '/dashboard/admin/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If Admin attempts to view school route or vice versa, redirect to their home
    const fallbackPath = role === 'Admin' ? '/dashboard/admin' : '/dashboard/school';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
