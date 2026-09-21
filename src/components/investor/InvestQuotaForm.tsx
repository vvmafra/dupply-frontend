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

export function InvestQuotaForm({ offer, investorUserId, onSuccess }: InvestQuotaFormProps) {
  const remaining = calcRemainingQuotas(offer.quotaCount, offer.quotasSold);
  const [quotaCount, setQuotaCount] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const countVal = quotaCount === "" ? 0 : quotaCount;
    const parsed = investQuotaSchema.safeParse({ quotaCount: countVal });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    if (parsed.data.quotaCount > remaining) {
      setError(`Restam apenas ${remaining} cotas nesta oferta.`);
      return;
    }

    setSubmitting(true);
    try {
      const investment = await investInOffer({
        offerId: offer.id,
        investorUserId,
        quotaCount: parsed.data.quotaCount,
      });
      toast.success("Investimento registrado", {
        description: `${investment.quotaCount} cotas · ${formatCurrencyBRL(investment.amount)}`,
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

  if (offer.status !== "fundraising" || remaining <= 0) {
    const gap = offer.targetAmount - offer.raisedAmount;
    if (gap > 0 && offer.status === "fundraising") {
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

  const totalAmount = (quotaCount === "" ? 0 : quotaCount) * offer.quotaPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="quotaCount">Quantidade de cotas</Label>
        <Input
          id="quotaCount"
          type="number"
          min={1}
          max={remaining}
          placeholder="Digite a quantidade de cotas"
          value={quotaCount}
          onChange={(e) => {
            const val = e.target.value;
            setQuotaCount(val === "" ? "" : Number(val));
          }}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <p className="text-xs text-muted-foreground">
          Até {remaining} cotas · {formatCurrencyBRL(offer.quotaPrice)} cada
        </p>
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
