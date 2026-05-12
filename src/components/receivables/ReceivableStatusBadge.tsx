import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusColor } from "@/domain/receivables/receivable.helpers";
import type { ReceivableStatus } from "@/domain/receivables/receivable.types";
import { cn } from "@/lib/utils";

interface ReceivableStatusBadgeProps {
  status: ReceivableStatus;
  className?: string;
}

export function ReceivableStatusBadge({ status, className }: ReceivableStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getStatusColor(status), "font-medium border", className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
