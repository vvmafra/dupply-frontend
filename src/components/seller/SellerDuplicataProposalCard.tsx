import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { formatCurrencyBRL } from "@/lib/formatters";

/** Shown to the seller while the analyst's proposal awaits their decision. */
export function SellerDuplicataProposalCard({
  duplicata: d,
  onReview,
}: Readonly<{ duplicata: DuplicataTitulo; onReview: () => void }>) {
  return (
    <Card className="border-primary/40 bg-primary/5 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-primary">Proposta Disponível!</CardTitle>
        <CardDescription>A Dupply avaliou o título e gerou uma proposta de antecipação.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Valor Bruto:</span>
            <span className="font-mono font-medium">{formatCurrencyBRL(d.valor)}</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Taxa Proposta:</span>
            <span className="font-mono font-medium">{d.descontoAntecipacaoPercent}%</span>
          </div>
          <div className="flex justify-between py-1 pt-2 font-semibold">
            <span className="text-foreground">Valor Líquido:</span>
            <span className="font-mono text-primary text-base">
              {d.valorLiquidoAntecipacao != null ? formatCurrencyBRL(d.valorLiquidoAntecipacao) : "—"}
            </span>
          </div>
        </div>
        <Button className="w-full" onClick={onReview}>
          Analisar & Decidir
        </Button>
      </CardContent>
    </Card>
  );
}
