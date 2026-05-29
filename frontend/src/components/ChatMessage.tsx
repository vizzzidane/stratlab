import type { TranscriptMessage } from "../lib/types";
import { ChartTable } from "./ChartTable";
import { EquityCurveChart } from "./EquityCurveChart";
import { MetricsCard } from "./MetricsCard";

interface ChatMessageProps {
  message: TranscriptMessage;
}

const roleStyles = {
  user: "border-zinc-800/80 bg-zinc-950/40",
  model: "border-zinc-800/80 bg-zinc-950",
  error: "border-red-900/70 bg-red-950/20",
};

const roleLabels = {
  user: "Request",
  model: "Experiment Result",
  error: "Error",
};

function formatPercent(value: number | undefined): string {
  if (typeof value !== "number") {
    return "-";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number | undefined): string {
  if (typeof value !== "number") {
    return "-";
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isResult = message.role === "model" && message.result;
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const diagnostics = message.result
    ? [
        { label: "total_days", value: formatNumber(message.result.stats.total_days) },
        {
          label: "strategy_vol",
          value: formatPercent(message.result.stats.strategy_volatility),
        },
        {
          label: "buy_hold_return",
          value: formatPercent(message.result.stats.buy_hold_returns),
        },
        {
          label: "buy_hold_max_dd",
          value: formatPercent(message.result.stats.buy_hold_max_drawdown),
        },
      ]
    : [];

  return (
    <article className={`border ${isResult ? "p-0" : isUser ? "p-2" : "p-3"} ${roleStyles[message.role]}`}>
      <div
        className={`flex items-center justify-between gap-3 ${
          isResult ? "border-b border-zinc-800/80 px-2.5 py-1.5" : "mb-1.5"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${
            isError ? "text-red-300" : isResult ? "text-cyan-300" : "text-zinc-500"
          }`}
        >
          {roleLabels[message.role]}
        </p>
        <time className="font-mono text-xs text-zinc-600">{message.createdAt}</time>
      </div>

      <div className={isResult ? "p-2.5" : ""}>
        <p
          className={`whitespace-pre-wrap leading-6 ${
            isUser
              ? "font-mono text-xs leading-5 text-zinc-500"
              : isError
                ? "text-sm text-red-200"
                : "text-sm text-zinc-300"
          }`}
        >
          {message.content}
        </p>

        {message.result ? (
          <div className="mt-2 grid gap-2">
            <MetricsCard stats={message.result.stats} />
            <div className="grid gap-px overflow-hidden border border-zinc-800/80 bg-zinc-800/80 sm:grid-cols-2 xl:grid-cols-4">
              {diagnostics.map((item) => (
                <div
                  className="flex items-center justify-between gap-3 bg-black px-2.5 py-1.5 font-mono text-xs"
                  key={item.label}
                >
                  <span className="uppercase tracking-wide text-zinc-600">
                    {item.label}
                  </span>
                  <span className="text-zinc-300">{item.value}</span>
                </div>
              ))}
            </div>
            <EquityCurveChart data={message.result.chart_data} />
            <ChartTable data={message.result.chart_data} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
