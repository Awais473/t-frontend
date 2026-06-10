import type { TestingState, TestingAction } from "./types";

export const initialTestingState: TestingState = {
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

export function testingReducer(state: TestingState, action: TestingAction): TestingState {
  switch (action.type) {
    case "SET_STRATEGIES":
      return { ...state, strategies: action.payload, loading: false, error: null };
    case "SET_RANKINGS":
      return { ...state, rankings: action.payload };
    case "SET_TRADES":
      return { ...state, trades: action.payload };
    case "SET_ACTIVE_STRATEGIES":
      return { ...state, activeStrategies: action.payload };
    case "SET_SEL_STRATEGY":
      return { ...state, selStrategy: action.payload };
    case "SET_SEL_SYMBOL":
      return { ...state, selSymbol: action.payload };
    case "SET_SEL_TIMEFRAME":
      return { ...state, selTimeframe: action.payload };
    case "SET_ANALYSIS":
      return { ...state, analysis: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}
