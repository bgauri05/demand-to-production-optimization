import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    AreaChart,
    Area,
} from "recharts";
import { KPICard } from "../components/KPICard";
import { Factory, TrendingUp, Warehouse, ShieldAlert } from "lucide-react";

export interface ProductionRecord {
    date: string;
    item: number;
    forecast_demand: number;
    production: number;
    inventory: number;
    backlog: number;
}

export function ProductionPage() {
    const [productionData, setProductionData] = useState<ProductionRecord[]>([]);
    const [selectedItem, setSelectedItem] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/production`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Production data received:", data);
                setProductionData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching production data:", error);
                setIsLoading(false);
            });
    }, []);

    const items = Array.from({ length: 20 }, (_, i) => i + 1);

    const filteredData = productionData.filter(
        (row) => Number(row.item) === selectedItem
    );

    // Calculate KPIs dynamically from filteredData
    const totalProduction = filteredData.reduce(
        (acc, r) => acc + Number(r.production || 0),
        0
    );
    const totalDemand = filteredData.reduce(
        (acc, r) => acc + Number(r.forecast_demand || 0),
        0
    );
    const totalInventory = filteredData.reduce(
        (acc, r) => acc + Number(r.inventory || 0),
        0
    );
    const totalBacklog = filteredData.reduce(
        (acc, r) => acc + Number(r.backlog || 0),
        0
    );

    // Format chart data
    const chartData = filteredData.map((row) => ({
        date: row.date,
        forecast_demand: Math.round(Number(row.forecast_demand) * 100) / 100,
        production: Math.round(Number(row.production) * 100) / 100,
        inventory: Math.round(Number(row.inventory) * 100) / 100,
        backlog: Math.round(Number(row.backlog) * 100) / 100,
    }));

    return (
        <div className="space-y-6">
            {/* Header & Item Selector */}
            <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Production Plan
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Master Production Schedule (MPS) capacity allocation, demand alignment, and inventory/backlog trajectory.
                    </p>
                </div>

                {/* Professional Item Selector Dropdown */}
                <div className="flex items-center gap-3 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 shadow-xs">
                    <label
                        htmlFor="production-item-select"
                        className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                    >
                        Select Item:
                    </label>
                    <select
                        id="production-item-select"
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

            {/* Status Bar */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">
                    Production records loaded:{" "}
                    <span className="font-bold text-slate-900">{productionData.length}</span>
                </p>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-700 self-start sm:self-auto">
                    <span>Showing {filteredData.length} weeks for Item {selectedItem}</span>
                </div>
            </div>

            {/* A. KPI Cards (Calculated from filteredData) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Planned Production"
                    value={Math.round(totalProduction).toLocaleString()}
                    subtitle="26-week aggregate volume"
                    icon={<Factory className="w-5 h-5 text-blue-600" />}
                />
                <KPICard
                    title="Total Forecast Demand"
                    value={Math.round(totalDemand).toLocaleString()}
                    subtitle="Baseline forecasted demand"
                    icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                />
                <KPICard
                    title="Total Inventory On-Hand"
                    value={Math.round(totalInventory).toLocaleString()}
                    subtitle="Cumulative stock volume"
                    icon={<Warehouse className="w-5 h-5 text-indigo-600" />}
                />
                <KPICard
                    title="Total Backlog Risk"
                    value={Math.round(totalBacklog).toLocaleString()}
                    subtitle="Unfulfilled demand volume"
                    icon={<ShieldAlert className="w-5 h-5 text-amber-600" />}
                />
            </div>

            {/* B & C. Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Production vs Demand */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Planned Production vs Forecast Demand
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Weekly production alignment for Item {selectedItem}
                            </p>
                        </div>
                        <span className="text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                            Weekly MPS
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="h-72 flex items-center justify-center text-sm text-slate-500">
                            Loading schedule...
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="h-72 flex items-center justify-center text-sm text-slate-500">
                            No production data available for this item.
                        </div>
                    ) : (
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        domain={["auto", "auto"]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            borderColor: "#334155",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                            color: "#f8fafc",
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        }}
                                        formatter={(value: any) => [
                                            Number(value).toLocaleString() + " units",
                                        ]}
                                    />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }} />
                                    <Bar dataKey="forecast_demand" name="Forecast Demand" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={24} />
                                    <Line type="monotone" dataKey="production" name="Planned Production" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Chart 2: Inventory & Backlog */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Inventory & Backlog Trajectory
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Weekly ending stock level vs unfulfilled demand risk
                            </p>
                        </div>
                        <span className="text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                            Stock Balance
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="h-72 flex items-center justify-center text-sm text-slate-500">
                            Loading inventory levels...
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="h-72 flex items-center justify-center text-sm text-slate-500">
                            No production data available for this item.
                        </div>
                    ) : (
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        domain={["auto", "auto"]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            borderColor: "#334155",
                                            borderRadius: "8px",
                                            fontSize: "12px",
                                            color: "#f8fafc",
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        }}
                                        formatter={(value: any) => [
                                            Number(value).toLocaleString() + " units",
                                        ]}
                                    />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }} />
                                    <Area type="monotone" dataKey="inventory" name="Inventory" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                                    <Area type="monotone" dataKey="backlog" name="Backlog" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            {/* D. Weekly Production Schedule Table */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">
                            Weekly Production Schedule — Item {selectedItem}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Detailed weekly record breakdown from optimized master plan
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading schedule records...</div>
                ) : filteredData.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No records found for Item {selectedItem}.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                                    <th className="py-3 px-4">Date / Week</th>
                                    <th className="py-3 px-4">Forecast Demand</th>
                                    <th className="py-3 px-4">Planned Production</th>
                                    <th className="py-3 px-4">Ending Inventory</th>
                                    <th className="py-3 px-4">Backlog</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                                {filteredData.map((row, idx) => (
                                    <tr key={row.date || idx} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{row.date}</td>
                                        <td className="py-2.5 px-4">{Math.round(row.forecast_demand).toLocaleString()}</td>
                                        <td className="py-2.5 px-4 font-semibold text-blue-700">{Math.round(row.production).toLocaleString()}</td>
                                        <td className="py-2.5 px-4 text-emerald-700">{Math.round(row.inventory).toLocaleString()}</td>
                                        <td className="py-2.5 px-4 text-amber-700">{Math.round(row.backlog).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
