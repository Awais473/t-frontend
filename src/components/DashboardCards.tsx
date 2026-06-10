import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StrategyRanking, Trade } from "@/types";
import { StrategyComparison } from "./StrategyComparison";

interface Props {
  rankings: StrategyRanking[];
  trades: Trade[];
  metrics: Record<string, unknown>;
  filterDays: number | undefined;
  onFilterChange: (days: number | undefined) => void;
}

const DATE_FILTERS = [
  { label: "All", value: undefined },
  { label: "24h", value: 1 },
  { label: "5d", value: 5 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

export function DashboardCards({ rankings, trades, metrics, filterDays, onFilterChange }: Props) {
  const totalPnl = rankings.reduce((s, r) => s + r.total_pnl, 0);
  const avgWinRate = rankings.length > 0
    ? rankings.reduce((s, r) => s + r.win_rate, 0) / rankings.length
    : 0;
  const openTrades = trades.filter((t) => t.status === "OPEN").length;
  const closedTrades = trades.filter((t) => t.status === "CLOSED").length;
  const bestStrategy = rankings.length > 0 ? rankings.reduce((a, b) => (a.score > b.score ? a : b)) : null;

  const profitFactor = metrics.profit_factor as number | undefined;
  const avgRr = metrics.avg_rr as number | undefined;
  const totalTrades = metrics.total_trades as number | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {DATE_FILTERS.map((f) => (
          <Button
            key={f.label}
            variant={filterDays === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PnL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              ${totalPnl.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Across all strategies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWinRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{profitFactor !== undefined ? `Profit Factor: ${profitFactor.toFixed(2)}` : "Across all strategies"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedTrades}</div>
            <p className="text-xs text-muted-foreground">
              {totalTrades !== undefined ? `${totalTrades} total` : ""}
              {openTrades > 0 ? ` (${openTrades} open)` : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg R:R</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRr !== undefined ? avgRr.toFixed(2) : "—"}</div>
            <p className="text-xs text-muted-foreground">
              {bestStrategy ? `Best: ${bestStrategy.name.replace(/_/g, " ")}` : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <StrategyComparison rankings={rankings} />
    </div>
  );
}
