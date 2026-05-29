import type { FormEvent, ReactNode } from "react";
import type { ParamsFormValues, TranscriptMessage } from "../lib/types";
import { ChatMessage } from "./ChatMessage";
import { ParamsForm } from "./ParamsForm";

interface ChatLayoutProps {
  strategy: string;
  params: ParamsFormValues;
  messages: TranscriptMessage[];
  isLoading: boolean;
  canSubmit: boolean;
  onStrategyChange: (strategy: string) => void;
  onParamsChange: (params: ParamsFormValues) => void;
  onSubmit: () => void;
}

function Panel({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-h-0 flex-col border border-zinc-800/80 bg-zinc-950 ${className}`}>
      <header className="border-b border-zinc-800/80 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 text-sm font-semibold text-zinc-100">{title}</h2>
      </header>
      {children}
    </section>
  );
}

export function ChatLayout({
  strategy,
  params,
  messages,
  isLoading,
  canSubmit,
  onStrategyChange,
  onParamsChange,
  onSubmit,
}: ChatLayoutProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2 lg:flex-row">
      <Panel
        className="lg:w-80 lg:flex-none"
        eyebrow="Experiment"
        title="Experiment Config"
      >
        <form className="grid gap-3 overflow-y-auto p-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Strategy Notes
            <textarea
              className="min-h-28 resize-y border border-zinc-800 bg-black px-2.5 py-1.5 font-mono text-sm leading-6 text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-cyan-500/70 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              placeholder="Test a simple SMA crossover strategy."
              value={strategy}
              onChange={(event) => onStrategyChange(event.target.value)}
            />
          </label>

          <ParamsForm
            disabled={isLoading}
            values={params}
            onChange={onParamsChange}
          />

          <button
            className="border border-cyan-500 bg-cyan-500 px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
            disabled={!canSubmit || isLoading}
            type="submit"
          >
            {isLoading ? "Running Backtest..." : "Execute Backtest"}
          </button>
        </form>
      </Panel>

      <Panel className="flex-1" eyebrow="Workspace" title="Research Log">
        <div className="flex min-h-[30rem] flex-1 flex-col">
          <div className="flex-1 space-y-2 overflow-y-auto bg-black p-2">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <div className="grid gap-2" key={message.id}>
                  <ChatMessage message={message} />
                  {index < messages.length - 1 ? (
                    <div className="h-px bg-zinc-900/80" />
                  ) : null}
                </div>
              ))
            ) : (
              <div className="flex min-h-52 items-center justify-center border border-dashed border-zinc-800/80 bg-zinc-950/30 p-4 text-center">
                <p className="max-w-md text-sm leading-6 text-zinc-500">
                  No active research session. Configure parameters and run a
                  backtest to begin analysis.
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="border border-zinc-800/80 bg-zinc-950 p-3">
                <p className="text-sm font-medium text-zinc-300">
                  Running backtest
                </p>
                <div className="mt-2 flex flex-col gap-1.5 font-mono text-xs text-zinc-500 sm:flex-row sm:gap-4">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Fetching historical data
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Computing SMA indicators
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Evaluating metrics
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Panel>
    </div>
  );
}
