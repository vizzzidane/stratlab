import type { TranscriptMessage } from "../lib/types";
import { ChartTable } from "./ChartTable";
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

export function ChatMessage({ message }: ChatMessageProps) {
  const isResult = message.role === "model" && message.result;
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <article className={`border ${isResult ? "p-0" : "p-3"} ${roleStyles[message.role]}`}>
      <div
        className={`flex items-center justify-between gap-3 ${
          isResult ? "border-b border-zinc-800/80 px-3 py-2" : "mb-2"
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${
            isError ? "text-red-300" : isResult ? "text-cyan-300" : "text-zinc-500"
          }`}
        >
          {roleLabels[message.role]}
        </p>
      </div>

      <div className={isResult ? "p-3" : ""}>
        <p
          className={`whitespace-pre-wrap leading-6 ${
            isUser
              ? "font-mono text-xs text-zinc-500"
              : isError
                ? "text-sm text-red-200"
                : "text-sm text-zinc-300"
          }`}
        >
          {message.content}
        </p>

        {message.result ? (
          <div className="mt-3 grid gap-3">
            <MetricsCard stats={message.result.stats} />
            <ChartTable data={message.result.chart_data} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
