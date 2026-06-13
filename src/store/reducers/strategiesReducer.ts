import { createSlice } from "@reduxjs/toolkit";
import type { StrategyInfo, StrategyRanking } from "@/types";
import { fetchStrategiesData } from "@/store/actions/strategiesActions";

interface StrategiesState {
  strategies: StrategyInfo[];
  rankings: StrategyRanking[];
  loading: boolean;
  error: string | null;
}

const initialState: StrategiesState = {
  strategies: [],
  rankings: [],
  loading: true,
  error: null,
};

const strategiesSlice = createSlice({
  name: "strategies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStrategiesData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStrategiesData.fulfilled, (state, action) => {
        state.loading = false;
        state.strategies = action.payload.strategies;
        state.rankings = action.payload.rankings;
      })
      .addCase(fetchStrategiesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load strategies";
      });
  },
});

export default strategiesSlice.reducer;
