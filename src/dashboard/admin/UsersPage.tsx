import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Trash2,
  RefreshCw,
  Users,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { schoolApi } from '../api/schoolApi';
import { SchoolUserDto, SchoolDto } from '../types/school';
import { CreateSchoolAdminDto } from '../types/auth';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

const COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-blue-100 text-blue-800',
  'bg-amber-100 text-amber-800',
  'bg-purple-100 text-purple-800',
  'bg-rose-100 text-rose-800',
  'bg-cyan-100 text-cyan-800',
  'bg-indigo-100 text-indigo-800',
];
function avatarColor(name: string) {
  return COLORS[(name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % COLORS.length];
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<SchoolUserDto[]>([]);
  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SchoolUserDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      if (selectedUser?.id === userId) setDrawerOpen(false);
      await loadData();
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Unique schools represented in the user list
  const schoolsCovered = new Set(users.map((u) => u.schoolCode).filter(Boolean)).size;

  const columns: ColumnDef<SchoolUserDto>[] = [
    {
      key: 'name',
      header: 'ADMIN NAME',
      sortable: true,
      render: (row) => {
        const fullName = `${row.firstname || ''} ${row.lastname || ''}`.trim() || 'Unknown';
        const initials = `${row.firstname?.charAt(0) || ''}${row.lastname?.charAt(0) || ''}`.toUpperCase() || 'U';
        const color = avatarColor(fullName);
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${color}`}
            >
              {initials}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{fullName}</p>
              <p className="text-[11px] text-slate-400">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'schoolCode',
      header: 'ASSIGNED SCHOOL',
      sortable: true,
      render: (row) => {
        const school = schools.find((s) => s.code === row.schoolCode);
        return (
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-800">{school?.name || row.schoolCode || 'Global'}</p>
              {school && <p className="text-[10px] text-slate-400 font-mono">{school.code}</p>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'DATE CREATED',
      render: (row) => (
        <span className="text-xs text-slate-500">{(row as any).createdAt || '—'}</span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'LAST LOGIN',
      render: (row) => (
        <div>
          <p className="text-xs text-slate-700">{(row as any).lastLogin || 'Never'}</p>
          <p className="text-[10px] text-slate-400">{(row as any).isOnline ? '• Online' : ''}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedUser(row);
              setDrawerOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setUserToDelete(row);
              setDeleteError(null);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            School Administrators
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage institutional access and oversee administrative roles across the campus network.
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1b5e52] hover:bg-[#144a3f] rounded-xl transition-colors shadow-xs font-heading cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create School Admin</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Total Admins</p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              {loading ? '...' : users.length > 0 ? '+0%' : '—'}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{loading ? '—' : users.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Active Today</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">—</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Schools Covered</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{loading ? '—' : schoolsCovered}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Verified Status</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {loading || users.length === 0 ? '—' : '100%'}
          </p>
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

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Administrator List</h3>
            <span className="inline-flex items-center text-[11px] text-slate-500 bg-slate-100 rounded-full px-2 py-0.5 mt-0.5">
              {loading ? '...' : users.length} Found
            </span>
          </div>
        </div>
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
        {!loading && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing 1–{users.length} of {users.length} results
          </div>
        )}
      </div>

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
        footerActions={
          selectedUser && (
            <button
              onClick={() => {
                setUserToDelete(selectedUser);
                setDeleteError(null);
                setDeleteModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
            >
              Revoke Access
            </button>
          )
        }
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
