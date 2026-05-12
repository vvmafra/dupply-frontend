import { Badge } from "@/components/ui/badge";
import { getScoreColor } from "@/domain/receivables/receivable.helpers";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getScoreColor(score), "font-mono font-bold border", className)}
    >
      {score}
    </Badge>
  );
}
