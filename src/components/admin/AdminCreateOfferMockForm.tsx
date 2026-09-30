import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { DEFAULT_PLATFORM_SPREAD_PERCENT } from "@/domain/offer/offer.constants";
import {
  calcDefaultTargetAmount,
  calcEstimatedInvestorReturnPercent,
  snapTargetToQuotas,
} from "@/domain/offer/offer-economics.helpers";
import { createOfferFormSchema } from "@/domain/offer/offer.schema";
import type { Offer } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { createOffer } from "@/services/offer.service";

function defaultDeadlineIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

/** Mock mode: the prototype's quota-based offer (price, floor, deadline, spread). */
export function AdminCreateOfferMockForm({
  duplicata,
  onCreated,
}: Readonly<{ duplicata: DuplicataTitulo; onCreated: (offer: Offer) => void }>) {
  const analystDiscount = duplicata.descontoAntecipacaoPercent ?? 0;

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [quotaPrice, setQuotaPrice] = useState(1000);
  const [platformSpreadPercent, setPlatformSpreadPercent] = useState(DEFAULT_PLATFORM_SPREAD_PERCENT);
  const [minAmount, setMinAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(0);
  const [deadline, setDeadline] = useState(defaultDeadlineIso);

  // Pre-fill target / minimum from the analyst discount.
  useEffect(() => {
    const target = calcDefaultTargetAmount(duplicata.valor, analystDiscount);
    setTargetAmount(Math.round(target * 100) / 100);
    setMinAmount(Math.round(target * 0.6 * 100) / 100);
  }, [duplicata.valor, analystDiscount]);

  const estimatedReturn = useMemo(
    () => calcEstimatedInvestorReturnPercent(analystDiscount, platformSpreadPercent),
    [analystDiscount, platformSpreadPercent],
  );
  const snapped = useMemo(
    () => (quotaPrice > 0 ? snapTargetToQuotas(targetAmount, quotaPrice) : null),
    [targetAmount, quotaPrice],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = createOfferFormSchema(analystDiscount).safeParse({
      quotaPrice,
      minAmount,
      targetAmount,
      platformSpreadPercent,
      deadline,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const offer = await createOffer({
        duplicataId: duplicata.id,
        quotaPrice: parsed.data.quotaPrice,
        minAmount: parsed.data.minAmount,
        targetAmount: parsed.data.targetAmount,
        platformSpreadPercent: parsed.data.platformSpreadPercent,
        deadline: parsed.data.deadline,
      });
      onCreated(offer);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Não foi possível criar a oferta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pré-preenchido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between sm:block">
            <p className="text-muted-foreground">Valor de face</p>
            <p className="font-medium">{formatCurrencyBRL(duplicata.valor)}</p>
          </div>
          <div className="flex justify-between sm:block">
            <p className="text-muted-foreground">Deságio do analista</p>
            <p className="font-medium">{formatPercent(analystDiscount)}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="quotaPrice">Preço da cota (R$)</Label>
          <Input id="quotaPrice" type="number" min={1} step={1} value={quotaPrice} onChange={(e) => setQuotaPrice(Number(e.target.value))} />
          {fieldErrors.quotaPrice && <p className="text-sm text-destructive">{fieldErrors.quotaPrice}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="targetAmount">Valor alvo (R$)</Label>
          <Input id="targetAmount" type="number" min={1} step="any" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} />
          {snapped && (
            <p className="text-xs text-muted-foreground">
              Será ajustado para {formatCurrencyBRL(snapped.targetAmount)} ({snapped.quotaCount} cotas)
            </p>
          )}
          {fieldErrors.targetAmount && <p className="text-sm text-destructive">{fieldErrors.targetAmount}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minAmount">Mínimo de captação (R$)</Label>
          <Input id="minAmount" type="number" min={1} step="any" value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} />
          {fieldErrors.minAmount && <p className="text-sm text-destructive">{fieldErrors.minAmount}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="platformSpreadPercent">Spread da plataforma (%)</Label>
          <Input
            id="platformSpreadPercent"
            type="number"
            min={0}
            max={analystDiscount}
            step={0.1}
            value={platformSpreadPercent}
            onChange={(e) => setPlatformSpreadPercent(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Retorno estimado ao investidor:{" "}
            <span className="font-medium text-foreground">{formatPercent(estimatedReturn)}</span>
            {estimatedReturn === 0 && " (aviso: spread igual ao deságio)"}
          </p>
          {fieldErrors.platformSpreadPercent && (
            <p className="text-sm text-destructive">{fieldErrors.platformSpreadPercent}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deadline">Prazo da oferta</Label>
          <Input id="deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          {fieldErrors.deadline && <p className="text-sm text-destructive">{fieldErrors.deadline}</p>}
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Publicar oferta"
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to={ROUTES.admin.offers.ready}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
