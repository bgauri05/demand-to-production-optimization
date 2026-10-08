import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface RiskMetric {
  label: string;
  value: string;
  percentile: string;
}

interface RiskSummaryCardProps {
  metrics: RiskMetric[];
}

export const RiskSummaryCard: React.FC<RiskSummaryCardProps> = ({ metrics }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Risk Summary
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monte Carlo quantile service level evaluation (100 scenarios)
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5" />
          <span>Confidence Interval</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((item) => (
          <div
            key={item.percentile}
            className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>{item.label}</span>
              <span className="font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                {item.percentile}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {item.value}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  item.percentile === 'P10'
                    ? 'bg-amber-500'
                    : item.percentile === 'P50'
                    ? 'bg-blue-600'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${parseFloat(item.value)}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
