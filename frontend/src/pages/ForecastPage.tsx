import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

export interface ForecastRecord {
    date: string;
    item: number;
    actual_demand: number | null;
    q10: number;
    q50: number;
    q90: number;
}

export function ForecastPage() {
    const [forecastData, setForecastData] = useState<ForecastRecord[]>([]);
    const [selectedItem, setSelectedItem] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/forecast`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Forecast data:", data);
                setForecastData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching forecast:", error);
                setIsLoading(false);
            });
    }, []);

    const items = Array.from({ length: 20 }, (_, i) => i + 1);

    const filteredData = forecastData.filter(
        (row) => Number(row.item) === selectedItem
    );

    // Format chart data with bounds for confidence area
    const chartData = filteredData.map((row) => {
        const q10Val = Math.round(Number(row.q10) * 100) / 100;
        const q90Val = Math.round(Number(row.q90) * 100) / 100;
        const q50Val = Math.round(Number(row.q50) * 100) / 100;
        const actualVal =
            row.actual_demand !== undefined && row.actual_demand !== null
                ? Math.round(Number(row.actual_demand) * 100) / 100
                : null;

        return {
            date: row.date,
            actual_demand: actualVal,
            q50: q50Val,
            q10: q10Val,
            q90: q90Val,
            uncertaintyBand: [q10Val, q90Val],
        };
    });

    return (
        <div className="space-y-6">
            {/* Page Header & Item Selector */}
            <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Demand Forecast
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Select an item to analyze forecasted demand and quantile evaluation bounds.
                    </p>
                </div>

                {/* Professional Item Selector Dropdown */}
                <div className="flex items-center gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-xs">
                    <label
                        htmlFor="item-select"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                    >
                        Select Item:
                    </label>
                    <select
                        id="item-select"
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(Number(e.target.value))}
                        className="bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                    >
                        {items.map((itemNum) => (
                            <option key={itemNum} value={itemNum}>
                                Item {itemNum}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Status Information Bar */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">
                    Forecast records loaded: <span className="font-bold text-slate-900">{forecastData.length}</span>
                </p>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 self-start sm:self-auto">
                    <span>Showing {filteredData.length} weeks for Item {selectedItem}</span>
                </div>
            </div>

            {/* Demand Forecast Chart */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                            Demand Forecast — Item {selectedItem}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Weekly actual demand vs Q50 forecast with Q10–Q90 uncertainty interval
                        </p>
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-600 px-3 py-1 rounded-md border border-slate-200">
                        Quantile Model
                    </span>
                </div>

                {isLoading ? (
                    <div className="h-80 flex items-center justify-center text-sm font-medium text-slate-500">
                        Loading forecast dataset...
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center text-center p-6">
                        <p className="text-sm font-medium text-slate-600">
                            No forecast data available for this item.
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-80 sm:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={chartData}
                                margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#e2e8f0' }}
                                    domain={['auto', 'auto']}
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
                                        value !== null && value !== undefined
                                            ? Number(value).toLocaleString()
                                            : 'N/A',
                                    ]}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
                                />
                                {/* Shaded Q10–Q90 Uncertainty Area Band */}
                                <Area
                                    type="monotone"
                                    dataKey="uncertaintyBand"
                                    stroke="none"
                                    fill="#93c5fd"
                                    fillOpacity={0.25}
                                    name="Q10–Q90 Confidence Interval"
                                />
                                {/* Q90 Upper Bound Line */}
                                <Line
                                    type="monotone"
                                    dataKey="q90"
                                    stroke="#60a5fa"
                                    strokeDasharray="4 4"
                                    strokeWidth={1.5}
                                    dot={false}
                                    name="Q90 Upper Bound"
                                />
                                {/* Q10 Lower Bound Line */}
                                <Line
                                    type="monotone"
                                    dataKey="q10"
                                    stroke="#60a5fa"
                                    strokeDasharray="4 4"
                                    strokeWidth={1.5}
                                    dot={false}
                                    name="Q10 Lower Bound"
                                />
                                {/* Q50 Main Forecast Line */}
                                <Line
                                    type="monotone"
                                    dataKey="q50"
                                    stroke="#2563eb"
                                    strokeWidth={2.5}
                                    dot={{ r: 3, fill: '#2563eb' }}
                                    activeDot={{ r: 5 }}
                                    name="Q50 Forecast"
                                />
                                {/* Actual Demand Line */}
                                <Line
                                    type="monotone"
                                    dataKey="actual_demand"
                                    stroke="#059669"
                                    strokeWidth={2.5}
                                    dot={{ r: 3.5, fill: '#059669' }}
                                    activeDot={{ r: 5.5 }}
                                    connectNulls={false}
                                    name="Actual Demand"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}