import type {
  BacktestResult,
  Candle,
  StrategyInfo,
  StrategyRanking,
  Trade,
  Signal,
  ActiveStrategy,
  StrategyAnalysis,
} from "@/types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} ${res.status}`);
  return res.json();
}

export const api = {
  getCandles: (symbol: string, timeframe: string, limit = 500) =>
    get<{ candles: Candle[]; total: number }>(`/candles/?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`),
  getSymbols: () => get<string[]>("/candles/symbols"),
  getStrategies: () => get<StrategyInfo[]>("/strategies/"),
  getStrategyRankings: (days?: number) =>
    get<StrategyRanking[]>(`/performance/ranking${days ? `?days=${days}` : ""}`),
  getTradeMetrics: (days?: number) =>
    get<Record<string, unknown>>(`/performance/metrics${days ? `?days=${days}` : ""}`),
  getTrades: (strategy?: string) =>
    get<{ trades: Trade[]; total: number }>(`/trades/${strategy ? `?strategy_name=${strategy}` : ""}`),
  getSignals: (strategy?: string, symbol?: string) =>
    get<{ signals: Signal[]; total: number }>(
      `/signals/${strategy ? `?strategy_name=${strategy}` : ""}${symbol ? `${strategy ? "&" : "?"}symbol=${symbol}` : ""}`,
    ),
  getStrategyMetrics: () =>
    get<{ metrics: Record<string, unknown>[]; total: number }>("/strategy-metrics/"),
  runBacktest: (params: {
    strategy_name: string;
    symbol: string;
    timeframe: string;
    limit: number;
    initial_capital: number;
  }) => post<BacktestResult>("/backtest/", params),
  activateStrategy: (strategy_name: string, symbol: string, timeframe: string) =>
    post<ActiveStrategy>("/strategies/activate", { strategy_name, symbol, timeframe }),
  deactivateStrategy: (strategy_name: string, symbol: string) =>
    post<{ ok: boolean }>("/strategies/deactivate", { strategy_name, symbol }),
  getActiveStrategies: () => get<ActiveStrategy[]>("/strategies/active"),
  analyzeStrategy: (strategy_name: string, symbol: string, timeframe: string) =>
    post<StrategyAnalysis>("/strategies/analyze", { strategy_name, symbol, timeframe }),
};
