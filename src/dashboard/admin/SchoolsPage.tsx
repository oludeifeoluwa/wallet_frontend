import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Copy,
  Check,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { schoolApi } from '../api/schoolApi';
import { SchoolDto, SchoolRequestDto } from '../types/school';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

const COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-blue-100 text-blue-800',
  'bg-amber-100 text-amber-800',
  'bg-purple-100 text-purple-800',
  'bg-rose-100 text-rose-800',
  'bg-cyan-100 text-cyan-800',
];

function colorFor(name: string) {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

export const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDto | null>(null);
  const [editSchoolName, setEditSchoolName] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSchool, setDrawerSchool] = useState<SchoolDto | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [search, setSearch] = useState('');

  const loadSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolApi.getAllSchools();
      setSchools(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve partner schools from the backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const handleAddSchool = async () => {
    if (!newSchoolName.trim() || !newSchoolCode.trim()) {
      setAddError('Both institution name and university code are required.');
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      await schoolApi.createSchool({
        name: newSchoolName.trim(),
        code: newSchoolCode.trim().toUpperCase(),
      });
      setAddModalOpen(false);
      setNewSchoolName('');
      setNewSchoolCode('');
      await loadSchools();
    } catch (err: any) {
      setAddError(err?.message || 'Failed to register school.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateSchool = async () => {
    const schoolId = selectedSchool?.id || selectedSchool?.schoolId;
    if (!schoolId || !editSchoolName.trim()) {
      setEditError('School name is required.');
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      await schoolApi.updateSchool(schoolId, { name: editSchoolName.trim() });
      setEditModalOpen(false);
      setSelectedSchool(null);
      await loadSchools();
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update school.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSchool = async () => {
    const schoolId = selectedSchool?.id || selectedSchool?.schoolId;
    if (!schoolId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await schoolApi.deleteSchool(schoolId);
      setDeleteModalOpen(false);
      setSelectedSchool(null);
      if (drawerSchool?.id === schoolId) setDrawerOpen(false);
      await loadSchools();
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete school from the backend.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filtered = schools.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns: ColumnDef<SchoolDto>[] = [
    {
      key: 'name',
      header: 'SCHOOL NAME',
      sortable: true,
      render: (row) => {
        const init = initials(row.name);
        const color = colorFor(row.name);
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${color}`}
            >
              {init}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{row.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{row.code}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'code',
      header: 'SCHOOL CODE',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      render: () => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Active
        </span>
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
              setSelectedSchool(row);
              setEditSchoolName(row.name);
              setEditError(null);
              setEditModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit School"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedSchool(row);
              setDeleteError(null);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete School"
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
            Schools Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage institutional partners, administrative accounts, and student enrollment metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSchools}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setAddError(null);
              setAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1b5e52] hover:bg-[#144a3f] rounded-xl transition-colors shadow-xs font-heading cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Create School</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Total Schools</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              {loading ? '—' : schools.length.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Active Students</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">—</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Compliance Rate</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              {loading ? '—' : schools.length > 0 ? '100%' : '—'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Schools API Notice"
          message={error}
          onRetry={loadSchools}
          retrying={loading}
        />
      )}

      {/* Search + Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          searchPlaceholder=""
          searchKey={(s) => `${s.name} ${s.code}`}
          emptyTitle="No Partner Schools Registered"
          emptyDescription="Click 'Create School' to onboard your first campus university."
          onRowClick={(row) => {
            setDrawerSchool(row);
            setDrawerOpen(true);
          }}
        />
        {!loading && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing 1–{filtered.length} of {filtered.length} schools
          </div>
        )}
      </div>

      {/* Add School Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Institution"
        description="Add an accredited university to the CampusPay ecosystem."
        confirmLabel="Create School"
        onConfirm={handleAddSchool}
        loading={addLoading}
        error={addError}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institution Official Name
            </label>
            <input
              type="text"
              placeholder="e.g. University of Lagos"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              School Code (Uppercase Acronym)
            </label>
            <input
              type="text"
              placeholder="e.g. UNILAG"
              value={newSchoolCode}
              onChange={(e) => setNewSchoolCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Used by students and merchants to link their accounts during registration.
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit School Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Institution Details"
        description={`Updating official name for ${selectedSchool?.code}`}
        confirmLabel="Save Changes"
        onConfirm={handleUpdateSchool}
        loading={editLoading}
        error={editError}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              value={editSchoolName}
              onChange={(e) => setEditSchoolName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              School Code (Immutable)
            </label>
            <input
              type="text"
              disabled
              value={selectedSchool?.code || ''}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
            />
          </div>
        </div>
      </Modal>

      {/* Delete School Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Partner Institution"
        description={`Are you sure you want to permanently delete "${selectedSchool?.name}" (${selectedSchool?.code})? This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        variant="danger"
        icon="warning"
        onConfirm={handleDeleteSchool}
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerSchool?.name || 'Institution Details'}
        subtitle={`Campus Code: ${drawerSchool?.code || '—'}`}
        footerActions={
          <>
            <button
              onClick={() => {
                if (drawerSchool) {
                  setSelectedSchool(drawerSchool);
                  setEditSchoolName(drawerSchool.name);
                  setEditError(null);
                  setEditModalOpen(true);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              Edit Name
            </button>
            <button
              onClick={() => {
                if (drawerSchool) {
                  setSelectedSchool(drawerSchool);
                  setDeleteError(null);
                  setDeleteModalOpen(true);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
            >
              Delete School
            </button>
          </>
        }
      >
        {drawerSchool && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">School Unique Code</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {drawerSchool.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(drawerSchool.code)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Database ID</span>
                <span className="font-mono text-slate-700 text-[11px]">
                  {drawerSchool.id || drawerSchool.schoolId || 'N/A'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold font-heading text-slate-800 text-sm">
                Institution Administration
              </h4>
              <p className="text-slate-500 leading-relaxed">
                Staff members with the <strong>{drawerSchool.code}</strong> code can log into the
                CampusPay School Portal to manage enrolled students and verify campus merchants.
              </p>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
