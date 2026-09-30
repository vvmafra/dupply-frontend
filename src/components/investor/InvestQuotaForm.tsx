import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { investQuotaSchema } from "@/domain/offer/invest.schema";
import { calcRemainingQuotas } from "@/domain/offer/offer-economics.helpers";
import type { Offer } from "@/domain/offer/offer.types";
import { formatCurrencyBRL } from "@/lib/formatters";
import { investInOffer } from "@/services/offer.service";

type InvestQuotaFormProps = {
  offer: Offer;
  investorUserId: string;
  onSuccess: () => void;
};

function roundReais(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Investor aporte form.
 * - Mock offers are sold in whole quotas of `quotaPrice`.
 * - Backend offers (`receivableStage` set) take an exact amount in reais: the funding
 *   only closes when `funded` reaches the target to the cent, so the last aporte must
 *   be able to cover any remainder.
 * Both enforce the minimum ticket, except when the aporte closes the remainder.
 */
export function InvestQuotaForm({ offer, investorUserId, onSuccess }: InvestQuotaFormProps) {
  const amountMode = offer.receivableStage !== undefined;
  const remainingQuotas = calcRemainingQuotas(offer.quotaCount, offer.quotasSold);
  const remainingAmount = amountMode
    ? roundReais(offer.targetAmount - offer.raisedAmount)
    : remainingQuotas * offer.quotaPrice;
  const hasMinimum = offer.minInvestment > 0;
  const minQuotas = hasMinimum
    ? Math.min(remainingQuotas, Math.ceil(offer.minInvestment / offer.quotaPrice))
    : 1;

  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parseInput(): { quotaCount: number; amount: number } | null {
    if (amountMode) {
      const amount = roundReais(Number.parseFloat(inputValue.replace(",", ".")));
      if (!Number.isFinite(amount) || amount <= 0) {
        setError("Informe um valor maior que zero.");
        return null;
      }
      if (amount > remainingAmount) {
        setError(`Restam apenas ${formatCurrencyBRL(remainingAmount)} nesta captação.`);
        return null;
      }
      return { quotaCount: Math.floor(amount / offer.quotaPrice), amount };
    }

    const parsed = investQuotaSchema.safeParse({ quotaCount: inputValue === "" ? 0 : Number(inputValue) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return null;
    }
    if (parsed.data.quotaCount > remainingQuotas) {
      setError(`Restam apenas ${remainingQuotas} cotas nesta oferta.`);
      return null;
    }
    return { quotaCount: parsed.data.quotaCount, amount: parsed.data.quotaCount * offer.quotaPrice };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = parseInput();
    if (!parsed) return;

    // Same rule as the backend (`investment_below_minimum`): below the ticket is
    // refused unless the amount closes exactly what is left of the target.
    if (hasMinimum && parsed.amount < offer.minInvestment && parsed.amount !== remainingAmount) {
      setError(
        amountMode
          ? `Aporte mínimo de ${formatCurrencyBRL(offer.minInvestment)} nesta oferta.`
          : `Aporte mínimo de ${formatCurrencyBRL(offer.minInvestment)} (${minQuotas} cotas) nesta oferta.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const investment = await investInOffer({
        offerId: offer.id,
        investorUserId,
        quotaCount: parsed.quotaCount,
        amount: amountMode ? parsed.amount : undefined,
      });
      toast.success("Investimento registrado", {
        description: amountMode
          ? formatCurrencyBRL(investment.amount)
          : `${investment.quotaCount} cotas · ${formatCurrencyBRL(investment.amount)}`,
      });
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível investir.";
      toast.error(message);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (offer.status !== "fundraising" || remainingAmount <= 0) {
    const gap = offer.targetAmount - offer.raisedAmount;
    if (!amountMode && gap > 0 && offer.status === "fundraising") {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Todas as cotas disponíveis para investidores individuais foram vendidas.
          </p>
          <div className="rounded-md bg-primary/10 border border-primary/20 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-white">Co-investimento do FIDC</p>
            <p>
              O resíduo de <strong>{formatCurrencyBRL(gap)}</strong> (não divisível em cotas inteiras de {formatCurrencyBRL(offer.quotaPrice)}) será aportado pelo próprio FIDC para liquidar a operação.
            </p>
          </div>
        </div>
      );
    }
    return (
      <p className="text-sm text-muted-foreground">Esta oferta não está aberta para novos investimentos.</p>
    );
  }

  const totalAmount = amountMode
    ? Number.parseFloat(inputValue.replace(",", ".")) || 0
    : (Number(inputValue) || 0) * offer.quotaPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="quotaCount">{amountMode ? "Valor do aporte (R$)" : "Quantidade de cotas"}</Label>
        <Input
          id="quotaCount"
          type="number"
          min={amountMode ? 0.01 : 1}
          max={amountMode ? remainingAmount : remainingQuotas}
          step={amountMode ? "any" : 1}
          placeholder={amountMode ? "Digite o valor em reais" : "Digite a quantidade de cotas"}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {amountMode ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Restam {formatCurrencyBRL(remainingAmount)}</span>
            {hasMinimum && (
              <Button type="button" size="xs" variant="outline" onClick={() => setInputValue(String(offer.minInvestment))}>
                Mínimo {formatCurrencyBRL(offer.minInvestment)}
              </Button>
            )}
            <Button type="button" size="xs" variant="outline" onClick={() => setInputValue(String(remainingAmount))}>
              Fechar captação ({formatCurrencyBRL(remainingAmount)})
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Até {remainingQuotas} cotas · {formatCurrencyBRL(offer.quotaPrice)} cada
          </p>
        )}
        {hasMinimum && (
          <p className="text-xs text-muted-foreground">
            Ticket mínimo {formatCurrencyBRL(offer.minInvestment)}
            {amountMode ? "" : ` (${minQuotas} cotas)`}, exceto para fechar o restante da captação.
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          `Investir ${formatCurrencyBRL(totalAmount)}`
        )}
      </Button>
    </form>
  );
}
