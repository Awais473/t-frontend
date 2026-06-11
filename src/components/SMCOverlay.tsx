import { useEffect, useRef } from "react";
import {
  LineSeries,
  LineStyle,
  createSeriesMarkers,
} from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  LineData,
  Time,
} from "lightweight-charts";
import type { SMCData, SMCVisibility, SMCPoint } from "@/types/smc";

interface Props {
  chart: IChartApi | null;
  candleSeries: ISeriesApi<"Candlestick"> | null;
  smcData: SMCData | null;
  visibility: SMCVisibility;
}

const C = {
  sBull: "#089981",
  sBear: "#F23645",
  obBull: "rgba(49, 121, 245, 0.8)",
  obBear: "rgba(247, 124, 128, 0.8)",
  fvgBull: "rgba(0, 255, 104, 0.7)",
  fvgBear: "rgba(255, 0, 8, 0.7)",
  premium: "rgba(242, 54, 69, 0.25)",
  discount: "rgba(8, 153, 129, 0.25)",
  eqFill: "rgba(135, 139, 148, 0.3)",
  eq: "#878b94",
  eqhEql: "#2157f3",
  strHigh: "#F23645",
  strLow: "#089981",
};

function t(ts: number): Time {
  return ts as Time;
}

export function SMCOverlay({ chart, candleSeries, smcData, visibility }: Props) {
  const lineRefs = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const markersRef = useRef<ReturnType<typeof createSeriesMarkers<Time>> | null>(null);
  const markersCandleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chart || !candleSeries || !smcData) return;

    const cleanups: (() => void)[] = [];
    const active = new Map<string, ISeriesApi<"Line">>();
    const used = new Set<string>();

    function addLine(id: string, data: LineData[], opts: Record<string, unknown> = {}) {
      used.add(id);
      let s = lineRefs.current.get(id);
      if (!s) {
        s = chart!.addSeries(LineSeries, {
          lastValueVisible: false,
          priceLineVisible: false,
          ...opts,
        });
      } else {
        s.applyOptions(opts as any);
      }
      s.setData(data);
      active.set(id, s);
      cleanups.push(() => {
        try { chart!.removeSeries(s!); } catch {}
      });
    }

    const nowSec = Date.now() / 1000;

    if (visibility.swing_structure) {
      for (const s of smcData.structures.swing) {
        addLine(`sw_s_${s.time}_${s.tag}`, [
          { time: t(s.time), value: s.price },
          { time: t(nowSec), value: s.price },
        ], { color: s.bias === "bullish" ? C.sBull : C.sBear, lineWidth: 1, lineStyle: LineStyle.Solid, title: s.tag });
      }
    }

    if (visibility.internal_structure) {
      for (const s of smcData.structures.internal) {
        addLine(`in_s_${s.time}_${s.tag}`, [
          { time: t(s.time), value: s.price },
          { time: t(nowSec), value: s.price },
        ], { color: s.bias === "bullish" ? C.sBull : C.sBear, lineWidth: 1, lineStyle: LineStyle.Dashed, title: s.tag });
      }
    }

    if (visibility.eqh_eql) {
      for (const eq of smcData.eqh_eql) {
        addLine(`eq_${eq.time}_${eq.type}`, [
          { time: t(eq.time), value: eq.price },
          { time: t(eq.matched_time), value: eq.matched_price },
        ], { color: C.eqhEql, lineWidth: 1, lineStyle: LineStyle.Dotted, title: eq.type });
      }
    }

    if (visibility.strong_weak) {
      const sw = smcData.strong_weak;
      if (sw.strong_high) addLine("sw_sh", [
        { time: t(sw.strong_high.time), value: sw.strong_high.price },
        { time: t(nowSec), value: sw.strong_high.price },
      ], { color: C.strHigh, lineWidth: 1, title: "Strong High" });
      if (sw.strong_low) addLine("sw_sl", [
        { time: t(sw.strong_low.time), value: sw.strong_low.price },
        { time: t(nowSec), value: sw.strong_low.price },
      ], { color: C.strLow, lineWidth: 1, title: "Strong Low" });
      if (sw.weak_high) addLine("sw_wh", [
        { time: t(sw.weak_high.time), value: sw.weak_high.price },
        { time: t(nowSec), value: sw.weak_high.price },
      ], { color: C.sBull, lineWidth: 1, title: "Weak High" });
      if (sw.weak_low) addLine("sw_wl", [
        { time: t(sw.weak_low.time), value: sw.weak_low.price },
        { time: t(nowSec), value: sw.weak_low.price },
      ], { color: C.sBear, lineWidth: 1, title: "Weak Low" });
    }

    if (visibility.zones && smcData.zones.equilibrium) {
      addLine("z_eq", [
        { time: t(nowSec - 86400), value: smcData.zones.equilibrium.price },
        { time: t(nowSec), value: smcData.zones.equilibrium.price },
      ], { color: C.eq, lineWidth: 1, lineStyle: LineStyle.Dashed, title: "EQ" });
    }

    if (visibility.mtf_levels) {
      for (const [tf, d] of Object.entries(smcData.mtf_levels)) {
        if (d.high) addLine(`mtf_${tf}_h`, [
          { time: t(d.high.time), value: d.high.price },
          { time: t(nowSec), value: d.high.price },
        ], { color: C.sBear, lineWidth: 1, lineStyle: LineStyle.Dashed, title: `${tf.toUpperCase()} H` });
        if (d.low) addLine(`mtf_${tf}_l`, [
          { time: t(d.low.time), value: d.low.price },
          { time: t(nowSec), value: d.low.price },
        ], { color: C.sBull, lineWidth: 1, lineStyle: LineStyle.Dashed, title: `${tf.toUpperCase()} L` });
      }
    }

    // Remove stale lines
    for (const id of lineRefs.current.keys()) {
      if (!used.has(id)) {
        const s = lineRefs.current.get(id);
        if (s) try { chart.removeSeries(s); } catch {}
        lineRefs.current.delete(id);
      }
    }
    for (const [id, s] of active) lineRefs.current.set(id, s);

    // Swing point markers
    if (visibility.swing_points && smcData.swing_points.length > 0) {
      if (!markersRef.current || markersCandleRef.current !== candleSeries) {
        if (markersRef.current) markersRef.current.setMarkers([]);
        markersRef.current = createSeriesMarkers(candleSeries);
        markersCandleRef.current = candleSeries;
      }
      markersRef.current.setMarkers(smcData.swing_points.map((sp: SMCPoint) => ({
        time: t(sp.time),
        position: sp.bias === "bullish" ? "belowBar" : "aboveBar",
        color: sp.bias === "bullish" ? C.sBull : C.sBear,
        shape: sp.bias === "bullish" ? "arrowUp" : "arrowDown",
        text: sp.type,
        size: 1,
      })));
    } else if (markersRef.current) {
      markersRef.current.setMarkers([]);
    }

    // Box primitive for OB / FVG / zone fills
    if (visibility.internal_order_blocks || visibility.swing_order_blocks || visibility.fvg || visibility.zones) {
      const primitive = createBoxPrimitive(smcData, visibility, nowSec);
      (candleSeries as any).attachPrimitive(primitive);
      cleanups.push(() => {
        try { (candleSeries as any).detachPrimitive(primitive); } catch {}
      });
    }

    return () => {
      for (const fn of cleanups) fn();
      lineRefs.current.clear();
      if (markersRef.current) markersRef.current.setMarkers([]);
    };
  }, [chart, candleSeries, smcData, visibility]);

  return null;
}

function createBoxPrimitive(smcData: SMCData, vis: SMCVisibility, nowSec: number) {
  let boxes: Array<{ x1: number; x2: number; y1: number; y2: number; color: string; stroke?: boolean }> = [];
  let chartRef: IChartApi | null = null;
  let seriesRef: ISeriesApi<"Line"> | null = null;

  return {
    attached(param: any) {
      chartRef = param.chart;
      seriesRef = param.series;
    },
    detached() {},
    updateAllViews() {
      boxes = [];
      if (!chartRef || !seriesRef) return;
      const ts = chartRef.timeScale();
      const ps = seriesRef;

      function toX(tm: number) { return ts.timeToCoordinate(tm as Time); }
      function toY(p: number) { return ps.priceToCoordinate(p); }

      const fullW = ts.width() as number;

      if (vis.internal_order_blocks) {
        for (const ob of smcData.order_blocks.internal) {
          const x1 = toX(ob.start_time);
          const y1 = toY(ob.high);
          const y2 = toY(ob.low);
          if (x1 != null && y1 != null && y2 != null) {
            boxes.push({ x1, x2: fullW, y1: Math.min(y1, y2), y2: Math.max(y1, y2), color: ob.bias === "bullish" ? C.obBull : C.obBear });
          }
        }
      }
      if (vis.swing_order_blocks) {
        for (const ob of smcData.order_blocks.swing) {
          const x1 = toX(ob.start_time);
          const y1 = toY(ob.high);
          const y2 = toY(ob.low);
          if (x1 != null && y1 != null && y2 != null) {
            boxes.push({ x1, x2: fullW, y1: Math.min(y1, y2), y2: Math.max(y1, y2), color: ob.bias === "bullish" ? C.obBull : C.obBear, stroke: true });
          }
        }
      }
      if (vis.fvg) {
        for (const f of smcData.fvgs) {
          const x1 = toX(f.start_time);
          const x2 = toX(f.end_time);
          const y1 = toY(f.top);
          const y2 = toY(f.bottom);
          if (x1 != null && x2 != null && y1 != null && y2 != null) {
            const midY = (y1 + y2) / 2;
            const c = f.bias === "bullish" ? C.fvgBull : C.fvgBear;
            boxes.push({ x1, x2, y1: Math.min(y1, midY), y2: Math.max(y1, midY), color: c, stroke: true });
            boxes.push({ x1, x2, y1: Math.min(midY, y2), y2: Math.max(midY, y2), color: c, stroke: true });
          }
        }
      }
      if (vis.zones) {
        const z = smcData.zones;
        if (z.premium) {
          const y1 = toY(z.premium.top);
          const y2 = toY(z.premium.bottom);
          if (y1 != null && y2 != null) {
            boxes.push({ x1: 0, x2: fullW, y1: Math.min(y1, y2), y2: Math.max(y1, y2), color: C.premium });
          }
        }
        if (z.discount) {
          const y1 = toY(z.discount.top);
          const y2 = toY(z.discount.bottom);
          if (y1 != null && y2 != null) {
            boxes.push({ x1: 0, x2: fullW, y1: Math.min(y1, y2), y2: Math.max(y1, y2), color: C.discount });
          }
        }
        if (z.equilibrium) {
          const p = z.equilibrium.price;
          const range = (z.premium?.top ?? p) - (z.discount?.bottom ?? p);
          const halfThickness = Math.max(range * 0.02, (z.premium?.top ?? p) * 0.003);
          const eqY1 = toY(p + halfThickness);
          const eqY2 = toY(p - halfThickness);
          if (eqY1 != null && eqY2 != null) {
            boxes.push({ x1: 0, x2: fullW, y1: Math.min(eqY1, eqY2), y2: Math.max(eqY1, eqY2), color: C.eqFill });
          }
        }
      }
    },
    paneViews() {
      return [
        {
          zOrder: () => "bottom" as const,
          renderer: () => ({
            draw: (target: any) => {
              target.useMediaCoordinateSpace((scope: any) => {
                const ctx = scope.context as CanvasRenderingContext2D;
                for (const bx of boxes) {
                  ctx.fillStyle = bx.color;
                  ctx.fillRect(bx.x1, bx.y1, bx.x2 - bx.x1, bx.y2 - bx.y1);
                  if (bx.stroke) {
                    ctx.strokeStyle = bx.color;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(bx.x1, bx.y1, bx.x2 - bx.x1, bx.y2 - bx.y1);
                  }
                }
              });
            },
          }),
        },
      ];
    },
  };
}
