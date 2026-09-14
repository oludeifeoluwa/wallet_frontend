import React from 'react';
import { CheckCircle2, Clock, XCircle, RotateCcw, ShieldAlert, Lock, Unlock } from 'lucide-react';

interface StatusBadgeProps {
  status: string | boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = typeof status === 'boolean'
    ? (status ? 'Active' : 'Pending')
    : (status || 'Unknown').toString().trim();

  const lower = normalized.toLowerCase();
  const py = size === 'sm' ? 'py-0.5 px-2 text-xs' : 'py-1 px-2.5 text-xs';

  if (lower === 'successful' || lower === 'success' || lower === 'approved' || lower === 'active') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ${py}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {normalized}
      </span>
    );
  }

  if (lower === 'pending' || lower === 'unapproved' || lower === 'processing') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ${py}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        {normalized}
      </span>
    );
  }

  if (lower === 'failed' || lower === 'rejected' || lower === 'inactive' || lower === 'declined') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 ${py}`}>
        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        {normalized}
      </span>
    );
  }

  if (lower === 'reversed' || lower === 'refunded') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 ${py}`}>
        <RotateCcw className="w-3.5 h-3.5 text-purple-600 shrink-0" />
        {normalized}
      </span>
    );
  }

  if (lower === 'locked') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-50 text-red-700 ring-1 ring-red-600/20 ${py}`}>
        <Lock className="w-3.5 h-3.5 text-red-600 shrink-0" />
        Locked
      </span>
    );
  }

  if (lower === 'unlocked') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 ${py}`}>
        <Unlock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        Unlocked
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 ${py}`}>
      {normalized}
    </span>
  );
};
