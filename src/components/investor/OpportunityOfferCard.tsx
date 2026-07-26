import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RISK_LEVEL_LABELS } from "@/domain/offer/offer.constants";
import {
  calcFundingProgress,
  calcMinProgress,
  calcRemainingQuotas,
} from "@/domain/offer/offer-economics.helpers";
import type { Offer } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatDateTime, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";

type OpportunityOfferCardProps = {
  offer: Offer;
};

export function OpportunityOfferCard({ offer }: OpportunityOfferCardProps) {
  const progress = calcFundingProgress(offer.raisedAmount, offer.targetAmount);
  const minMarker = calcMinProgress(offer.minAmount, offer.targetAmount);
  const remaining = calcRemainingQuotas(offer.quotaCount, offer.quotasSold);

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Oferta {offer.id.slice(-6)}</CardTitle>
          <Badge variant="secondary">Risco {RISK_LEVEL_LABELS[offer.riskLevel]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Retorno estimado {formatPercent(offer.estimatedInvestorReturnPercent)} · Cota{" "}
          {formatCurrencyBRL(offer.quotaPrice)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Alvo</span>
          <span className="font-medium">{formatCurrencyBRL(offer.targetAmount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Captado</span>
          <span className="font-medium">
            {formatCurrencyBRL(offer.raisedAmount)} ({formatPercent(progress, 0)})
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="relative">
            <Progress value={progress} />
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-foreground/50"
              style={{ left: `${minMarker}%` }}
              title="Mínimo de captação"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Mínimo {formatCurrencyBRL(offer.minAmount)} · {remaining} cotas restantes
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Encerra em {formatDateTime(offer.deadline)}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={ROUTES.investor.offerDetail(offer.id)}>Ver e investir</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
