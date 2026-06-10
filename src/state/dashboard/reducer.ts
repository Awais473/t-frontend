import type { DashboardState, DashboardAction } from "./types";

export const initialDashboardState: DashboardState = {
  rankings: [],
  trades: [],
  metrics: {},
  filterDays: undefined,
  loading: true,
  error: null,
};

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case "SET_RANKINGS":
      return { ...state, rankings: action.payload, loading: false, error: null };
    case "SET_TRADES":
      return { ...state, trades: action.payload };
    case "SET_METRICS":
      return { ...state, metrics: action.payload };
    case "SET_FILTER_DAYS":
      return { ...state, filterDays: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}
