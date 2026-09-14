import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface VolumeBarChartProps {
  data: BarChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  formatValue?: (val: number) => string;
}

export const VolumeBarChart: React.FC<VolumeBarChartProps> = ({
  data,
  title = 'Transaction Volume Activity',
  subtitle = 'System movement overview',
  height = 200,
  formatValue = (val) => `₦${val.toLocaleString()}`,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold font-heading text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-slate-400">
          No activity recorded in this period
        </div>
      ) : (
        <div className="flex items-end gap-2 lg:gap-4 pt-6" style={{ height }}>
          {data.map((item, idx) => {
            const heightPct = Math.round((item.value / maxValue) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="relative w-full flex justify-center items-end h-full">
                  <div
                    style={{ height: `${Math.max(8, heightPct)}%` }}
                    className="w-full max-w-[28px] bg-emerald-600 group-hover:bg-emerald-700 rounded-t-md transition-all duration-300 relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-20 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-md whitespace-nowrap">
                      {formatValue(item.value)}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-700 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface RatioBreakdownProps {
  title: string;
  items: { label: string; value: number; color: string }[];
}

export const RatioBreakdown: React.FC<RatioBreakdownProps> = ({ title, items }) => {
  const total = items.reduce((acc, cur) => acc + cur.value, 0) || 1;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <h3 className="text-sm font-bold font-heading text-slate-800 mb-4">{title}</h3>
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 mb-4">
        {items.map((item, idx) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={idx}
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              className="h-full transition-all duration-500"
              title={`${item.label}: ${item.value} (${pct}%)`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item, idx) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col">
                <span className="text-slate-500 text-[11px]">{item.label}</span>
                <span className="font-bold text-slate-800">
                  {item.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
