import type { StrategyInfo, StrategyRanking, Trade, ActiveStrategy, StrategyAnalysis } from "@/types";

export interface TestingState {
  strategies: StrategyInfo[];
  rankings: StrategyRanking[];
  trades: Trade[];
  activeStrategies: ActiveStrategy[];
  selStrategy: string;
  selSymbol: string;
  selTimeframe: string;
  analysis: StrategyAnalysis | null;
  loading: boolean;
  error: string | null;
}

export type TestingAction =
  | { type: "SET_STRATEGIES"; payload: StrategyInfo[] }
  | { type: "SET_RANKINGS"; payload: StrategyRanking[] }
  | { type: "SET_TRADES"; payload: Trade[] }
  | { type: "SET_ACTIVE_STRATEGIES"; payload: ActiveStrategy[] }
  | { type: "SET_SEL_STRATEGY"; payload: string }
  | { type: "SET_SEL_SYMBOL"; payload: string }
  | { type: "SET_SEL_TIMEFRAME"; payload: string }
  | { type: "SET_ANALYSIS"; payload: StrategyAnalysis | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
