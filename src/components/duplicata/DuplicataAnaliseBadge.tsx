import { Badge } from "@/components/ui/badge";
import {
  getDuplicataAnaliseColor,
  getDuplicataAnaliseLabel,
} from "@/domain/duplicata/duplicata-analise.constants";
import type { DuplicataAnaliseAnalista } from "@/domain/duplicata/duplicata.types";
import { cn } from "@/lib/utils";

interface DuplicataAnaliseBadgeProps {
  readonly status: DuplicataAnaliseAnalista;
  readonly className?: string;
  readonly feminine?: boolean;
}

export function DuplicataAnaliseBadge({ status, className, feminine }: DuplicataAnaliseBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getDuplicataAnaliseColor(status), "font-medium border", className)}
    >
      {getDuplicataAnaliseLabel(status, { feminine })}
    </Badge>
  );
}
