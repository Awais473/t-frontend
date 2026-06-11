import { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  createSeriesMarkers,
} from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  LineData,
  Time,
} from "lightweight-charts";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Candle, Trade, StrategyAnalysis, ActiveIndicator, IndicatorData } from "@/types";
import type { WsCandle, WsSignal } from "@/hooks/useWebSocket";

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"] as const;
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

interface Props {
  trades?: { price: number; side: string; time: string }[];
  openTrades?: Trade[];
  analysis?: StrategyAnalysis | null;
  liveCandle?: WsCandle | null;
  liveSignal?: WsSignal | null;
  refreshKey?: number;
  activeIndicators?: ActiveIndicator[];
}

function toLwtTime(ts: string): Time {
  return (new Date(ts).getTime() / 1000) as Time;
}

function toLwtTimeFromUnix(ts: number): Time {
  return ts as Time;
}

const FIB_COLORS = ["#9333ea", "#a855f7", "#c084fc", "#e879f9", "#d946ef", "#ec4899", "#f472b6"];

function generateSampleCandles(count = 500, startPrice = 65000): Candle[] {
  const now = new Date();
  const candles: Candle[] = [];
  let price = startPrice;
  for (let i = count - 1; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 3600000);
    const change = (Math.random() - 0.5) * 200;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 100;
    const low = Math.min(open, close) - Math.random() * 100;
    candles.push({
      id: i,
      symbol: "BTCUSDT",
      timeframe: "1h",
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000 + 100,
      timestamp: ts.toISOString(),
    });
    price = close;
  }
  return candles;
}

function findSwingHigh(candles: Candle[], lookback = 50): { index: number; price: number } | null {
  const slice = candles.slice(-lookback);
  let maxIdx = 0;
  for (let i = 1; i < slice.length; i++) {
    if (slice[i].high > slice[maxIdx].high) maxIdx = i;
  }
  return maxIdx > 0 && maxIdx < slice.length - 1 ? { index: candles.length - lookback + maxIdx, price: slice[maxIdx].high } : null;
}

function findSwingLow(candles: Candle[], lookback = 50): { index: number; price: number } | null {
  const slice = candles.slice(-lookback);
  let minIdx = 0;
  for (let i = 1; i < slice.length; i++) {
    if (slice[i].low < slice[minIdx].low) minIdx = i;
  }
  return minIdx > 0 && minIdx < slice.length - 1 ? { index: candles.length - lookback + minIdx, price: slice[minIdx].low } : null;
}

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

export function TradingChart({ trades, openTrades, analysis, liveCandle, liveSignal, refreshKey = 0, activeIndicators = [] }: Props) {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");
  const [loading, setLoading] = useState(true);
  const [ohlcv, setOhlcv] = useState({ open: 0, high: 0, low: 0, close: 0, volume: 0 });
  const [priceChange, setPriceChange] = useState({ change: 0, percent: 0 });
  const [showFib, setShowFib] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [indicatorData, setIndicatorData] = useState<Map<string, IndicatorData>>(new Map());

  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markersRef = useRef<ReturnType<typeof createSeriesMarkers<Time>> | null>(null);
  const overlaySeriesRefs = useRef<ISeriesApi<"Line">[]>([]);
  const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const candlesRef = useRef<Candle[]>([]);
  const fullCandleDataRef = useRef<{ time: Time; open: number; high: number; low: number; close: number }[]>([]);
  const fullVolumeDataRef = useRef<{ time: Time; value: number; color: string }[]>([]);

  const fetchAndSetCandles = useCallback(async (sym: string, tf: string): Promise<Candle[] | undefined> => {
    try {
      const data = await api.getCandles(sym, tf, 500);
      if (data.candles.length > 0) {
        candlesRef.current = data.candles;
        fullCandleDataRef.current = data.candles.map((c) => ({
          time: toLwtTime(c.timestamp),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        fullVolumeDataRef.current = data.candles.map((c) => ({
          time: toLwtTime(c.timestamp),
          value: c.volume,
          color: c.close >= c.open ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
        }));
        const last = data.candles[data.candles.length - 1];
        setOhlcv({ open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume });
        const first = data.candles[0];
        const change = last.close - first.open;
        setPriceChange({ change, percent: first.open !== 0 ? (change / first.open) * 100 : 0 });
        return data.candles;
      }
    } catch {}
    const fallback = generateSampleCandles();
    candlesRef.current = fallback;
    fullCandleDataRef.current = fallback.map((c) => ({
      time: toLwtTime(c.timestamp),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    fullVolumeDataRef.current = fallback.map((c) => ({
      time: toLwtTime(c.timestamp),
      value: c.volume,
      color: c.close >= c.open ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
    }));
    const last = fallback[fallback.length - 1];
    setOhlcv({ open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume });
    const first = fallback[0];
    const change = last.close - first.open;
    setPriceChange({ change, percent: first.open !== 0 ? (change / first.open) * 100 : 0 });
    return fallback;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth || 800,
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: "#0f1115" },
        textColor: "#a0a0a0",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: "#6366f1", width: 1, style: 2, labelBackgroundColor: "#6366f1" },
        horzLine: { color: "#6366f1", width: 1, style: 2, labelBackgroundColor: "#6366f1" },
      },
      timeScale: {
        borderColor: "#334155",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#334155",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    markersRef.current = createSeriesMarkers(candleSeries);

    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        const c = candlesRef.current;
        if (c.length > 0) {
          const last = c[c.length - 1];
          setOhlcv({ open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume });
        }
        return;
      }
      const candleData = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      const volumeData = param.seriesData.get(volumeSeries) as HistogramData | undefined;
      if (candleData) {
        setOhlcv({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volumeData?.value ?? 0,
        });
      }
    });

    const handleResize = () => {
      if (container) chart.resize(container.clientWidth, document.fullscreenElement ? window.innerHeight - 20 : 500);
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const c = await fetchAndSetCandles(symbol, timeframe);
      setLoading(false);

      const candleSeries = candleSeriesRef.current;
      const chart = chartRef.current;
      if (!candleSeries || !chart) return;

      clearOverlays();
      candleSeries.setData(fullCandleDataRef.current);
      volumeSeriesRef.current?.setData(fullVolumeDataRef.current);
      chart.timeScale().fitContent();
      if (c) drawOverlays(c);
    };
    run();
  }, [symbol, timeframe, refreshKey, fetchAndSetCandles]);

  useEffect(() => {
    if (candleSeriesRef.current && fullCandleDataRef.current.length > 0) {
      candleSeriesRef.current.setData(fullCandleDataRef.current);
    }
    if (volumeSeriesRef.current && fullVolumeDataRef.current.length > 0) {
      volumeSeriesRef.current.setData(fullVolumeDataRef.current);
    }
    drawIndicatorOverlays(candlesRef.current);
  }, [indicatorData]);

  useEffect(() => {
    if (!liveCandle || liveCandle.symbol !== symbol || liveCandle.timeframe !== timeframe) return;
    const cs = candleSeriesRef.current;
    const vs = volumeSeriesRef.current;
    if (!cs || !vs) return;

    const candleTime = toLwtTime(liveCandle.timestamp);
    const candleData = { time: candleTime, open: liveCandle.open, high: liveCandle.high, low: liveCandle.low, close: liveCandle.close };
    const volumeData = { time: candleTime, value: liveCandle.volume, color: liveCandle.close >= liveCandle.open ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" };

    cs.update(candleData as any);
    vs.update(volumeData as any);

    const idx = fullCandleDataRef.current.findIndex((d) => d.time === candleTime);
    if (idx >= 0) {
      fullCandleDataRef.current[idx] = candleData;
      fullVolumeDataRef.current[idx] = volumeData;
    } else {
      fullCandleDataRef.current.push(candleData);
      fullVolumeDataRef.current.push(volumeData);
    }

    setOhlcv({ open: liveCandle.open, high: liveCandle.high, low: liveCandle.low, close: liveCandle.close, volume: liveCandle.volume });
  }, [liveCandle, symbol, timeframe]);

  const toggleFullscreen = useCallback(async () => {
    if (!chartWrapperRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await chartWrapperRef.current.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (chartRef.current && containerRef.current) {
        setTimeout(() => {
          if (!containerRef.current) return;
          chartRef.current!.resize(containerRef.current.clientWidth, fs ? window.innerHeight - 24 : 500);
        }, 100);
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const fetchIndicators = async () => {
      const newData = new Map<string, IndicatorData>();
      for (const ind of activeIndicators) {
        try {
          const data = await api.getIndicatorData(symbol, timeframe, ind.name, ind.params);
          newData.set(ind.id, data);
        } catch {}
      }
      setIndicatorData(newData);
    };
    fetchIndicators();
  }, [activeIndicators, symbol, timeframe]);

  const clearOverlays = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    overlaySeriesRefs.current.forEach((s) => chart.removeSeries(s));
    overlaySeriesRefs.current = [];
    indicatorSeriesRefs.current.forEach((s) => chart.removeSeries(s));
    indicatorSeriesRefs.current.clear();
  }, []);

  const drawIndicatorOverlays = useCallback((candles: Candle[]) => {
    const chart = chartRef.current;
    if (!chart) return;

    const currentIndicatorIds = new Set(indicatorSeriesRefs.current.keys());
    const newIndicatorIds = new Set(activeIndicators.map((i) => i.id));

    for (const id of currentIndicatorIds) {
      if (!newIndicatorIds.has(id)) {
        const series = indicatorSeriesRefs.current.get(id);
        if (series) chart.removeSeries(series);
        indicatorSeriesRefs.current.delete(id);
      }
    }

    for (const ind of activeIndicators) {
      const existing = indicatorSeriesRefs.current.get(ind.id);
      const indResult = indicatorData.get(ind.id);
      if (!indResult || !indResult.data.length) continue;

      const lineData: LineData[] = indResult.data
        .filter((p) => p.value !== undefined)
        .map((p) => ({
          time: toLwtTimeFromUnix(p.time),
          value: p.value!,
        }));

      if (!lineData.length) continue;

      if (existing) {
        existing.setData(lineData);
      } else {
        const title = `${ind.name.toUpperCase()} (${ind.params.period ?? ""})`;
        const series = chart.addSeries(LineSeries, {
          color: ind.color,
          lineWidth: 2,
          lastValueVisible: true,
          title,
        });
        series.setData(lineData);
        indicatorSeriesRefs.current.set(ind.id, series);
      }
    }
  }, [activeIndicators, indicatorData]);

  const drawOverlays = useCallback((candles: Candle[]) => {
    const chart = chartRef.current;
    if (!chart) return;

    if (showFib && candles.length > 0) {
      const swingHigh = findSwingHigh(candles);
      const swingLow = findSwingLow(candles);
      if (swingHigh && swingLow) {
        const diff = swingHigh.price - swingLow.price;
        FIB_LEVELS.forEach((level, i) => {
          const price = swingHigh.price - diff * level;
          const line = chart.addSeries(LineSeries, {
            color: FIB_COLORS[i],
            lineWidth: 1,
            lineStyle: 2,
            lastValueVisible: false,
            priceFormat: { type: "custom", formatter: (p: number) => `${(level * 100).toFixed(1)}% (${p.toFixed(2)})` },
          });
          line.setData(candles.map((c) => ({ time: toLwtTime(c.timestamp), value: price } as LineData)));
          overlaySeriesRefs.current.push(line);
        });
      }
    }

    if (showAnalysis && analysis && analysis.metadata && candles.length > 0) {
      const levels: { label: string; price: number; color: string }[] = [];
      for (const key of Object.keys(analysis.metadata)) {
        const val = analysis.metadata[key];
        if (typeof val === "number" && key !== "index" && !key.startsWith("fib_")) {
          levels.push({ label: key.replace(/_/g, " ").toUpperCase(), price: val, color: "#f59e0b" });
        }
        if (key.startsWith("fib_") && typeof val === "number") {
          levels.push({ label: `Fib ${key.split("_")[1]}`, price: val, color: "#a855f7" });
        }
      }
      if (analysis.stop_loss) levels.push({ label: "SL", price: analysis.stop_loss, color: "#ef4444" });
      if (analysis.take_profit) levels.push({ label: "TP", price: analysis.take_profit, color: "#22c55e" });
      if (analysis.metadata.swept_level && typeof analysis.metadata.swept_level === "number") {
        levels.push({ label: "Swept", price: analysis.metadata.swept_level as number, color: "#f97316" });
      }
      if (analysis.metadata.ob_low && typeof analysis.metadata.ob_low === "number" && analysis.metadata.ob_high && typeof analysis.metadata.ob_high === "number") {
        levels.push({ label: "OB Low", price: analysis.metadata.ob_low as number, color: "#06b6d4" });
        levels.push({ label: "OB High", price: analysis.metadata.ob_high as number, color: "#06b6d4" });
      }
      if (analysis.metadata.fvg_low && typeof analysis.metadata.fvg_low === "number" && analysis.metadata.fvg_high && typeof analysis.metadata.fvg_high === "number") {
        levels.push({ label: "FVG Low", price: analysis.metadata.fvg_low as number, color: "#8b5cf6" });
        levels.push({ label: "FVG High", price: analysis.metadata.fvg_high as number, color: "#8b5cf6" });
      }
      const unique = levels.filter((l, idx) => levels.findIndex((x) => x.price === l.price) === idx);
      for (const l of unique) {
        const line = chart.addSeries(LineSeries, { color: l.color, lineWidth: 1, lineStyle: 2, lastValueVisible: true, title: l.label });
        line.setData(candles.map((c) => ({ time: toLwtTime(c.timestamp), value: l.price } as LineData)));
        overlaySeriesRefs.current.push(line);
      }
    }

    if (openTrades?.length) {
      const trade = openTrades[0];
      if (trade.stop_loss) {
        const sl = chart.addSeries(LineSeries, { color: "#ef4444", lineWidth: 1, lineStyle: 2, lastValueVisible: true, title: "SL" });
        sl.setData(candles.map((c) => ({ time: toLwtTime(c.timestamp), value: trade.stop_loss! } as LineData)));
        overlaySeriesRefs.current.push(sl);
      }
      if (trade.take_profit) {
        const tp = chart.addSeries(LineSeries, { color: "#22c55e", lineWidth: 1, lineStyle: 2, lastValueVisible: true, title: "TP" });
        tp.setData(candles.map((c) => ({ time: toLwtTime(c.timestamp), value: trade.take_profit! } as LineData)));
        overlaySeriesRefs.current.push(tp);
      }
    }
  }, [showFib, showAnalysis, analysis, openTrades]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const overlaysToKeep: ISeriesApi<"Line">[] = [];
    overlaySeriesRefs.current.forEach((s) => {
      overlaysToKeep.push(s);
    });

    overlaySeriesRefs.current = overlaysToKeep;

    drawOverlays(candlesRef.current);
    drawIndicatorOverlays(candlesRef.current);
  }, [showFib, showAnalysis, analysis, drawOverlays, drawIndicatorOverlays]);

  useEffect(() => {
    if (!markersRef.current) return;
    const allMarkers: { time: Time; position: "aboveBar" | "belowBar"; color: string; shape: "arrowUp" | "arrowDown"; text: string }[] = [];
    if (trades?.length) {
      for (const t of trades) {
        allMarkers.push({
          time: toLwtTime(t.time),
          position: t.side === "LONG" ? "belowBar" : "aboveBar",
          color: t.side === "LONG" ? "#22c55e" : "#ef4444",
          shape: t.side === "LONG" ? "arrowUp" : "arrowDown",
          text: t.side === "LONG" ? "BUY" : "SELL",
        });
      }
    }
    if (analysis && analysis.signal !== "HOLD") {
      const lastCandle = candlesRef.current[candlesRef.current.length - 1];
      if (lastCandle) {
        allMarkers.push({
          time: toLwtTime(lastCandle.timestamp),
          position: analysis.signal === "BUY" ? "belowBar" : "aboveBar",
          color: analysis.signal === "BUY" ? "#22c55e" : "#ef4444",
          shape: analysis.signal === "BUY" ? "arrowUp" : "arrowDown",
          text: `${analysis.signal} (${(analysis.confidence * 100).toFixed(0)}%)`,
        });
      }
    }
    if (liveSignal) {
      const lastCandle = candlesRef.current[candlesRef.current.length - 1];
      if (lastCandle) {
        allMarkers.push({
          time: toLwtTime(lastCandle.timestamp),
          position: liveSignal.signal === "BUY" ? "belowBar" : "aboveBar",
          color: liveSignal.signal === "BUY" ? "#22c55e" : "#ef4444",
          shape: liveSignal.signal === "BUY" ? "arrowUp" : "arrowDown",
          text: `${liveSignal.strategy} ${liveSignal.signal}`,
        });
      }
    }
    markersRef.current.setMarkers(allMarkers);
  }, [trades, analysis, liveSignal]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={symbol} onValueChange={(v: string) => { setLoading(true); setSymbol(v); }}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYMBOLS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => { setLoading(true); setTimeframe(tf); }}
            >
              {tf}
            </Button>
          ))}
        </div>

        <div className="flex gap-1 ml-2">
          <Button variant={showFib ? "default" : "outline"} size="sm" className="h-8 px-2 text-xs" onClick={() => setShowFib(!showFib)}>
            Fib
          </Button>
          <Button variant={showAnalysis && !!analysis ? "default" : "outline"} size="sm" className="h-8 px-2 text-xs" onClick={() => setShowAnalysis(!showAnalysis)}>
            Levels
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-3 text-xs tabular-nums">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">O</span>
            <span className="font-medium">{ohlcv.open.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">H</span>
            <span className="font-medium text-emerald-500">{ohlcv.high.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">L</span>
            <span className="font-medium text-red-500">{ohlcv.low.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">C</span>
            <span className="font-medium">{ohlcv.close.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Vol</span>
            <span className="font-medium">{ohlcv.volume.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`font-medium ${priceChange.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {priceChange.change >= 0 ? "+" : ""}{priceChange.change.toFixed(2)}
              <span className="ml-0.5">({priceChange.percent >= 0 ? "+" : ""}{priceChange.percent.toFixed(2)}%)</span>
            </span>
          </div>
          <span className="flex items-center gap-1 text-emerald-500">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      <div ref={chartWrapperRef} className="rounded-xl border bg-card overflow-x-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Skeleton className="h-[500px] w-full rounded-xl" />
          </div>
        )}
        <div ref={containerRef} className="w-full" style={{ height: 500 }} />
      </div>
    </div>
  );
}
