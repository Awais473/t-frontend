import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/client";

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async (filterDays: number | undefined) => {
    const [rankings, metrics, trades] = await Promise.all([
      api.getStrategyRankings(filterDays),
      api.getTradeMetrics(filterDays),
      api.getTrades(),
    ]);
    return { rankings, metrics, trades: trades.trades };
  },
);
