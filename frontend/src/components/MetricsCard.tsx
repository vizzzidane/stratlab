import type { Stats } from "../lib/types";

interface MetricsCardProps {
  stats: Stats;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function MetricsCard({ stats }: MetricsCardProps) {
  const metrics = [
    {
      label: "Total Return",
      value: formatPercent(stats.total_returns),
      tone: stats.total_returns >= 0 ? "positive" : "negative",
    },
    {
      label: "Annualized Return",
      value: formatPercent(stats.annualized_return),
      tone: stats.annualized_return >= 0 ? "positive" : "negative",
    },
    { label: "Sharpe", value: formatNumber(stats.sharpe_ratio), tone: "neutral" },
    {
      label: "Max Drawdown",
      value: formatPercent(stats.max_drawdown),
      tone: "negative",
    },
    {
      label: "Win Rate",
      value: formatPercent(stats.win_rate),
      tone: stats.win_rate >= 0.5 ? "positive" : "negative",
    },
    { label: "Trades", value: formatNumber(stats.total_trades), tone: "neutral" },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden border border-zinc-800/80 bg-zinc-800/80 md:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-black px-2.5 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
            {metric.label}
          </p>
          <p
            className={`mt-1 font-mono text-sm font-medium ${
              metric.tone === "positive"
                ? "text-emerald-400"
                : metric.tone === "negative"
                  ? "text-red-400"
                  : "text-zinc-100"
            }`}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}
