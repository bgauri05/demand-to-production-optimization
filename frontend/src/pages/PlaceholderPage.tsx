import React from 'react';
import { Clock, Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>

      {/* Under Development Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto shadow-xs my-8">
        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
          <Construction className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">
          {title} Module Under Development
        </h2>

        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          This planning module is scheduled for full backend API integration and interactive analytics in the next iteration.
        </p>

        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Status: Under Active Development</span>
        </div>
      </div>
    </div>
  );
};
