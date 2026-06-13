import { createSlice } from "@reduxjs/toolkit";
import type { Candle } from "@/types";
import { fetchBtcCandles } from "@/store/actions/btcActions";

interface BtcState {
  candles: Candle[];
  loading: boolean;
  error: string | null;
}

const initialState: BtcState = {
  candles: [],
  loading: true,
  error: null,
};

const btcSlice = createSlice({
  name: "btc",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBtcCandles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBtcCandles.fulfilled, (state, action) => {
        state.loading = false;
        state.candles = action.payload;
      })
      .addCase(fetchBtcCandles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load BTC candles";
      });
  },
});

export default btcSlice.reducer;
