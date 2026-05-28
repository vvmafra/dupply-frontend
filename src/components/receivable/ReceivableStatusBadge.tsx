import { Badge } from "@/components/ui/badge";
import {
  getReceivableStatusColor,
  getReceivableStatusLabel,
} from "@/domain/receivable/receivable.status";
import type { ReceivableStatus } from "@/domain/receivable/receivable.types";
import { cn } from "@/lib/utils";

interface ReceivableStatusBadgeProps {
  readonly status: ReceivableStatus;
  readonly className?: string;
  readonly interactive?: boolean;
}

export function ReceivableStatusBadge({
  status,
  className,
  interactive,
}: ReceivableStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        getReceivableStatusColor(status),
        "font-medium border",
        interactive && "cursor-pointer hover:opacity-90 underline-offset-2 hover:underline",
        className,
      )}
    >
      {getReceivableStatusLabel(status)}
    </Badge>
  );
}
