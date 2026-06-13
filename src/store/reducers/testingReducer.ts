import { createSlice } from "@reduxjs/toolkit";
import type { Trade } from "@/types";
import type { StrategyInfo, StrategyRanking, ActiveStrategy, StrategyAnalysis } from "@/types";
import { fetchTestingData, toggleActiveStrategy, fetchAnalysis } from "@/store/actions/testingActions";

interface TestingState {
  strategies: StrategyInfo[];
  rankings: StrategyRanking[];
  trades: Trade[];
  activeStrategies: ActiveStrategy[];
  selStrategy: string;
  selSymbol: string;
  selTimeframe: string;
  analysis: StrategyAnalysis | null;
  loading: boolean;
  error: string | null;
}

const initialState: TestingState = {
  strategies: [],
  rankings: [],
  trades: [],
  activeStrategies: [],
  selStrategy: "",
  selSymbol: "BTCUSDT",
  selTimeframe: "15m",
  analysis: null,
  loading: true,
  error: null,
};

const testingSlice = createSlice({
  name: "testing",
  initialState,
  reducers: {
    setSelStrategy(state, action: { payload: string }) {
      state.selStrategy = action.payload;
    },
    setSelSymbol(state, action: { payload: string }) {
      state.selSymbol = action.payload;
    },
    setSelTimeframe(state, action: { payload: string }) {
      state.selTimeframe = action.payload;
    },
    setTrades(state, action: { payload: Trade[] }) {
      state.trades = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestingData.fulfilled, (state, action) => {
        state.loading = false;
        state.strategies = action.payload.strategies;
        state.rankings = action.payload.rankings;
        state.trades = action.payload.trades;
        state.activeStrategies = action.payload.activeStrategies;
      })
      .addCase(fetchTestingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load testing data";
      })
      .addCase(toggleActiveStrategy.fulfilled, (state, action) => {
        state.activeStrategies = action.payload;
      })
      .addCase(fetchAnalysis.fulfilled, (state, action) => {
        state.analysis = action.payload;
      })
      .addCase(fetchAnalysis.rejected, (state) => {
        state.analysis = null;
      });
  },
});

export const { setSelStrategy, setSelSymbol, setSelTimeframe, setTrades } = testingSlice.actions;
export default testingSlice.reducer;
