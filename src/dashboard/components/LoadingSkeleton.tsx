import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-10 bg-slate-100 rounded-t-xl mb-1 flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3.5 bg-slate-200 rounded-sm flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="h-14 border-b border-slate-100 flex items-center px-4 gap-4"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-4 bg-slate-200/70 rounded-sm flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-32 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-20" />
    </div>
  );
};
