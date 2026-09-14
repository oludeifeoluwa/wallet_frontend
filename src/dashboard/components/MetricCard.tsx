import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  loading?: boolean;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  onClick?: () => void;
}

const colorMap = {
  emerald: {
    iconBg: 'bg-emerald-100 text-emerald-800',
    border: 'border-emerald-100 hover:border-emerald-200',
  },
  amber: {
    iconBg: 'bg-amber-100 text-amber-800',
    border: 'border-amber-100 hover:border-amber-200',
  },
  blue: {
    iconBg: 'bg-blue-100 text-blue-800',
    border: 'border-blue-100 hover:border-blue-200',
  },
  purple: {
    iconBg: 'bg-purple-100 text-purple-800',
    border: 'border-purple-100 hover:border-purple-200',
  },
  slate: {
    iconBg: 'bg-slate-100 text-slate-800',
    border: 'border-slate-200 hover:border-slate-300',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  subtitle,
  loading = false,
  color = 'slate',
  onClick,
}) => {
  const c = colorMap[color] || colorMap.slate;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-slate-200 rounded-md w-24" />
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-8 bg-slate-200 rounded-md w-36 mb-2" />
        <div className="h-3 bg-slate-200 rounded-md w-28" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-2xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="text-2xl lg:text-3xl font-bold font-heading text-slate-900 tracking-tight">
        {value}
      </div>

      {(change || subtitle) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
