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
  annualized_buy_hold_return?: number;
  buy_hold_max_drawdown?: number;
  buy_hold_returns?: number;
  buy_hold_sharpe?: number;
  buy_hold_volatility?: number;
  sharpe_ratio: number;
  max_drawdown: number;
  strategy_volatility?: number;
  total_days?: number;
  total_returns: number;
  total_trades: number;
  total_years?: number;
  win_rate: number;
}

export interface ChartDataPoint {
  date: string;
  strategy: number;
  buy_hold: number;
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
  createdAt: string;
  result?: BacktestResponse;
}
