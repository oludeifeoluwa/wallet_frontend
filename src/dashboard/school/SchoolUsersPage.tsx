import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  RefreshCw,
  Mail,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useDashboardAuth } from '../auth/AuthContext';
import { schoolAdminApi } from '../api/schoolAdminApi';
import { schoolApi } from '../api/schoolApi';
import { SchoolUserDto } from '../types/school';
import { CreateSchoolAdminDto } from '../types/auth';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ErrorState } from '../components/ErrorState';

export const SchoolUsersPage: React.FC = () => {
  const { user } = useDashboardAuth();
  const [users, setUsers] = useState<SchoolUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSchoolAdminDto>({
    firstname: '',
    lastname: '',
    email: '',
    schoolCode: user?.schoolCode || '',
    password: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.getSchoolUsers();
      // Filter to users belonging to this school if code is present
      const filtered = user?.schoolCode
        ? data.filter((u) => u.schoolCode?.toLowerCase() === user.schoolCode?.toLowerCase())
        : data;
      setUsers(filtered);
    } catch (err: any) {
      setError(err?.message || 'Unable to load school staff from the server.');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolCode]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateStaff = async () => {
    if (!formData.lastname.trim() || !formData.email.trim() || !formData.password) {
      setCreateError('Last name, institutional email, and password are required.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      await schoolAdminApi.createSchoolAdmin({
        firstname: formData.firstname?.trim() || undefined,
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        schoolCode: user?.schoolCode || formData.schoolCode,
        password: formData.password,
      });
      setCreateModalOpen(false);
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        schoolCode: user?.schoolCode || '',
        password: '',
      });
      await loadUsers();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to add school administrator.');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns: ColumnDef<SchoolUserDto>[] = [
    {
      key: 'name',
      header: 'Officer Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            {row.firstname?.charAt(0) || row.lastname?.charAt(0) || 'A'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.firstname} {row.lastname}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'schoolCode',
      header: 'Assigned Campus',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
          {row.schoolCode}
        </span>
      ),
    },
    {
      key: 'walletNumber',
      header: 'Account / Wallet',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.walletNumber || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            School Administrators & Staff
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized officers managing student verifications and merchant onboarding for {user?.schoolCode || 'your campus'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#102b29] bg-[#dfffbb] hover:bg-[#ebffd3] rounded-xl transition-colors shadow-2xs font-heading cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add School Admin</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Staff Directory Notice"
          message={error}
          onRetry={loadUsers}
          retrying={loading}
        />
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search staff by name or email..."
        emptyTitle="No Additional Staff Configured"
        emptyDescription="Add an officer to help manage campus merchant approvals."
      />

      {/* Add School Admin Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Campus Administrator"
        description={`Grant administrative privileges for ${user?.schoolCode || 'your institution'}.`}
        confirmLabel="Create Admin"
        onConfirm={handleCreateStaff}
        loading={createLoading}
        error={createError}
        size="md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">First Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Bukola"
              value={formData.firstname}
              onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Adeleke"
              value={formData.lastname}
              onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
            <input
              type="email"
              required
              placeholder="staff@school.edu.ng"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
