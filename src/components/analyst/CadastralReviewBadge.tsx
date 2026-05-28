import { Badge } from "@/components/ui/badge";
import {
  CADASTRAL_REVIEW_COLORS,
  CADASTRAL_REVIEW_LABELS,
  type CadastralReviewDisplayStatus,
} from "@/domain/risk-analyst/seller-cadastral-review.helpers";
import { cn } from "@/lib/utils";

interface CadastralReviewBadgeProps {
  readonly status: CadastralReviewDisplayStatus;
  readonly className?: string;
}

export function CadastralReviewBadge({ status, className }: CadastralReviewBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(CADASTRAL_REVIEW_COLORS[status], "font-medium border", className)}
    >
      {CADASTRAL_REVIEW_LABELS[status]}
    </Badge>
  );
}
