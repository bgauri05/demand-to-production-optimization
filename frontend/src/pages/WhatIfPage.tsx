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
import { Sliders, Play, ArrowUp, ArrowDown, Minus, DollarSign, Activity, AlertTriangle, Warehouse, Factory } from "lucide-react";

export interface MetricSet {
    service_level: number;
    stockout: number;
    inventory: number;
    production: number;
    total_cost: number;
}

export interface ScenarioResponse {
    baseline: MetricSet;
    scenario: MetricSet;
}

export function WhatIfPage() {
    // Slider state (% represented as whole numbers -20 to 20, etc.)
    const [demandChange, setDemandChange] = useState<number>(0);
    const [capacityChange, setCapacityChange] = useState<number>(0);
    const [safetyStockChange, setSafetyStockChange] = useState<number>(0);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ScenarioResponse | null>(null);

    const runScenario = (d = demandChange, c = capacityChange, s = safetyStockChange) => {
        setIsLoading(true);
        setError(null);

        fetch(`${API_BASE_URL}/what-if`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                demand_change: d / 100,
                capacity_change: c / 100,
                safety_stock_change: s / 100,
            }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data: ScenarioResponse) => {
                console.log("Scenario response:", data);
                setResult(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Scenario error:", err);
                setError("Failed to calculate scenario. Please check backend connection.");
                setIsLoading(false);
            });
    };

    // Run baseline scenario on component mount
    useEffect(() => {
        runScenario(0, 0, 0);
    }, []);

    // Formatters for display
    const formatValue = (key: keyof MetricSet, val: number) => {
        if (key === "service_level") {
            return `${val.toFixed(1)}%`;
        }
        if (key === "total_cost") {
            if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
            return `$${Math.round(val).toLocaleString()}`;
        }
        if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return Math.round(val).toLocaleString();
    };

    const getDirection = (base: number, scen: number, key: keyof MetricSet) => {
        const diff = scen - base;
        if (Math.abs(diff) < 0.001) {
            return { arrow: <Minus className="w-3.5 h-3.5" />, text: "0%", color: "text-slate-400", isDesirable: true };
        }
        const pctDiff = ((diff / Math.abs(base)) * 100).toFixed(1);

        // Service level higher is better; Stockout/Cost lower is better
        let isDesirable = false;
        if (key === "service_level" || key === "production" || key === "inventory") {
            isDesirable = diff > 0;
        } else {
            isDesirable = diff < 0; // stockout, cost
        }

        if (diff > 0) {
            return {
                arrow: <ArrowUp className="w-3.5 h-3.5" />,
                text: `+${pctDiff}%`,
                color: isDesirable ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-rose-600 bg-rose-50 border-rose-200",
                isDesirable,
            };
        } else {
            return {
                arrow: <ArrowDown className="w-3.5 h-3.5" />,
                text: `${pctDiff}%`,
                color: isDesirable ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-rose-600 bg-rose-50 border-rose-200",
                isDesirable,
            };
        }
    };

    // Recharts Data Mapping
    const chartData = result
        ? [
            {
                name: "Service Level (%)",
                Baseline: result.baseline.service_level,
                Scenario: result.scenario.service_level,
            },
            {
                name: "Stockout (10k units)",
                Baseline: Math.round(result.baseline.stockout / 10000),
                Scenario: Math.round(result.scenario.stockout / 10000),
            },
            {
                name: "Production (100k units)",
                Baseline: Math.round(result.baseline.production / 100000),
                Scenario: Math.round(result.scenario.production / 100000),
            },
            {
                name: "Total Cost ($M)",
                Baseline: Math.round((result.baseline.total_cost / 1000000) * 10) / 10,
                Scenario: Math.round((result.scenario.total_cost / 1000000) * 10) / 10,
            },
        ]
        : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
                    <Sliders className="w-4 h-4" />
                    <span>Interactive Scenario Simulator</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    What-If Simulator
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Test how changes in demand, production capacity, and safety stock affect the production plan.
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => runScenario()}
                        className="text-xs font-bold underline cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Controls & Scenario Inputs */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        Adjust Planning Assumptions
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">
                        Real-time simulation engine
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Control 1: Demand Change */}
                    <div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-lg p-4">
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700 flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-blue-600" />
                                Demand Change
                            </span>
                            <span className={`font-mono text-sm px-2 py-0.5 rounded font-bold ${demandChange > 0 ? "text-emerald-700 bg-emerald-100" : demandChange < 0 ? "text-rose-700 bg-rose-100" : "text-slate-700 bg-slate-200"}`}>
                                {demandChange > 0 ? `+${demandChange}%` : `${demandChange}%`}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-20"
                            max="20"
                            step="1"
                            value={demandChange}
                            onChange={(e) => setDemandChange(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>-20%</span>
                            <span>0%</span>
                            <span>+20%</span>
                        </div>
                    </div>

                    {/* Control 2: Production Capacity Change */}
                    <div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-lg p-4">
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700 flex items-center gap-1.5">
                                <Factory className="w-3.5 h-3.5 text-indigo-600" />
                                Production Capacity
                            </span>
                            <span className={`font-mono text-sm px-2 py-0.5 rounded font-bold ${capacityChange > 0 ? "text-emerald-700 bg-emerald-100" : capacityChange < 0 ? "text-rose-700 bg-rose-100" : "text-slate-700 bg-slate-200"}`}>
                                {capacityChange > 0 ? `+${capacityChange}%` : `${capacityChange}%`}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-20"
                            max="20"
                            step="1"
                            value={capacityChange}
                            onChange={(e) => setCapacityChange(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>-20%</span>
                            <span>0%</span>
                            <span>+20%</span>
                        </div>
                    </div>

                    {/* Control 3: Safety Stock Change */}
                    <div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-lg p-4">
                        <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700 flex items-center gap-1.5">
                                <Warehouse className="w-3.5 h-3.5 text-teal-600" />
                                Safety Stock Buffer
                            </span>
                            <span className="font-mono text-sm px-2 py-0.5 rounded font-bold text-teal-700 bg-teal-100">
                                {safetyStockChange > 0 ? `+${safetyStockChange}%` : `${safetyStockChange}%`}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={safetyStockChange}
                            onChange={(e) => setSafetyStockChange(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>0%</span>
                            <span>+15%</span>
                            <span>+30%</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-2">
                    <button
                        onClick={() => runScenario()}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? (
                            <span>Calculating Scenario...</span>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-white" />
                                <span>Run Scenario</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Results Comparison Grid */}
            {result && (
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                    Baseline vs Scenario Results
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Direct impact comparison across key performance metrics
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold">
                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    Baseline
                                </span>
                                <span className="text-slate-400">vs</span>
                                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                    Scenario
                                </span>
                            </div>
                        </div>

                        {/* Metric Comparison Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {(
                                [
                                    { key: "service_level", name: "Service Level", icon: <Activity className="w-4 h-4 text-blue-600" /> },
                                    { key: "stockout", name: "Stockout Volume", icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> },
                                    { key: "inventory", name: "On-Hand Inventory", icon: <Warehouse className="w-4 h-4 text-teal-600" /> },
                                    { key: "production", name: "Planned Production", icon: <Factory className="w-4 h-4 text-indigo-600" /> },
                                    { key: "total_cost", name: "Total Cost", icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
                                ] as const
                            ).map((item) => {
                                const baseVal = result.baseline[item.key];
                                const scenVal = result.scenario[item.key];
                                const dir = getDirection(baseVal, scenVal, item.key);

                                return (
                                    <div
                                        key={item.key}
                                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
                                    >
                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                                            <span className="flex items-center gap-1.5">{item.icon} {item.name}</span>
                                        </div>

                                        <div className="flex items-baseline justify-between gap-1">
                                            <div className="text-xs text-slate-400 font-mono">
                                                {formatValue(item.key, baseVal)}
                                            </div>
                                            <div className="text-slate-400 text-xs">→</div>
                                            <div className="text-base font-bold text-slate-900 font-mono">
                                                {formatValue(item.key, scenVal)}
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold border ${dir.color}`}>
                                                {dir.arrow}
                                                <span>{dir.text}</span>
                                            </span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                                Delta
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comparison Chart */}
                    <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-xs">
                        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                    Baseline vs Scenario Metrics Comparison
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Normalized comparison of baseline vs scenario metrics
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                        tickLine={false}
                                        axisLine={{ stroke: "#e2e8f0" }}
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
                                    />
                                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "12px", paddingBottom: "10px" }} />
                                    <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    <Bar dataKey="Scenario" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
