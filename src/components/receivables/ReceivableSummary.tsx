import { Building2, Calendar, DollarSign, Percent, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReceivableStatusBadge } from "./ReceivableStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ScoreBadge } from "./ScoreBadge";
import { formatCurrencyBRL, formatDate, formatTaxId, formatPercent } from "@/lib/formatters";
import type { Receivable } from "@/domain/receivables/receivable.types";

interface ReceivableSummaryProps {
  receivable: Receivable;
}

export function ReceivableSummary({ receivable: r }: ReceivableSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg font-mono">{r.tradeNoteNumber}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">NF {r.invoiceNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ReceivableStatusBadge status={r.status} />
            <RiskBadge risk={r.risk} />
            <ScoreBadge score={r.score} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3.5" />
              Cedente
            </div>
            <p className="font-medium">{r.sellerName}</p>
            <p className="text-xs text-muted-foreground">{formatTaxId(r.sellerTaxId)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="size-3.5" />
              Sacado
            </div>
            <p className="font-medium">{r.debtorName}</p>
            <p className="text-xs text-muted-foreground">{formatTaxId(r.debtorTaxId)}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="size-3.5" />
              Valor bruto
            </div>
            <p className="font-semibold">{formatCurrencyBRL(r.grossAmount)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="size-3.5" />
              Valor líquido est.
            </div>
            <p className="font-semibold text-success">{formatCurrencyBRL(r.estimatedNetAmount)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Percent className="size-3.5" />
              Taxa estimada
            </div>
            <p className="font-semibold">{formatPercent(r.estimatedRate)}/mês</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Hash className="size-3.5" />
              Prazo
            </div>
            <p className="font-semibold">{r.termInDays} dias</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              Data de emissão
            </div>
            <p className="font-medium">{formatDate(r.issueDate)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              Vencimento
            </div>
            <p className="font-medium">{formatDate(r.dueDate)}</p>
          </div>
        </div>
        {r.description && (
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
            {r.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
