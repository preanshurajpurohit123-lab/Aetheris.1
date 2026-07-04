import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChartPoint } from "../types";

interface PerformanceChartProps {
  data: ChartPoint[];
  stockSymbol?: string;
}

export default function PerformanceChart({ data, stockSymbol }: PerformanceChartProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y">("1W");

  // Dynamically slice or scale data points based on selected timeframe for true interactivity
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    switch (timeframe) {
      case "1D":
        // Simulate intra-day hour-by-hour intervals
        return Array.from({ length: 8 }).map((_, i) => {
          const hours = ["9:30 AM", "10:30 AM", "11:30 AM", "12:30 PM", "1:30 PM", "2:30 PM", "3:30 PM", "4:00 PM"];
          const base = data[data.length - 1]?.value || 1242591.42;
          const variance = base * 0.005;
          return {
            date: hours[i],
            value: Number((base - variance + Math.random() * variance * 2).toFixed(2))
          };
        });
      case "1W":
        return data.slice(-7);
      case "1M":
        return data.slice(-30);
      case "1Y":
        // Generate a wider mock span to look perfect
        return Array.from({ length: 12 }).map((_, i) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const base = data[0]?.value || 1000000;
          return {
            date: months[i],
            value: Number((base * (1 + (i * 0.02) + (Math.random() - 0.5) * 0.05)).toFixed(2))
          };
        });
      default:
        return data;
    }
  }, [data, timeframe]);

  // Determine change indicator based on first and last points in the chart view
  const { changeVal, changePercent, isPositive } = useMemo(() => {
    if (processedData.length < 2) return { changeVal: 0, changePercent: 0, isPositive: true };
    const first = processedData[0].value;
    const last = processedData[processedData.length - 1].value;
    const rawDiff = last - first;
    const pct = (rawDiff / first) * 100;
    return {
      changeVal: rawDiff,
      changePercent: pct,
      isPositive: rawDiff >= 0
    };
  }, [processedData]);

  // Format currency values gracefully
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="bg-[#0d111a] border border-[#1e293b] rounded-lg p-5 glowing-shadow" id="performance-chart-container">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              {stockSymbol ? `${stockSymbol} Valuation` : "Performance Analytics"}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan pulse-badge"></span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className="text-2xl font-display font-medium text-white">
              {processedData.length > 0 ? formatCurrency(processedData[processedData.length - 1].value) : "$0.00"}
            </h2>
            <span className={`text-xs font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{changePercent.toFixed(2)}% ({timeframe})
            </span>
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1.5 bg-[#07090e] border border-[#1e293b] p-1 rounded-md self-start md:self-auto">
          {(["1D", "1W", "1M", "1Y"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-mono rounded transition-all duration-200 ${
                timeframe === t
                  ? "bg-brand-blue/15 text-brand-cyan border border-brand-cyan/20 font-medium"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full" id="tradingview-recharts-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4facfe" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#475569"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }}
            />
            <YAxis
              stroke="#475569"
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#07090e] border border-[#334155] p-3 rounded shadow-xl font-mono text-xs">
                      <p className="text-slate-400">{payload[0].payload.date}</p>
                      <p className="text-brand-cyan font-semibold mt-1">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#colorVal)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVal)"
              dot={{ r: 2, stroke: "#00f2fe", strokeWidth: 1, fill: "#0d111a" }}
              activeDot={{ r: 5, stroke: "#00f2fe", strokeWidth: 2, fill: "#ffffff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/40 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-badge"></span>
          <span>Simulation Engine Active</span>
        </div>
        <span>Implied Feed Latency: &lt;12ms</span>
      </div>
    </div>
  );
}
