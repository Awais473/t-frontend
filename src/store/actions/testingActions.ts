import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/client";

export const fetchTestingData = createAsyncThunk(
  "testing/fetchData",
  async () => {
    const [strategies, rankings, trades, active] = await Promise.all([
      api.getStrategies(),
      api.getStrategyRankings(),
      api.getTrades(),
      api.getActiveStrategies(),
    ]);
    return { strategies, rankings, trades: trades.trades, activeStrategies: active };
  },
);

export const toggleActiveStrategy = createAsyncThunk(
  "testing/toggleActive",
  async ({
    strategyName, symbol, timeframe, currentlyActive,
  }: { strategyName: string; symbol: string; timeframe: string; currentlyActive: boolean }) => {
    if (currentlyActive) {
      await api.deactivateStrategy(strategyName, symbol);
    } else {
      await api.activateStrategy(strategyName, symbol, timeframe);
    }
    const active = await api.getActiveStrategies();
    return active;
  },
);

export const fetchAnalysis = createAsyncThunk(
  "testing/fetchAnalysis",
  async ({ strategyName, symbol, timeframe }: { strategyName: string; symbol: string; timeframe: string }) => {
    if (!strategyName) return null;
    const result = await api.analyzeStrategy(strategyName, symbol, timeframe);
    return result;
  },
);
