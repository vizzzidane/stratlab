export interface BacktestRequest {
  strategy: string;
  ticker: string;
  short_sma: number;
  long_sma: number;
  initial_capital: number;
  period: string;
}

export interface Stats {
  annualized_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_returns: number;
  total_trades: number;
  win_rate: number;
}

export interface ChartDataPoint {
  date: string;
  close: number;
  short_sma: number | null;
  long_sma: number | null;
  signal: number | string | null;
  equity: number;
  returns?: number | null;
}

export interface BacktestResponse {
  stats: Stats;
  chart_data: ChartDataPoint[];
}

export interface ParamsFormValues {
  ticker: string;
  shortSma: number;
  longSma: number;
  initialCapital: number;
  period: string;
}

export type ChatMessageRole = "user" | "model" | "error";

export interface TranscriptMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  result?: BacktestResponse;
}
