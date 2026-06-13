import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/client";

export const fetchStrategiesData = createAsyncThunk(
  "strategies/fetchData",
  async () => {
    const [strategies, rankings] = await Promise.all([
      api.getStrategies(),
      api.getStrategyRankings(),
    ]);
    return { strategies, rankings };
  },
);
