import type { StrategyRanking, Trade } from "@/types";

export interface DashboardState {
  rankings: StrategyRanking[];
  trades: Trade[];
  metrics: Record<string, unknown>;
  filterDays: number | undefined;
  loading: boolean;
  error: string | null;
}

export type DashboardAction =
  | { type: "SET_RANKINGS"; payload: StrategyRanking[] }
  | { type: "SET_TRADES"; payload: Trade[] }
  | { type: "SET_METRICS"; payload: Record<string, unknown> }
  | { type: "SET_FILTER_DAYS"; payload: number | undefined }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
