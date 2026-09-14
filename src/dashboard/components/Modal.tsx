import React, { useEffect } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  loading?: boolean;
  variant?: 'danger' | 'primary';
  icon?: 'warning' | 'info';
  error?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  variant = 'primary',
  icon,
  error = null,
  size = 'sm',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={() => !loading && onClose()}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className={`w-full ${sizeMap[size]} bg-white rounded-2xl shadow-2xl overflow-hidden z-10 transform transition-all animate-in zoom-in-95`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between">
            <div className="flex items-start gap-3">
              {icon === 'warning' && (
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {icon === 'info' && (
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">{title}</h3>
                {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
              </div>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {error}
              </div>
            )}
            {children}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5 ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {loading && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
