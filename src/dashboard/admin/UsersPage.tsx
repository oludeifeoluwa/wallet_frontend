import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Trash2,
  RefreshCw,
  Mail,
  Building,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { schoolApi } from '../api/schoolApi';
import { SchoolUserDto, SchoolDto } from '../types/school';
import { CreateSchoolAdminDto } from '../types/auth';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<SchoolUserDto[]>([]);
  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create School Admin Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSchoolAdminDto>({
    firstname: '',
    lastname: '',
    email: '',
    schoolCode: '',
    password: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete Staff Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SchoolUserDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SchoolUserDto | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, schoolList] = await Promise.all([
        schoolApi.getSchoolUsers().catch(() => []),
        schoolApi.getAllSchools().catch(() => []),
      ]);
      setUsers(userList);
      setSchools(schoolList);
      if (schoolList.length > 0 && !formData.schoolCode) {
        setFormData((prev) => ({ ...prev, schoolCode: schoolList[0].code }));
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve school users from the backend.');
    } finally {
      setLoading(false);
    }
  }, [formData.schoolCode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAdmin = async () => {
    if (!formData.lastname.trim() || !formData.email.trim() || !formData.password || !formData.schoolCode) {
      setCreateError('Last name, institutional email, school code, and password are required.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      await adminApi.createSchoolAdmin({
        firstname: formData.firstname?.trim() || undefined,
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        schoolCode: formData.schoolCode.trim(),
        password: formData.password,
      });
      setCreateModalOpen(false);
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        schoolCode: schools[0]?.code || '',
        password: '',
      });
      await loadData();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create school administrator.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteStaff = async () => {
    const userId = userToDelete?.id || userToDelete?.userId;
    if (!userId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await adminApi.deleteAdmin(userId);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      if (selectedUser?.id === userId) {
        setDrawerOpen(false);
      }
      await loadData();
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: ColumnDef<SchoolUserDto>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {row.firstname?.charAt(0) || row.lastname?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-bold text-slate-900">
              {row.firstname} {row.lastname}
            </p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'schoolCode',
      header: 'School Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {row.schoolCode || 'Global'}
        </span>
      ),
    },
    {
      key: 'walletNumber',
      header: 'Wallet / Account',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">
          {row.walletNumber || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setUserToDelete(row);
              setDeleteError(null);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Revoke / Delete Staff"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Staff & Institution Admins
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision and monitor authorized school administrative personnel
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
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
            <span>Create School Admin</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Users Service Notice"
          message={error}
          onRetry={loadData}
          retrying={loading}
        />
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search staff by name, email, or school..."
        searchKey={(u) => `${u.firstname} ${u.lastname} ${u.email} ${u.schoolCode}`}
        emptyTitle="No Institutional Staff Found"
        emptyDescription="Create your first school administrator using the button above."
        onRowClick={(row) => {
          setSelectedUser(row);
          setDrawerOpen(true);
        }}
      />

      {/* Create School Admin Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create School Administrator"
        description="Grants administrative access to manage campus merchants and students."
        confirmLabel="Provision Admin"
        onConfirm={handleCreateAdmin}
        loading={createLoading}
        error={createError}
        size="md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">First Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Samuel"
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
              placeholder="e.g. Adeyemi"
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
              placeholder="e.g. finance@unilag.edu.ng"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Institution</label>
            <select
              value={formData.schoolCode}
              onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 bg-white"
            >
              {schools.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Staff Password</label>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Revoke Staff Access"
        description={`Are you sure you want to revoke administrative access for ${userToDelete?.firstname} ${userToDelete?.lastname} (${userToDelete?.email})?`}
        confirmLabel="Revoke Access"
        variant="danger"
        icon="warning"
        onConfirm={handleDeleteStaff}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`${selectedUser?.firstname || ''} ${selectedUser?.lastname || 'Staff Member'}`}
        subtitle={`Campus: ${selectedUser?.schoolCode || 'Global'}`}
      >
        {selectedUser && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900">{selectedUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Institution Code</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedUser.schoolCode || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wallet Number</span>
                <span className="font-mono text-slate-700">
                  {selectedUser.walletNumber || 'None assigned'}
                </span>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
