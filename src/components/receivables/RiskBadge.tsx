import { Badge } from "@/components/ui/badge";
import { getRiskLabel, getRiskColor } from "@/domain/receivables/receivable.helpers";
import type { RiskLevel } from "@/domain/receivables/receivable.types";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getRiskColor(risk), "font-medium border", className)}
    >
      {getRiskLabel(risk)}
    </Badge>
  );
}
