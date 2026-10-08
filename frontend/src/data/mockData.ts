export interface WeeklyForecastData {
  week: string;
  actualDemand: number | null;
  forecast: number;
  lowerBound: number;
  upperBound: number;
  uncertaintyRange: [number, number];
}

export interface ProductionVsDemandData {
  week: string;
  forecastDemand: number;
  plannedProduction: number;
}

export interface KPIMetric {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export const MOCK_KPI_DATA: KPIMetric[] = [
  {
    title: 'Forecast WAPE',
    value: '2.23%',
    subtitle: 'Weighted Abs Percent Error',
    change: '-0.34% vs last cycle',
    changeType: 'positive',
  },
  {
    title: 'Service Level',
    value: '85.15%',
    subtitle: 'On-Time In-Full (OTIF)',
    change: '+1.20% vs target',
    changeType: 'positive',
  },
  {
    title: 'Average Stockout',
    value: '343,720',
    subtitle: 'Estimated volume risk',
    change: '-12,400 units',
    changeType: 'positive',
  },
  {
    title: 'Planning Horizon',
    value: '26 Weeks',
    subtitle: 'Rolling master schedule',
    change: 'Fixed 2-week freeze',
    changeType: 'neutral',
  },
];

export const MOCK_RECOMMENDATION = {
  title: 'Recommended Strategy',
  value: 'Q50 Optimized Strategy',
  description:
    'Currently performs better than the uncertainty-aware strategy in the 100-scenario Monte Carlo evaluation.',
};

export const MOCK_RISK_SUMMARY = [
  { label: 'P10 Service Level', value: '84.70%', percentile: 'P10' },
  { label: 'P50 Service Level', value: '85.16%', percentile: 'P50' },
  { label: 'P90 Service Level', value: '85.57%', percentile: 'P90' },
];

export const MOCK_WEEKLY_FORECAST: WeeklyForecastData[] = [
  { week: 'W01', actualDemand: 12450, forecast: 12300, lowerBound: 11100, upperBound: 13500, uncertaintyRange: [11100, 13500] },
  { week: 'W02', actualDemand: 13100, forecast: 12950, lowerBound: 11700, upperBound: 14200, uncertaintyRange: [11700, 14200] },
  { week: 'W03', actualDemand: 12800, forecast: 13200, lowerBound: 11900, upperBound: 14500, uncertaintyRange: [11900, 14500] },
  { week: 'W04', actualDemand: 14200, forecast: 14000, lowerBound: 12600, upperBound: 15400, uncertaintyRange: [12600, 15400] },
  { week: 'W05', actualDemand: 13900, forecast: 13850, lowerBound: 12400, upperBound: 15300, uncertaintyRange: [12400, 15300] },
  { week: 'W06', actualDemand: 15100, forecast: 14900, lowerBound: 13400, upperBound: 16400, uncertaintyRange: [13400, 16400] },
  { week: 'W07', actualDemand: 14750, forecast: 14800, lowerBound: 13300, upperBound: 16300, uncertaintyRange: [13300, 16300] },
  { week: 'W08', actualDemand: 15600, forecast: 15400, lowerBound: 13800, upperBound: 17000, uncertaintyRange: [13800, 17000] },
  { week: 'W09', actualDemand: null, forecast: 16100, lowerBound: 14400, upperBound: 17800, uncertaintyRange: [14400, 17800] },
  { week: 'W10', actualDemand: null, forecast: 16800, lowerBound: 15000, upperBound: 18600, uncertaintyRange: [15000, 18600] },
  { week: 'W11', actualDemand: null, forecast: 16300, lowerBound: 14500, upperBound: 18100, uncertaintyRange: [14500, 18100] },
  { week: 'W12', actualDemand: null, forecast: 17200, lowerBound: 15300, upperBound: 19100, uncertaintyRange: [15300, 19100] },
];

export const MOCK_PRODUCTION_VS_DEMAND: ProductionVsDemandData[] = [
  { week: 'W01', forecastDemand: 12300, plannedProduction: 12500 },
  { week: 'W02', forecastDemand: 12950, plannedProduction: 13000 },
  { week: 'W03', forecastDemand: 13200, plannedProduction: 13200 },
  { week: 'W04', forecastDemand: 14000, plannedProduction: 14200 },
  { week: 'W05', forecastDemand: 13850, plannedProduction: 14000 },
  { week: 'W06', forecastDemand: 14900, plannedProduction: 15000 },
  { week: 'W07', forecastDemand: 14800, plannedProduction: 15000 },
  { week: 'W08', forecastDemand: 15400, plannedProduction: 15500 },
  { week: 'W09', forecastDemand: 16100, plannedProduction: 16000 },
  { week: 'W10', forecastDemand: 16800, plannedProduction: 16500 },
  { week: 'W11', forecastDemand: 16300, plannedProduction: 16500 },
  { week: 'W12', forecastDemand: 17200, plannedProduction: 17000 },
];
