import { createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/api/client";

export const fetchBtcCandles = createAsyncThunk(
  "btc/fetchCandles",
  async ({ timeframe, limit }: { timeframe: string; limit?: number }) => {
    const data = await api.getCandles("BTCUSDT", timeframe, limit ?? 500);
    return data.candles;
  },
);
