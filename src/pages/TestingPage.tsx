import { useReducer, useEffect, useState } from "react";
import { RefreshCw, Radio, RadioTower } from "lucide-react";
import { api } from "@/api/client";
import { TradingChart } from "@/components/TradingChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { testingReducer, initialTestingState } from "@/state/testing/reducer";
import { fetchTestingData, toggleActiveStrategy, fetchAnalysis } from "@/state/testing/actions";
import type { WsCandle, WsSignal } from "@/hooks/useWebSocket";

interface Props {
  liveCandle: WsCandle | null;
  liveSignal: WsSignal | null;
}

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"] as const;
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

export function TestingPage({ liveCandle, liveSignal }: Props) {
  const [state, dispatch] = useReducer(testingReducer, initialTestingState);
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveMode, setLiveMode] = useState(true);

  useEffect(() => { fetchTestingData(dispatch); }, []);

  useEffect(() => {
    if (liveSignal) {
      api.getTrades().then((r) => dispatch({ type: "SET_TRADES", payload: r.trades }));
    }
  }, [liveSignal]);

  useEffect(() => {
    fetchAnalysis(dispatch, state.selStrategy, state.selSymbol, state.selTimeframe);
  }, [state.selStrategy, state.selSymbol, state.selTimeframe]);

  const chartTrades = state.trades
    .filter((t) => t.status === "CLOSED")
    .map((t) => ({ price: t.entry_price, side: t.side, time: t.entry_time }));

  const openTrades = state.trades.filter((t) => t.status === "OPEN");

  const isActivated = state.activeStrategies.some(
    (a) => a.strategy_name === state.selStrategy && a.symbol === state.selSymbol,
  );

  return (
    <div className="space-y-6 min-w-0">
      <TradingChart
        trades={chartTrades}
        openTrades={openTrades}
        analysis={state.analysis}
        refreshKey={refreshKey}
        liveCandle={liveMode ? liveCandle : undefined}
        liveSignal={liveMode ? liveSignal : undefined}
      />

      <div className="flex flex-wrap items-end gap-4 rounded-xl border p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Strategy</label>
          <Select value={state.selStrategy} onValueChange={(v) => dispatch({ type: "SET_SEL_STRATEGY", payload: v })}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select strategy..." />
            </SelectTrigger>
            <SelectContent>
              {state.strategies.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.name.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Symbol</label>
          <Select value={state.selSymbol} onValueChange={(v) => dispatch({ type: "SET_SEL_SYMBOL", payload: v })}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYMBOLS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Timeframe</label>
          <Select value={state.selTimeframe} onValueChange={(v) => dispatch({ type: "SET_SEL_TIMEFRAME", payload: v })}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf} value={tf}>{tf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant={isActivated ? "default" : "outline"}
          size="sm"
          onClick={() => toggleActiveStrategy(dispatch, state.selStrategy, state.selSymbol, state.selTimeframe, isActivated)}
          disabled={!state.selStrategy}
        >
          {isActivated ? "Deactivate" : "Activate"}
        </Button>
        {isActivated && <Badge variant="success">Live</Badge>}
        {state.analysis && state.analysis.signal !== "HOLD" && (
          <Badge variant={state.analysis.signal === "BUY" ? "success" : "destructive"}>
            {state.analysis.signal} ({(state.analysis.confidence * 100).toFixed(0)}%)
          </Badge>
        )}
        <Button variant={liveMode ? "default" : "ghost"} size="icon" className="ml-auto" onClick={() => setLiveMode((m) => !m)} title="Toggle live chart">
          {liveMode ? <RadioTower className="size-4" /> : <Radio className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setRefreshKey((k) => k + 1)} title="Refresh chart">
          <RefreshCw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
