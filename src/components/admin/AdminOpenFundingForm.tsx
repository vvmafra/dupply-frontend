import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { createOpenFundingFormSchema } from "@/domain/offer/open-funding.schema";
import type { Offer } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatMonthlyRate, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { openFunding } from "@/services/offer.service";

/**
 * HTTP mode: `confirmed → funding`. The target is the value proposed by the analyst
 * and accepted by the seller; rate and ticket start from the analyst's terms and can be
 * overridden here (`POST /v1/admin/receivables/:id/open-funding`).
 */
export function AdminOpenFundingForm({
  duplicata,
  onOpened,
}: Readonly<{ duplicata: DuplicataTitulo; onOpened: (offer: Offer) => void }>) {
  const targetAmount = duplicata.valorLiquidoAntecipacao ?? duplicata.valor;
  // Round to avoid 0.018 * 100 = 1.7999999999999998 (which also trips native step validation).
  const analystRatePercent = Number(((duplicata.yieldRateMonthly ?? 0) * 100).toFixed(4));
  const analystTicket = duplicata.minInvestment ?? 0;

  const [yieldRateMonthlyPercent, setYieldRateMonthlyPercent] = useState(String(analystRatePercent));
  const [minInvestment, setMinInvestment] = useState(String(analystTicket));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = createOpenFundingFormSchema(targetAmount).safeParse({
      yieldRateMonthlyPercent,
      minInvestment,
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

    const rate = parsed.data.yieldRateMonthlyPercent / 100;
    const ticket = parsed.data.minInvestment;
    // Only send what actually differs from the analyst's terms; an empty body keeps them.
    const overrides = {
      yieldRateMonthly: Math.abs(rate - (duplicata.yieldRateMonthly ?? 0)) > 1e-9 ? rate : undefined,
      minInvestment: ticket !== analystTicket ? ticket : undefined,
    };

    setSubmitting(true);
    try {
      const offer = await openFunding({ duplicataId: duplicata.id, ...overrides });
      onOpened(offer);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Não foi possível abrir a captação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Termos aceitos pelo cedente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between sm:block">
            <p className="text-muted-foreground">Valor de face</p>
            <p className="font-medium">{formatCurrencyBRL(duplicata.valor)}</p>
          </div>
          <div className="flex justify-between sm:block">
            <p className="text-muted-foreground">Deságio do analista</p>
            <p className="font-medium">
              {duplicata.descontoAntecipacaoPercent != null ? formatPercent(duplicata.descontoAntecipacaoPercent) : "—"}
            </p>
          </div>
          <div className="flex justify-between sm:block">
            <p className="text-muted-foreground">Meta de captação</p>
            <p className="font-medium">{formatCurrencyBRL(targetAmount)}</p>
          </div>
          <div className="flex justify-between sm:block">
            <p className="text-muted-foreground">Taxa proposta pelo analista</p>
            <p className="font-medium">{formatMonthlyRate(duplicata.yieldRateMonthly ?? 0)}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="yieldRateMonthlyPercent">Taxa ao investidor (% a.m.)</Label>
          <Input
            id="yieldRateMonthlyPercent"
            type="number"
            min={0}
            max={10}
            step="any"
            value={yieldRateMonthlyPercent}
            onChange={(e) => setYieldRateMonthlyPercent(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Juros simples, base 30 dias, pagos na liquidação pelo sacado.</p>
          {fieldErrors.yieldRateMonthlyPercent && (
            <p className="text-sm text-destructive">{fieldErrors.yieldRateMonthlyPercent}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="minInvestment">Ticket mínimo por aporte (R$)</Label>
          <Input
            id="minInvestment"
            type="number"
            min={0}
            step="any"
            value={minInvestment}
            onChange={(e) => setMinInvestment(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">0 = sem mínimo. Um aporte que fecha o restante da meta é sempre aceito.</p>
          {fieldErrors.minInvestment && <p className="text-sm text-destructive">{fieldErrors.minInvestment}</p>}
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Abrindo...
              </>
            ) : (
              "Abrir captação"
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
