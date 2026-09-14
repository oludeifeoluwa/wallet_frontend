import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

const widthMap = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footerActions,
  width = 'lg',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${widthMap[width]} bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 animate-in slide-in-from-right`}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900">{title}</h2>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>

          {/* Optional Footer Actions */}
          {footerActions && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end gap-2.5">
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
