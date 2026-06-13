import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";
import type { IChartApi, ISeriesApi, Time } from "lightweight-charts";
import { api } from "@/api/client";
import type { WsCandle } from "@/hooks/useWebSocket";

interface Props {
  liveCandle?: WsCandle | null;
}

function toLwtTime(ts: string): Time {
  return (new Date(ts).getTime() / 1000) as Time;
}

export function SidebarChart({ liveCandle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const candleDataRef = useRef<{ time: Time; open: number; high: number; low: number; close: number }[]>([]);
  const volumeDataRef = useRef<{ time: Time; value: number; color: string }[]>([]);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#0f1115" },
        textColor: "#a0a0a0",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: { mode: 0 },
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

    const handleResize = () => {
      chart.resize(container.clientWidth, height);
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCandles("BTCUSDT", "1h", 100);
        const cs = candleSeriesRef.current;
        const vs = volumeSeriesRef.current;
        if (!data.candles.length || !cs || !vs) return;
        candleDataRef.current = data.candles.map((c) => ({
          time: toLwtTime(c.timestamp),
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        volumeDataRef.current = data.candles.map((c) => ({
          time: toLwtTime(c.timestamp),
          value: c.volume,
          color: c.close >= c.open ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
        }));
        cs.setData(candleDataRef.current);
        vs.setData(volumeDataRef.current);
        chartRef.current?.timeScale().fitContent();
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (!liveCandle || liveCandle.symbol !== "BTCUSDT") return;
    const cs = candleSeriesRef.current;
    const vs = volumeSeriesRef.current;
    if (!cs || !vs) return;
    const time = toLwtTime(liveCandle.timestamp);
    const candle = { time, open: liveCandle.open, high: liveCandle.high, low: liveCandle.low, close: liveCandle.close };
    const volume = { time, value: liveCandle.volume, color: liveCandle.close >= liveCandle.open ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" };
    cs.update(candle as any);
    vs.update(volume as any);
    const idx = candleDataRef.current.findIndex((d) => d.time === time);
    if (idx >= 0) {
      candleDataRef.current[idx] = candle;
      volumeDataRef.current[idx] = volume;
    } else {
      candleDataRef.current.push(candle);
      volumeDataRef.current.push(volume);
    }
  }, [liveCandle]);

  return (
    <div ref={containerRef} className="w-full" style={{ height }} />
  );
}
