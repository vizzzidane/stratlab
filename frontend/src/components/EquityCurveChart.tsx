import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "../lib/types";

interface EquityCurveChartProps {
  data: ChartDataPoint[];
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatAxisValue(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }

  return value.toFixed(0);
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  return (
    <div className="overflow-hidden border border-zinc-800/80 bg-black">
      <div className="flex flex-col gap-2 border-b border-zinc-800/80 px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Equity Curve
        </h3>
        <div className="flex items-center gap-4 font-mono text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 bg-cyan-400" />
            Strategy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 bg-zinc-500" />
            Buy &amp; Hold
          </span>
        </div>
      </div>

      <div className="h-64 px-2 py-3">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              stroke="#27272a"
              strokeDasharray="2 4"
              strokeOpacity={0.45}
              vertical={false}
            />
            <XAxis
              axisLine={{ stroke: "#27272a" }}
              dataKey="date"
              minTickGap={32}
              tick={{ fill: "#71717a", fontSize: 12, fontFamily: "monospace" }}
              tickLine={false}
            />
            <YAxis
              axisLine={{ stroke: "#27272a" }}
              tick={{ fill: "#71717a", fontSize: 12, fontFamily: "monospace" }}
              tickFormatter={formatAxisValue}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#09090b",
                border: "1px solid #3f3f46",
                borderRadius: 0,
                color: "#e4e4e7",
                fontFamily: "monospace",
                fontSize: 12,
                padding: "6px 8px",
              }}
              formatter={(value, name) => [
                typeof value === "number" ? formatCurrency(value) : String(value),
                name === "strategy" ? "Strategy" : "Buy & Hold",
              ]}
              labelStyle={{
                color: "#a1a1aa",
                fontFamily: "monospace",
                fontSize: 12,
                marginBottom: 4,
              }}
            />
            <Line
              dataKey="strategy"
              dot={false}
              isAnimationActive={false}
              name="Strategy"
              stroke="#22d3ee"
              strokeWidth={1.5}
              type="monotone"
            />
            <Line
              dataKey="buy_hold"
              dot={false}
              isAnimationActive={false}
              name="Buy & Hold"
              stroke="#71717a"
              strokeWidth={1.25}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
