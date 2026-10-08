import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
        {value}
      </div>

      {(subtitle || change) && (
        <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 mt-2">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {change && (
            <span
              className={`font-medium ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                  ? 'text-rose-600'
                  : 'text-slate-500'
              }`}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
