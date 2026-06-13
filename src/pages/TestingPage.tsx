import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Radio, RadioTower, Plus, X } from "lucide-react";
import { api } from "@/api/client";
import { TradingChart } from "@/components/TradingChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTestingData, toggleActiveStrategy, fetchAnalysis } from "@/store/actions/testingActions";
import { setSelStrategy, setSelSymbol, setSelTimeframe, setTrades } from "@/store/reducers/testingReducer";
import type { WsCandle, WsSignal } from "@/hooks/useWebSocket";
import type { IndicatorInfo, ActiveIndicator } from "@/types";

interface Props {
  liveCandle: WsCandle | null;
  liveSignal: WsSignal | null;
}

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"] as const;
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

const INDICATOR_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

let indicatorIdCounter = 0;

export function TestingPage({ liveCandle, liveSignal }: Props) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.testing);
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveMode, setLiveMode] = useState(true);

  const [indicatorPeriod, setIndicatorPeriod] = useState("20");
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicator[]>([]);
  const [showFib, setShowFib] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);

  useEffect(() => { dispatch(fetchTestingData()); }, [dispatch]);

  useEffect(() => {
    if (liveSignal) {
      api.getTrades().then((r) => dispatch(setTrades(r.trades)));
    }
  }, [liveSignal, dispatch]);

  useEffect(() => {
    dispatch(fetchAnalysis({ strategyName: state.selStrategy, symbol: state.selSymbol, timeframe: state.selTimeframe }));
  }, [state.selStrategy, state.selSymbol, state.selTimeframe, dispatch]);

  const addIndicator = useCallback(() => {
    const color = INDICATOR_COLORS[indicatorIdCounter % INDICATOR_COLORS.length];
    const period = parseInt(indicatorPeriod) || 20;
    const existing = activeIndicators.find(
      (i) => i.name === "ema" && i.params.period === period
    );
    if (existing) return;
    setActiveIndicators((prev) => [
      ...prev,
      {
        id: `ind_${++indicatorIdCounter}`,
        name: "ema",
        params: { period },
        color,
      },
    ]);
  }, [indicatorPeriod, activeIndicators]);

  const removeIndicator = useCallback((id: string) => {
    setActiveIndicators((prev) => prev.filter((i) => i.id !== id));
  }, []);

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
        activeIndicators={activeIndicators}
        showFib={showFib}
        onToggleFib={() => setShowFib((v) => !v)}
        showAnalysis={showAnalysis}
        onToggleAnalysis={() => setShowAnalysis((v) => !v)}
      />

      <div className="flex flex-wrap items-end gap-4 rounded-xl border p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Strategy</label>
          <Select value={state.selStrategy} onValueChange={(v) => dispatch(setSelStrategy(v))}>
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
          <Select value={state.selSymbol} onValueChange={(v) => dispatch(setSelSymbol(v))}>
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
          <Select value={state.selTimeframe} onValueChange={(v) => dispatch(setSelTimeframe(v))}>
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
          onClick={() => dispatch(toggleActiveStrategy({ strategyName: state.selStrategy, symbol: state.selSymbol, timeframe: state.selTimeframe, currentlyActive: isActivated }))}
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
        <Button variant={showFib ? "default" : "outline"} size="sm" className="h-8 px-2 text-xs" onClick={() => setShowFib((v) => !v)}>
          Fib
        </Button>
        <Button variant={showAnalysis && !!state.analysis ? "default" : "outline"} size="sm" className="h-8 px-2 text-xs" onClick={() => setShowAnalysis((v) => !v)}>
          Levels
        </Button>
      </div>

      {/* <div className="flex flex-wrap items-end gap-4 rounded-xl border p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">EMA</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-20 h-10"
              value={indicatorPeriod}
              onChange={(e) => setIndicatorPeriod(e.target.value)}
              min={1}
              max={500}
              placeholder="Period"
            />
            <Button variant="default" size="sm" onClick={addIndicator}>
              <Plus className="size-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        {activeIndicators.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeIndicators.map((ind) => (
              <Badge
                key={ind.id}
                style={{ backgroundColor: ind.color + "20", color: ind.color, borderColor: ind.color }}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: ind.color }} />
                EMA ({String(ind.params.period ?? "")})
                <X className="size-3 cursor-pointer ml-1" onClick={() => removeIndicator(ind.id)} />
              </Badge>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}
