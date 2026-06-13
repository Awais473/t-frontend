import { useState } from "react";
import { RefreshCw, Radio, RadioTower } from "lucide-react";
import { TradingChart } from "@/components/TradingChart";
import { Button } from "@/components/ui/button";
import type { WsCandle, WsSignal } from "@/hooks/useWebSocket";

interface Props {
  liveCandle?: WsCandle | null;
  liveSignal?: WsSignal | null;
}

export function BtcPage({ liveCandle, liveSignal }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveMode, setLiveMode] = useState(true);

  return (
    <div className="space-y-6 min-w-0">
      <TradingChart
        refreshKey={refreshKey}
        liveCandle={liveMode ? liveCandle : undefined}
        liveSignal={liveMode ? liveSignal : undefined}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border p-4">
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
