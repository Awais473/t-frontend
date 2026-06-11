export interface Candle {
  id: number;
  symbol: string;
  timeframe: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface Trade {
  id: number;
  strategy_name: string;
  symbol: string;
  side: "LONG" | "SHORT";
  timeframe: string;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  quantity: number;
  entry_time: string;
  exit_time: string | null;
  pnl: number | null;
  pnl_percent: number | null;
  rr_ratio: number | null;
  duration_minutes: number | null;
  result: string | null;
  status: "OPEN" | "CLOSED";
}

export interface Signal {
  id: number;
  strategy_name: string;
  symbol: string;
  timeframe: string;
  signal: string;
  price: number;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  confidence: number | null;
  timestamp: string;
}

export interface StrategyInfo {
  name: string;
  description: string;
}

export interface StrategyRanking {
  rank: number;
  name: string;
  symbol: string;
  timeframe: string;
  win_rate: number;
  profit_factor: number;
  total_pnl: number;
  max_drawdown: number;
  sharpe_ratio: number;
  score: number;
  avg_rr: number;
  consecutive_wins: number;
  consecutive_losses: number;
  total_trades: number;
}

export interface BacktestResult {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  sharpe_ratio: number;
  trades: BacktestTrade[];
}

export interface BacktestTrade {
  entry_time: string;
  exit_time: string | null;
  entry_price: number;
  exit_price: number;
  side: string;
  pnl: number;
  pnl_percent: number;
}

export interface ActiveStrategy {
  strategy_name: string;
  symbol: string;
  primary_timeframe: string;
  timeframes?: string[];
}

export interface StrategyAnalysis {
  strategy_name: string;
  symbol: string;
  timeframe: string;
  signal: string;
  confidence: number;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  metadata: Record<string, unknown>;
}

export interface IndicatorInfo {
  name: string;
  description: string;
}

export interface IndicatorData {
  indicator: string;
  params: Record<string, unknown>;
  data: IndicatorPoint[];
}

export interface IndicatorPoint {
  time: number;
  value?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
  level?: number;
  label?: string;
  direction?: string;
  type?: string;
}

export interface ActiveIndicator {
  id: string;
  name: string;
  params: Record<string, unknown>;
  color: string;
}
