import type { StrategyInfo } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  strategy: StrategyInfo;
  performance: { win_rate: number; total_pnl: number } | null;
}

export function StrategyCard({ strategy, performance }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base capitalize">{strategy.name.replace(/_/g, " ")}</CardTitle>
          {performance && (
            <Badge variant={performance.total_pnl >= 0 ? "success" : "destructive"}>
              {performance.total_pnl >= 0 ? "+" : ""}${performance.total_pnl.toFixed(0)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{strategy.description}</p>
        {performance && (
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-muted-foreground">
              Win Rate: <span className="text-foreground font-medium">{performance.win_rate}%</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
