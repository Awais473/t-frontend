import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StrategyRanking } from "@/types";

interface Props {
  rankings: StrategyRanking[];
}

const medals = ["🥇", "🥈", "🥉"];

export function StrategyComparison({ rankings }: Props) {
  if (rankings.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">Profit Factor</TableHead>
              <TableHead className="text-right">Sharpe</TableHead>
              <TableHead className="text-right">Avg R:R</TableHead>
              <TableHead className="text-right">Max DD</TableHead>
              <TableHead className="text-right">Consec W/L</TableHead>
              <TableHead className="text-right">Trades</TableHead>
              <TableHead className="text-right">PnL</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="text-lg">{medals[r.rank - 1] || r.rank}</TableCell>
                <TableCell className="font-medium">{r.name.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-right">{r.win_rate.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{r.profit_factor.toFixed(2)}</TableCell>
                <TableCell className="text-right">{r.sharpe_ratio.toFixed(2)}</TableCell>
                <TableCell className="text-right">{r.avg_rr.toFixed(2)}</TableCell>
                <TableCell className="text-right">{r.max_drawdown.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className="text-emerald-500">{r.consecutive_wins}</span>/
                  <span className="text-red-500">{r.consecutive_losses}</span>
                </TableCell>
                <TableCell className="text-right">{r.total_trades}</TableCell>
                <TableCell className={`text-right font-medium ${r.total_pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  ${r.total_pnl.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={r.score >= 50 ? "default" : "secondary"}>{r.score.toFixed(0)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
