import { useEffect, useCallback } from "react";
import { DashboardCards } from "@/components/DashboardCards";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardData } from "@/store/actions/dashboardActions";
import { setFilterDays } from "@/store/reducers/dashboardReducer";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { rankings, trades, metrics, filterDays } = useAppSelector((s) => s.dashboard);

  const onFilterChange = useCallback(
    (days: number | undefined) => dispatch(setFilterDays(days)),
    [dispatch],
  );

  useEffect(() => {
    dispatch(fetchDashboardData(filterDays));
  }, [dispatch, filterDays]);

  return (
    <DashboardCards
      rankings={rankings}
      trades={trades}
      metrics={metrics}
      filterDays={filterDays}
      onFilterChange={onFilterChange}
    />
  );
}
