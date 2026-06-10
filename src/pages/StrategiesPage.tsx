import { useReducer, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BacktestPanel } from "@/components/BacktestPanel";
import { StrategyCard } from "@/components/StrategyCard";
import { StrategyRanking } from "@/components/StrategyRanking";
import { api } from "@/api/client";
import type { StrategyInfo, StrategyRanking as Ranking } from "@/types";

interface State {
  strategies: StrategyInfo[];
  rankings: Ranking[];
  loading: boolean;
}

const initialState: State = {
  strategies: [],
  rankings: [],
  loading: true,
};

type Action =
  | { type: "SET_DATA"; strategies: StrategyInfo[]; rankings: Ranking[] }
  | { type: "SET_LOADING"; loading: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DATA":
      return { strategies: action.strategies, rankings: action.rankings, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    default:
      return state;
  }
}

export function StrategiesPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", loading: true });
    Promise.all([
      api.getStrategies(),
      api.getStrategyRankings(),
    ])
      .then(([strategies, rankings]) => {
        dispatch({ type: "SET_DATA", strategies, rankings });
      })
      .catch(() => dispatch({ type: "SET_LOADING", loading: false }));
  }, []);

  if (state.loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading strategies...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Strategies</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {state.strategies.map((s) => (
            <StrategyCard
              key={s.name}
              strategy={s}
              performance={state.rankings.find((r) => r.name === s.name) ?? null}
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
          <BacktestPanel strategies={state.strategies} />
        </TabsContent>
        <TabsContent value="rankings">
          <StrategyRanking rankings={state.rankings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
