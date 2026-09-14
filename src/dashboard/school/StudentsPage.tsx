import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  RefreshCw,
  Copy,
  Check,
  Search,
  Wallet,
} from 'lucide-react';
import { schoolAdminApi } from '../api/schoolAdminApi';
import { StudentDto } from '../types/student';
import { DataTable, ColumnDef } from '../components/DataTable';
import { DetailDrawer } from '../components/DetailDrawer';
import { ErrorState } from '../components/ErrorState';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolAdminApi.getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to retrieve students from backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleCopyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const columns: ColumnDef<StudentDto>[] = [
    {
      key: 'name',
      header: 'Student Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
            {row.firstname?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.firstname} {row.lastname}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'matricNumber',
      header: 'Matriculation No.',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          {row.matricNumber || '—'}
        </span>
      ),
    },
    {
      key: 'walletNumber',
      header: 'Wallet Number',
      render: (row) => (
        <span className="font-mono text-xs text-emerald-800 font-semibold">
          {row.walletNumber || '—'}
        </span>
      ),
    },
    {
      key: 'schoolCode',
      header: 'Institution',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.schoolCode}
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
            Enrolled Students
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified campus students registered with your institution code
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStudents}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Students Service Notice"
          message={error}
          onRetry={loadStudents}
          retrying={loading}
        />
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        searchPlaceholder="Search students by name, matric number, or email..."
        searchKey={(s) => `${s.firstname} ${s.lastname} ${s.matricNumber} ${s.email} ${s.walletNumber}`}
        emptyTitle="No Students Enrolled"
        emptyDescription="Students registered with your campus code will appear automatically here."
        onRowClick={(row) => {
          setSelectedStudent(row);
          setDrawerOpen(true);
        }}
      />

      {/* Student Detail Drawer */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`${selectedStudent?.firstname} ${selectedStudent?.lastname}`}
        subtitle={`Matric: ${selectedStudent?.matricNumber || '—'}`}
      >
        {selectedStudent && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student Full Name</span>
                <span className="font-bold text-slate-900">
                  {selectedStudent.firstname} {selectedStudent.lastname}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Matriculation Number</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedStudent.matricNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Campus Email</span>
                <span className="text-slate-700">{selectedStudent.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Campus Code</span>
                <span className="font-mono font-bold text-emerald-800">
                  {selectedStudent.schoolCode}
                </span>
              </div>
            </div>

            {/* Wallet Info */}
            <div className="space-y-2">
              <h4 className="font-bold font-heading text-slate-800 text-sm">
                Wallet Assignment
              </h4>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Wallet</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">
                      {selectedStudent.walletNumber}
                    </span>
                    <button
                      onClick={() => handleCopyWallet(selectedStudent.walletNumber)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Copy Wallet Number"
                    >
                      {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
