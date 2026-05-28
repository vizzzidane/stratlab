import type { ChartDataPoint } from "../lib/types";

interface ChartTableProps {
  data: ChartDataPoint[];
}

function formatCell(value: number | string | null | undefined): string {
  if (typeof value === "number") {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  return value === null || value === undefined || value === "" ? "-" : String(value);
}

export function ChartTable({ data }: ChartTableProps) {
  const latestRows = data.slice(-10).reverse();

  return (
    <div className="overflow-hidden border border-zinc-800/80 bg-black">
      <div className="border-b border-zinc-800/80 px-2.5 py-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Latest Backtest Rows
        </h3>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="min-w-full border-collapse text-left font-mono text-xs">
          <thead className="sticky top-0 bg-zinc-950 text-zinc-500">
            <tr className="border-b border-zinc-800/80">
              <th className="whitespace-nowrap px-2.5 py-1.5 font-medium">Date</th>
              <th className="whitespace-nowrap px-2.5 py-1.5 text-right font-medium">
                Strategy
              </th>
              <th className="whitespace-nowrap px-2.5 py-1.5 text-right font-medium">
                Buy &amp; Hold
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 bg-black text-zinc-300">
          {latestRows.map((row) => (
            <tr key={`${row.date}-${row.strategy}-${row.buy_hold}`} className="hover:bg-zinc-950">
              <td className="whitespace-nowrap px-2.5 py-1.5 text-zinc-400">
                {row.date}
              </td>
              <td className="px-2.5 py-1.5 text-right">
                {formatCell(row.strategy)}
              </td>
              <td className="px-2.5 py-1.5 text-right">
                {formatCell(row.buy_hold)}
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
