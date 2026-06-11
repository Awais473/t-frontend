import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SMCVisibility } from "@/types/smc";

interface Props {
  visibility: SMCVisibility;
  onChange: (v: SMCVisibility) => void;
  onClose: () => void;
}

const TOGGLES: { key: keyof SMCVisibility; label: string }[] = [
  { key: "swing_structure", label: "Swing Structure (BOS/CHoCH)" },
  { key: "internal_structure", label: "Internal Structure" },
  { key: "swing_points", label: "Swing Points (HH/HL/LH/LL)" },
  { key: "strong_weak", label: "Strong/Weak High/Low" },
  { key: "internal_order_blocks", label: "Internal Order Blocks" },
  { key: "swing_order_blocks", label: "Swing Order Blocks" },
  { key: "fvg", label: "Fair Value Gaps" },
  { key: "eqh_eql", label: "Equal Highs/Lows" },
  { key: "zones", label: "Premium/Discount Zones" },
  { key: "mtf_levels", label: "MTF Levels (D/W/M)" },
  { key: "trend_candles", label: "Color Candles (Trend)" },
];

export function SMCPanel({ visibility, onChange, onClose }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">SMC Indicator</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="size-3" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {TOGGLES.map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              className="accent-primary size-3.5"
              checked={visibility[key]}
              onChange={(e) =>
                onChange({ ...visibility, [key]: e.target.checked })
              }
            />
            {label}
          </label>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: "#089981" }} />
          Bullish
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full" style={{ backgroundColor: "#F23645" }} />
          Bearish
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm" style={{ backgroundColor: "rgba(49,121,245,0.8)" }} />
          Int OB Bull
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm" style={{ backgroundColor: "rgba(247,124,128,0.8)" }} />
          Int OB Bear
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm" style={{ backgroundColor: "rgba(24,72,204,0.8)" }} />
          OB Bull
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm" style={{ backgroundColor: "rgba(178,40,51,0.8)" }} />
          OB Bear
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm" style={{ backgroundColor: "rgba(0,255,104,0.7)" }} />
          FVG Bull
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-sm" style={{ backgroundColor: "rgba(255,0,8,0.7)" }} />
          FVG Bear
        </span>
      </div>
    </div>
  );
}
