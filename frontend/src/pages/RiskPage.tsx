import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { KPICard } from "../components/KPICard";
import { ShieldCheck, Target, AlertTriangle, TrendingUp, Sparkles, Layers } from "lucide-react";

export interface RiskRecord {
    Strategy: string;
    "P10 Service Level": number;
    "Median Service Level": number;
    "P90 Service Level": number;
    "Average Stockout": number;
    "Average Service Level"?: number;
    "Worst Service Level"?: number;
    "Best Service Level"?: number;
    "Average Final Inventory"?: number;
}

export function RiskPage() {
    const [riskData, setRiskData] = useState<RiskRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/risk`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Risk data received:", data);
                setRiskData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching risk data:", error);
                setIsLoading(false);
            });
    }, []);

    // Primary strategy to highlight in KPIs (Q50 Optimized or first record)
    const primaryStrategy =
        riskData.find((r) => r.Strategy.includes("Q50")) || riskData[0];

    // Helper functions to format values
    const formatPct = (val?: number) => {
        if (val === undefined || val === null) return "N/A";
        // If value is fraction <= 1, convert to percentage
        const pct = val <= 1.0 ? val * 100 : val;
        return `${pct.toFixed(2)}%`;
    };

    const formatNum = (val?: number) => {
        if (val === undefined || val === null) return "N/A";
        return Math.round(val).toLocaleString();
    };

    // Recharts Data Mapping: Service Level Quantiles per Strategy
    const chartData = riskData.map((row) => {
        const p10 = row["P10 Service Level"] <= 1.0 ? row["P10 Service Level"] * 100 : row["P10 Service Level"];
        const p50 = row["Median Service Level"] <= 1.0 ? row["Median Service Level"] * 100 : row["Median Service Level"];
        const p90 = row["P90 Service Level"] <= 1.0 ? row["P90 Service Level"] * 100 : row["P90 Service Level"];
        const avg = row["Average Service Level"] !== undefined
            ? (row["Average Service Level"] <= 1.0 ? row["Average Service Level"] * 100 : row["Average Service Level"])
            : p50;

        return {
            strategy: row.Strategy,
            "P10 Service Level": Math.round(p10 * 100) / 100,
            "P50 (Median)": Math.round(p50 * 100) / 100,
            "P90 Service Level": Math.round(p90 * 100) / 100,
            "Average Service Level": Math.round(avg * 100) / 100,
        };
    });

    // Dynamic Interpretation Logic based on real data
    const bestStrategy = [...riskData].sort((a, b) => {
        const aAvg = a["Average Service Level"] || a["Median Service Level"];
        const bAvg = b["Average Service Level"] || b["Median Service Level"];
        return bAvg - aAvg;
    })[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Risk Analysis
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 font-medium">
                        How reliable is our production plan when actual demand is uncertain?
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Layers className="w-3.5 h-3.5" />
                        100-Scenario Monte Carlo Simulation
                    </span>
                </div>
            </div>

            {/* 1. KPI Cards (Derived from real API data) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KPICard
                    title="P10 Service Level"
                    value={primaryStrategy ? formatPct(primaryStrategy["P10 Service Level"]) : "N/A"}
                    subtitle="Conservative bound (10th percentile)"
                    icon={<ShieldCheck className="w-5 h-5 text-amber-600" />}
                />
                <KPICard
                    title="P50 Service Level"
                    value={primaryStrategy ? formatPct(primaryStrategy["Median Service Level"]) : "N/A"}
                    subtitle="Expected median service level"
                    icon={<Target className="w-5 h-5 text-blue-600" />}
                />
                <KPICard
                    title="P90 Service Level"
                    value={primaryStrategy ? formatPct(primaryStrategy["P90 Service Level"]) : "N/A"}
                    subtitle="Optimistic bound (90th percentile)"
                    icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
                />
                <KPICard
                    title="Average Service Level"
                    value={
                        primaryStrategy
                            ? formatPct(primaryStrategy["Average Service Level"] || primaryStrategy["Median Service Level"])
                            : "N/A"
                    }
                    subtitle="Mean across all scenarios"
                    icon={<Sparkles className="w-5 h-5 text-indigo-600" />}
                />
                <KPICard
                    title="Average Stockout"
                    value={primaryStrategy ? formatNum(primaryStrategy["Average Stockout"]) : "N/A"}
                    subtitle="Volume stockout risk (units)"
                    icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
                />
            </div>

            {/* 2 & 3. Recharts Chart & Strategy Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Service Level Quantile Distribution Chart */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
                    <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Service Level Quantile Comparison
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                P10, P50, P90, and Average service levels by planning strategy
                            </p>
                        </div>
                        <span className="text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                            Quantiles (%)
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="h-72 flex items-center justify-center text-sm text-slate-500">
                            Loading Monte Carlo risk distribution...
                        </div>
                    ) : riskData.length === 0 ? (
                        <div className="h-72 flex items-center justify-center text-sm text-slate-500">
                            No risk summary records available.
                        </div>
                    ) : (
                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="strategy"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                        domain={[80, 90]}
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
                                        formatter={(val: any) => [`${val}%`]}
                                    />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }} />
                                    <Bar dataKey="P10 Service Level" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                    <Bar dataKey="P50 (Median)" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                    <Bar dataKey="P90 Service Level" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Strategy Comparison Breakdown Table */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                    Strategy Performance Breakdown
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Comparative evaluation across Monte Carlo simulation scenarios
                                </p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-slate-500">Loading risk summary table...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                                            <th className="py-2.5 px-3">Strategy</th>
                                            <th className="py-2.5 px-3 text-right">P10</th>
                                            <th className="py-2.5 px-3 text-right">P50</th>
                                            <th className="py-2.5 px-3 text-right">P90</th>
                                            <th className="py-2.5 px-3 text-right">Avg Stockout</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                                        {riskData.map((row) => (
                                            <tr key={row.Strategy} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-3 font-semibold text-slate-900">{row.Strategy}</td>
                                                <td className="py-3 px-3 text-right text-amber-700 font-mono">{formatPct(row["P10 Service Level"])}</td>
                                                <td className="py-3 px-3 text-right text-blue-700 font-mono font-semibold">{formatPct(row["Median Service Level"])}</td>
                                                <td className="py-3 px-3 text-right text-emerald-700 font-mono">{formatPct(row["P90 Service Level"])}</td>
                                                <td className="py-3 px-3 text-right font-mono text-slate-700">{formatNum(row["Average Stockout"])}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* 4. Plain-English Interpretation Box */}
                    {bestStrategy && (
                        <div className="mt-5 p-4 rounded-lg bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-blue-950">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                Dynamic Strategy Insight
                            </div>
                            <p className="leading-relaxed text-slate-700">
                                <strong className="text-blue-900">{bestStrategy.Strategy}</strong> provides the strongest overall performance in the 100-scenario Monte Carlo evaluation, achieving a median service level of{" "}
                                <strong className="text-blue-900">{formatPct(bestStrategy["Median Service Level"])}</strong> with an average stockout risk of{" "}
                                <strong className="text-blue-900">{formatNum(bestStrategy["Average Stockout"])} units</strong>.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
