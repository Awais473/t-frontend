import { useReducer, useEffect, useCallback } from "react";
import { DashboardCards } from "@/components/DashboardCards";
import { dashboardReducer, initialDashboardState } from "@/state/dashboard/reducer";
import { fetchDashboardData } from "@/state/dashboard/actions";

export function DashboardPage() {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  const onFilterChange = useCallback(
    (days: number | undefined) => dispatch({ type: "SET_FILTER_DAYS", payload: days }),
    [],
  );

  useEffect(() => {
    fetchDashboardData(dispatch, state.filterDays);
  }, [state.filterDays]);

  return (
    <DashboardCards
      rankings={state.rankings}
      trades={state.trades}
      metrics={state.metrics}
      filterDays={state.filterDays}
      onFilterChange={onFilterChange}
    />
  );
}
