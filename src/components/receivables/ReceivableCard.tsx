import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReceivableStatusBadge } from "./ReceivableStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ScoreBadge } from "./ScoreBadge";
import { formatCurrencyBRL, formatDate, formatPercent } from "@/lib/formatters";
import type { Receivable } from "@/domain/receivables/receivable.types";

interface ReceivableCardProps {
  receivable: Receivable;
  detailHref: string;
  showAvailable?: boolean;
}

export function ReceivableCard({ receivable: r, detailHref, showAvailable = false }: ReceivableCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="font-semibold text-sm">{r.sellerName}</p>
            <p className="text-xs text-muted-foreground">Sacado: {r.debtorName}</p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <ReceivableStatusBadge status={r.status} />
            <RiskBadge risk={r.risk} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Valor da operação</p>
            <p className="font-semibold">{formatCurrencyBRL(r.grossAmount)}</p>
          </div>
          {showAvailable && (
            <div>
              <p className="text-xs text-muted-foreground">Disponível</p>
              <p className="font-semibold text-primary">{formatCurrencyBRL(r.availableAmount)}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Taxa estimada</p>
            <p className="font-semibold">{formatPercent(r.estimatedRate)}/mês</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vencimento</p>
            <p className="font-semibold">{formatDate(r.dueDate)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Score</span>
            <ScoreBadge score={r.score} />
            <span className="text-xs text-muted-foreground">{r.termInDays}d</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={detailHref}>
              Ver oportunidade
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
