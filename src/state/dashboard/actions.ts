import { api } from "@/api/client";
import type { Dispatch } from "react";
import type { DashboardAction } from "./types";

export async function fetchDashboardData(
  dispatch: Dispatch<DashboardAction>,
  filterDays: number | undefined,
) {
  dispatch({ type: "SET_LOADING", payload: true });
  try {
    const [rankings, metrics, trades] = await Promise.all([
      api.getStrategyRankings(filterDays),
      api.getTradeMetrics(filterDays),
      api.getTrades(),
    ]);
    dispatch({ type: "SET_RANKINGS", payload: rankings });
    dispatch({ type: "SET_METRICS", payload: metrics });
    dispatch({ type: "SET_TRADES", payload: trades.trades });
  } catch (err) {
    dispatch({ type: "SET_ERROR", payload: (err as Error).message });
  }
}
