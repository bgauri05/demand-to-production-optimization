import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { RecommendationCard } from '../components/RecommendationCard';
import { RiskSummaryCard } from '../components/RiskSummaryCard';
import {
  MOCK_KPI_DATA,
  MOCK_RECOMMENDATION,
  MOCK_RISK_SUMMARY,
  MOCK_WEEKLY_FORECAST,
  MOCK_PRODUCTION_VS_DEMAND,
} from '../data/mockData';
import { Activity, Target, ShieldAlert, Calendar } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const getKpiIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Activity className="w-5 h-5" />;
      case 1:
        return <Target className="w-5 h-5" />;
      case 2:
        return <ShieldAlert className="w-5 h-5" />;
      case 3:
        return <Calendar className="w-5 h-5" />;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-6">
      {/* A. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Demand-to-Production Planner
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Forecast demand, optimize production, and evaluate planning risk.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            System Calibrated
          </span>
        </div>
      </div>

      {/* B. KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_KPI_DATA.map((kpi, idx) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={getKpiIcon(idx)}
          />
        ))}
      </div>

      {/* C. Recommendation Card */}
      <RecommendationCard
        title={MOCK_RECOMMENDATION.title}
        value={MOCK_RECOMMENDATION.value}
        description={MOCK_RECOMMENDATION.description}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. Forecast Chart */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                Demand Forecast & Uncertainty Bounds
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekly actual demand vs model forecast with 90% confidence interval
              </p>
            </div>
            <span className="text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
              12 Weeks
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={MOCK_WEEKLY_FORECAST}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[10000, 20000]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                  formatter={(value: any) => [value ? Number(value).toLocaleString() : 'N/A']}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                {/* Confidence Bound Area */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="#93c5fd"
                  fillOpacity={0.25}
                  name="Upper Bound"
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1.0}
                  name="Lower Bound"
                />

                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="#93c5fd"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  name="Upper Bound (Line)"
                />
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="#93c5fd"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  name="Lower Bound (Line)"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 5 }}
                  name="Forecast"
                />
                <Line
                  type="monotone"
                  dataKey="actualDemand"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#059669' }}
                  connectNulls={false}
                  name="Actual Demand"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* E. Production vs Demand Chart */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                Production vs Forecast Demand
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekly target production aligned against baseline demand forecast
              </p>
            </div>
            <span className="text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
              Capacity Alignment
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOCK_PRODUCTION_VS_DEMAND}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[10000, 20000]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  }}
                  formatter={(value: any) => [
                    Number(value).toLocaleString() + ' units',
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar
                  dataKey="forecastDemand"
                  name="Forecast Demand"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="plannedProduction"
                  name="Planned Production"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* F. Risk Summary Section */}
      <RiskSummaryCard metrics={MOCK_RISK_SUMMARY} />
    </div>
  );
};
