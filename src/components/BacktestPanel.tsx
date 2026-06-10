import { useState } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BacktestResult, StrategyInfo } from "@/types";

interface Props {
  strategies: StrategyInfo[];
}

export function BacktestPanel({ strategies }: Props) {
  const [strategy, setStrategy] = useState("");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!strategy) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.runBacktest({
        strategy_name: strategy,
        symbol,
        timeframe: "1h",
        limit: 500,
        initial_capital: 10000,
      });
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Backtest</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={strategy} onValueChange={setStrategy}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              {strategies.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="flex h-9 w-28 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            placeholder="Symbol"
          />
          <Button onClick={run} disabled={!strategy || loading}>
            {loading ? "Running..." : "Run"}
          </Button>
        </div>

        {result && (
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Trades" value={result.total_trades} />
            <Metric label="Win Rate" value={`${result.win_rate}%`} />
            <Metric label="Profit Factor" value={result.profit_factor} />
            <Metric
              label="Total PnL"
              value={`$${result.total_pnl}`}
              className={result.total_pnl >= 0 ? "text-emerald-500" : "text-red-500"}
            />
            <Metric label="Max DD" value={`${result.max_drawdown}%`} />
            <Metric label="Sharpe" value={result.sharpe_ratio} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-lg font-semibold ${className ?? ""}`}>{value}</div>
    </div>
  );
}
