import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BacktestPanel } from "@/components/BacktestPanel";
import { StrategyCard } from "@/components/StrategyCard";
import { StrategyRanking } from "@/components/StrategyRanking";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStrategiesData } from "@/store/actions/strategiesActions";

export function StrategiesPage() {
  const dispatch = useAppDispatch();
  const { strategies, rankings, loading } = useAppSelector((s) => s.strategies);

  useEffect(() => {
    dispatch(fetchStrategiesData());
  }, [dispatch]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading strategies...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Strategies</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {strategies.map((s) => (
            <StrategyCard
              key={s.name}
              strategy={s}
              performance={rankings.find((r) => r.name === s.name) ?? null}
            />
          ))}
        </div>
      </div>

      <Tabs defaultValue="backtest">
        <TabsList>
          <TabsTrigger value="backtest">Backtest</TabsTrigger>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
        </TabsList>
        <TabsContent value="backtest">
          <BacktestPanel strategies={strategies} />
        </TabsContent>
        <TabsContent value="rankings">
          <StrategyRanking rankings={rankings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
