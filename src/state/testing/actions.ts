import { api } from "@/api/client";
import type { Dispatch } from "react";
import type { TestingAction } from "./types";

export async function fetchTestingData(dispatch: Dispatch<TestingAction>) {
  dispatch({ type: "SET_LOADING", payload: true });
  try {
    const [strategies, rankings, trades, active] = await Promise.all([
      api.getStrategies(),
      api.getStrategyRankings(),
      api.getTrades(),
      api.getActiveStrategies(),
    ]);
    dispatch({ type: "SET_STRATEGIES", payload: strategies });
    dispatch({ type: "SET_RANKINGS", payload: rankings });
    dispatch({ type: "SET_TRADES", payload: trades.trades });
    dispatch({ type: "SET_ACTIVE_STRATEGIES", payload: active });
  } catch (err) {
    dispatch({ type: "SET_ERROR", payload: (err as Error).message });
  }
}

export async function toggleActiveStrategy(
  dispatch: Dispatch<TestingAction>,
  strategyName: string,
  symbol: string,
  timeframe: string,
  currentlyActive: boolean,
) {
  try {
    if (currentlyActive) {
      await api.deactivateStrategy(strategyName, symbol);
    } else {
      await api.activateStrategy(strategyName, symbol, timeframe);
    }
    const active = await api.getActiveStrategies();
    dispatch({ type: "SET_ACTIVE_STRATEGIES", payload: active });
  } catch {}
}

export async function fetchAnalysis(
  dispatch: Dispatch<TestingAction>,
  strategyName: string,
  symbol: string,
  timeframe: string,
) {
  if (!strategyName) {
    dispatch({ type: "SET_ANALYSIS", payload: null });
    return;
  }
  try {
    const result = await api.analyzeStrategy(strategyName, symbol, timeframe);
    dispatch({ type: "SET_ANALYSIS", payload: result });
  } catch {
    dispatch({ type: "SET_ANALYSIS", payload: null });
  }
}
