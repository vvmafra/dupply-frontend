import { Bot, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RISK_LEVEL_LABELS } from "@/domain/offer/offer.constants";
import type { Offer } from "@/domain/offer/offer.types";

const CHECKS = [
  "XML da NF-e registrado na SEFAZ",
  "Comprovante de entrega validado (OCR)",
  "Aceite digital do sacado verificado",
  "Histórico de pontualidade do sacado",
] as const;

function scoreToRating(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  return "B";
}

/** Investor-facing summary of the (simulated) AI risk audit for an offer. */
export function OfferRiskAgentCard({ offer }: Readonly<{ offer: Offer }>) {
  const score = offer.scoreDuplicataSnapshot ?? 75;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
          <Bot className="size-5 text-primary shrink-0 animate-pulse" />
          Análise do Agente de Risco
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Score do Recebível</p>
            <p className="text-2xl font-black text-white">
              {score} <span className="text-xs text-muted-foreground">/ 100</span>
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-base">
            {scoreToRating(score)}
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-white/90">Validações Executadas:</p>
          <div className="space-y-1.5">
            {CHECKS.map((check) => (
              <div key={check} className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 rounded bg-zinc-900/30 text-[10px] text-muted-foreground/60 leading-normal italic border border-border/20 text-center">
          Classificação: Nível de Risco {RISK_LEVEL_LABELS[offer.riskLevel]}. Meramente ilustrativo, trata-se de
          uma análise da Dupply.
        </div>
      </CardContent>
    </Card>
  );
}
