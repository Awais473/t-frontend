import type { StrategyRanking as Ranking } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  rankings: Ranking[];
}

export function StrategyRanking({ rankings }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Strategy Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Profit Factor</TableHead>
              <TableHead>Total PnL</TableHead>
              <TableHead>Max DD</TableHead>
              <TableHead>Sharpe</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-mono">{r.rank}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.win_rate}%</TableCell>
                <TableCell>{r.profit_factor}</TableCell>
                <TableCell>
                  <span className={r.total_pnl >= 0 ? "text-emerald-500" : "text-red-500"}>
                    ${r.total_pnl.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>{r.max_drawdown}%</TableCell>
                <TableCell>{r.sharpe_ratio}</TableCell>
                <TableCell>
                  <Badge variant={r.score >= 70 ? "default" : "secondary"}>{r.score}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {rankings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No data yet. Run a backtest first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
