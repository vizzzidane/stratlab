import type { ParamsFormValues } from "../lib/types";

interface ParamsFormProps {
  values: ParamsFormValues;
  disabled?: boolean;
  onChange: (values: ParamsFormValues) => void;
}

const inputClassName =
  "w-full border border-zinc-800 bg-black px-2.5 py-1.5 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-cyan-500/70 disabled:cursor-not-allowed disabled:opacity-60";

export const defaultParams: ParamsFormValues = {
  ticker: "AAPL",
  shortSma: 9,
  longSma: 20,
  initialCapital: 10000,
  period: "2y",
};

function parseNumber(value: string): number {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

export function ParamsForm({ values, disabled = false, onChange }: ParamsFormProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Ticker
        <input
          className={inputClassName}
          disabled={disabled}
          value={values.ticker}
          onChange={(event) =>
            onChange({ ...values, ticker: event.target.value.toUpperCase() })
          }
        />
      </label>

      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Period
        <input
          className={inputClassName}
          disabled={disabled}
          value={values.period}
          onChange={(event) => onChange({ ...values, period: event.target.value })}
        />
      </label>

      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Short SMA
        <input
          className={inputClassName}
          disabled={disabled}
          min={1}
          type="number"
          value={values.shortSma}
          onChange={(event) =>
            onChange({ ...values, shortSma: parseNumber(event.target.value) })
          }
        />
      </label>

      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Long SMA
        <input
          className={inputClassName}
          disabled={disabled}
          min={1}
          type="number"
          value={values.longSma}
          onChange={(event) =>
            onChange({ ...values, longSma: parseNumber(event.target.value) })
          }
        />
      </label>

      <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:col-span-2 lg:col-span-1">
        Initial Capital
        <input
          className={inputClassName}
          disabled={disabled}
          min={1}
          step={100}
          type="number"
          value={values.initialCapital}
          onChange={(event) =>
            onChange({
              ...values,
              initialCapital: parseNumber(event.target.value),
            })
          }
        />
      </label>
    </div>
  );
}
