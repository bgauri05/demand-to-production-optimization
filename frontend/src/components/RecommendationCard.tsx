import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface RecommendationCardProps {
  title: string;
  value: string;
  description: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  value,
  description,
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/90 to-slate-900 border border-blue-800/60 rounded-xl p-5 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            {title}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Validated Strategy
        </span>
      </div>

      <div className="text-xl font-bold tracking-tight text-white mb-1.5">
        {value}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
        {description}
      </p>
    </div>
  );
};
