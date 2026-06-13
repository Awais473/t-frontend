import { createSlice } from "@reduxjs/toolkit";
import type { StrategyRanking, Trade } from "@/types";
import { fetchDashboardData } from "@/store/actions/dashboardActions";

interface DashboardState {
  rankings: StrategyRanking[];
  trades: Trade[];
  metrics: Record<string, unknown>;
  filterDays: number | undefined;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  rankings: [],
  trades: [],
  metrics: {},
  filterDays: undefined,
  loading: true,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setFilterDays(state, action: { payload: number | undefined }) {
      state.filterDays = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.rankings = action.payload.rankings;
        state.metrics = action.payload.metrics;
        state.trades = action.payload.trades;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load dashboard data";
      });
  },
});

export const { setFilterDays } = dashboardSlice.actions;
export default dashboardSlice.reducer;
