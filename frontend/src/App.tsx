import { useMemo, useState } from "react";
import { ChatLayout } from "./components/ChatLayout";
import { defaultParams } from "./components/ParamsForm";
import { runBacktest } from "./lib/api";
import type {
  BacktestRequest,
  BacktestResponse,
  ParamsFormValues,
  TranscriptMessage,
} from "./lib/types";

const defaultStrategy = "Run a simple SMA crossover backtest.";

function createMessage(
  role: TranscriptMessage["role"],
  content: string,
  result?: BacktestResponse,
): TranscriptMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    result,
  };
}

function buildPayload(
  strategy: string,
  params: ParamsFormValues,
): BacktestRequest {
  return {
    strategy,
    ticker: params.ticker.trim().toUpperCase(),
    short_sma: params.shortSma,
    long_sma: params.longSma,
    initial_capital: params.initialCapital,
    period: params.period.trim(),
  };
}

function formatRequestSummary(payload: BacktestRequest): string {
  return [
    payload.strategy,
    "",
    `ticker=${payload.ticker}`,
    `short_sma=${payload.short_sma}`,
    `long_sma=${payload.long_sma}`,
    `initial_capital=${payload.initial_capital}`,
    `period=${payload.period}`,
  ].join("\n");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected backend error";
}

function App() {
  const [strategy, setStrategy] = useState(defaultStrategy);
  const [params, setParams] = useState<ParamsFormValues>(defaultParams);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      strategy.trim().length > 0 &&
      params.ticker.trim().length > 0 &&
      params.period.trim().length > 0 &&
      params.shortSma > 0 &&
      params.longSma > 0 &&
      params.initialCapital > 0
    );
  }, [params, strategy]);

  async function handleSubmit() {
    if (!canSubmit || isLoading) {
      return;
    }

    const payload = buildPayload(strategy, params);
    setIsLoading(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage("user", formatRequestSummary(payload)),
    ]);

    try {
      const result = await runBacktest(payload);
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(
          "model",
          `Backtest complete for ${payload.ticker}. Latest ${Math.min(
            result.chart_data.length,
            10,
          )} chart rows are shown below.`,
          result,
        ),
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("error", getErrorMessage(error)),
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950">
        <div className="flex min-h-12 flex-col justify-between gap-2 px-3 py-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <h1 className="text-sm font-semibold tracking-normal text-zinc-50">
                StratLab
              </h1>
            </div>
            <div className="hidden h-4 w-px bg-zinc-800 sm:block" />
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Research Console
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-zinc-500">
            <span>
              Backend API: <span className="text-zinc-300">localhost:5000</span>
            </span>
            <span>
              Session: <span className="text-cyan-300">Local Session</span>
            </span>
          </div>
        </div>
      </header>

      <ChatLayout
        canSubmit={canSubmit}
        isLoading={isLoading}
        messages={messages}
        params={params}
        strategy={strategy}
        onParamsChange={setParams}
        onStrategyChange={setStrategy}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

export default App;
