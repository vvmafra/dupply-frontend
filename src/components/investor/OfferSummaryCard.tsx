import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RISK_LEVEL_LABELS } from "@/domain/offer/offer.constants";
import {
  calcFundingProgress,
  calcMinProgress,
  calcRemainingQuotas,
} from "@/domain/offer/offer-economics.helpers";
import type { Offer, RiskLevel } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatDateTime, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "text-emerald-400 border-emerald-400/40",
  medium: "text-amber-400 border-amber-400/40",
  high: "text-red-500 border-red-500/40",
};

export function OfferSummaryCard({ offer }: Readonly<{ offer: Offer }>) {
  const progress = calcFundingProgress(offer.raisedAmount, offer.targetAmount);
  const minMarker = calcMinProgress(offer.minAmount, offer.targetAmount);
  const remaining = calcRemainingQuotas(offer.quotaCount, offer.quotasSold);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Resumo da Oferta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Nível de risco</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "font-semibold cursor-help border-b border-dashed",
                    RISK_LEVEL_COLORS[offer.riskLevel],
                  )}
                >
                  {RISK_LEVEL_LABELS[offer.riskLevel]}
                </span>
              </TooltipTrigger>
              <TooltipContent className="w-64 text-center">
                Meramente ilustrativo, trata-se de uma análise da Dupply.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Retorno estimado</span>
          <span className="font-medium text-emerald-400">
            {formatPercent(offer.estimatedInvestorReturnPercent)} a.a.
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Preço da cota</span>
          <span className="text-white">{formatCurrencyBRL(offer.quotaPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Alvo / mínimo</span>
          <span className="text-white">
            {formatCurrencyBRL(offer.targetAmount)} / {formatCurrencyBRL(offer.minAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Captado</span>
          <span className="text-white">
            {formatCurrencyBRL(offer.raisedAmount)} · {remaining} cotas restantes
          </span>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="relative">
            <Progress value={progress} className="h-2" />
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/50"
              style={{ left: `${minMarker}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Prazo final</span>
          <span className="text-white">{formatDateTime(offer.deadline)}</span>
        </div>
        {offer.status === "disbursed" && offer.fidcBackfillAmount > 0 && (
          <div className="rounded-md bg-muted/40 p-3 space-y-1 border border-border/60">
            <p className="font-medium text-white">Captação híbrida realizada</p>
            <p className="text-muted-foreground">
              Investidores: {formatCurrencyBRL(offer.raisedAmount)} · FIDC:{" "}
              {formatCurrencyBRL(offer.fidcBackfillAmount)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
