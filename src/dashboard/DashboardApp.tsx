import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useDashboardAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AdminLogin } from './auth/AdminLogin';
import { SchoolLogin } from './auth/SchoolLogin';
import { DashboardLayout } from './layouts/DashboardLayout';

// Admin Pages
import { AdminDashboard } from './admin/AdminDashboard';
import { SchoolsPage } from './admin/SchoolsPage';
import { UsersPage } from './admin/UsersPage';
import { WalletsPage } from './admin/WalletsPage';
import { TransactionsPage } from './admin/TransactionsPage';
import { ReportsPage } from './admin/ReportsPage';
import { SystemPage } from './admin/SystemPage';

// School Pages
import { SchoolDashboard } from './school/SchoolDashboard';
import { StudentsPage } from './school/StudentsPage';
import { MerchantsPage } from './school/MerchantsPage';
import { SchoolUsersPage } from './school/SchoolUsersPage';
import { SchoolWalletPage } from './school/SchoolWalletPage';
import { SchoolTransactionsPage } from './school/SchoolTransactionsPage';
import { SchoolReportsPage } from './school/SchoolReportsPage';
import { SchoolSettingsPage } from './school/SchoolSettingsPage';

function RootDashboardRedirect() {
  const { user, role, loading } = useDashboardAuth();
  if (loading) return null;
  if (user && role === 'Admin') return <Navigate to="/dashboard/admin" replace />;
  if (user && role === 'SchoolAdmin') return <Navigate to="/dashboard/school" replace />;
  return <Navigate to="/dashboard/admin/login" replace />;
}

export default function DashboardApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/dashboard/admin/login" element={<AdminLogin />} />
          <Route path="/dashboard/school/login" element={<SchoolLogin />} />

          {/* Admin Protected Routes */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRole="Admin">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="schools" element={<SchoolsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="wallets" element={<WalletsPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="system" element={<SystemPage />} />
          </Route>

          {/* School Admin Protected Routes */}
          <Route
            path="/dashboard/school"
            element={
              <ProtectedRoute allowedRole="SchoolAdmin">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SchoolDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="merchants" element={<MerchantsPage />} />
            <Route path="users" element={<SchoolUsersPage />} />
            <Route path="wallets" element={<SchoolWalletPage />} />
            <Route path="transactions" element={<SchoolTransactionsPage />} />
            <Route path="reports" element={<SchoolReportsPage />} />
            <Route path="settings" element={<SchoolSettingsPage />} />
          </Route>

          {/* Default Redirections */}
          <Route path="/dashboard" element={<RootDashboardRedirect />} />
          <Route path="/dashboard/*" element={<RootDashboardRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
