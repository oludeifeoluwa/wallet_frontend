import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsUpDown, X } from 'lucide-react';
import { TableSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  searchKey?: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: React.ReactNode;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  onRetry,
  searchPlaceholder = 'Search records...',
  searchKey,
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items to display.',
  actions,
  pageSize: initialPageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      if (typeof searchKey === 'function') {
        return searchKey(row).toLowerCase().includes(term);
      }
      if (typeof searchKey === 'string') {
        const val = row[searchKey];
        return String(val ?? '').toLowerCase().includes(term);
      }
      // General search across all string/number fields
      return Object.values(row).some((val) =>
        String(val ?? '').toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Filter and Actions Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 self-end sm:self-auto">{actions}</div>}
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className="p-4">
          <TableSkeleton rows={pageSize > 5 ? 5 : pageSize} columns={columns.length} />
        </div>
      ) : error ? (
        <div className="p-6">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : sortedData.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title={searchTerm ? 'No matching results' : emptyTitle}
            description={
              searchTerm
                ? `No records found matching "${searchTerm}". Try a different search term.`
                : emptyDescription
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.sortable ? 'cursor-pointer select-none hover:bg-slate-100' : ''
                    } ${col.className || ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ChevronsUpDown
                          className={`w-3.5 h-3.5 ${
                            sortKey === col.key ? 'text-emerald-700 font-bold' : 'text-slate-400'
                          }`}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((row, idx) => (
                <tr
                  key={row.id || row.schoolId || row.walletNumber || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 font-medium text-slate-800 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && !error && sortedData.length > 0 && (
        <div className="py-3 px-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="font-semibold text-slate-700">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </strong>{' '}
              of <strong className="font-semibold text-slate-700">{sortedData.length}</strong> records
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 border border-slate-300 rounded-md bg-white text-xs text-slate-700 outline-none focus:border-emerald-600"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
