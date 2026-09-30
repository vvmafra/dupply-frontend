import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScoreBadge } from "@/components/receivables/ScoreBadge";
import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";
import {
  createOfertaAntecipacaoFormSchema,
  DEFAULT_YIELD_RATE_MONTHLY_PERCENT,
  DESCONTO_MAX_PERCENT,
  DESCONTO_MIN_PERCENT,
  toOfertaAntecipacaoTerms,
} from "@/domain/duplicata/oferta-antecipacao.schema";
import type { OfertaAntecipacaoTerms } from "@/domain/duplicata/duplicata.types";
import { MAX_YIELD_RATE_MONTHLY } from "@/domain/offer/offer.constants";
import { formatCurrencyBRL } from "@/lib/formatters";

export type AnalystApprovalPayload = OfertaAntecipacaoTerms & { observacoes: string };

type FieldErrors = Partial<Record<"descontoPercent" | "yieldRateMonthlyPercent" | "minInvestment", string>>;

export function AnalystDuplicataApprovalWizardDialog({
  open,
  onOpenChange,
  numeroDuplicata,
  valorNota,
  scoreUsuario,
  scoreDuplicata,
  submitting,
  onConfirm,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  numeroDuplicata: string;
  valorNota: number;
  scoreUsuario: number;
  scoreDuplicata: number;
  submitting: boolean;
  onConfirm: (payload: AnalystApprovalPayload) => void | Promise<void>;
}>) {
  const [descontoInput, setDescontoInput] = useState("");
  const [taxaInput, setTaxaInput] = useState(String(DEFAULT_YIELD_RATE_MONTHLY_PERCENT));
  const [ticketInput, setTicketInput] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) {
      setDescontoInput("");
      setTaxaInput(String(DEFAULT_YIELD_RATE_MONTHLY_PERCENT));
      setTicketInput("");
      setObservacoes("");
      setErrors({});
    }
  }, [open]);

  const schema = useMemo(() => createOfertaAntecipacaoFormSchema(valorNota), [valorNota]);
  const parsed = useMemo(
    () =>
      schema.safeParse({
        descontoPercent: descontoInput,
        yieldRateMonthlyPercent: taxaInput,
        minInvestment: ticketInput,
        observacoes,
      }),
    [schema, descontoInput, taxaInput, ticketInput, observacoes],
  );
  const valorLiquidoCedente = parsed.success
    ? calcValorLiquidoCedente(valorNota, parsed.data.descontoPercent)
    : null;

  function handleConfirm() {
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]) as keyof FieldErrors;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    void onConfirm({ ...toOfertaAntecipacaoTerms(parsed.data), observacoes: parsed.data.observacoes.trim() });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Aprovar duplicata</DialogTitle>
          <DialogDescription>
            Duplicata <span className="font-mono font-medium text-foreground">{numeroDuplicata}</span>. Defina o
            desconto ao cedente e os termos da captação para os investidores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Valor da nota</p>
              <p className="mt-1 font-medium tabular-nums">{formatCurrencyBRL(valorNota)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Score do usuário</p>
              <div className="mt-1">
                <ScoreBadge score={scoreUsuario} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Score da duplicata</p>
              <div className="mt-1">
                <ScoreBadge score={scoreDuplicata} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duplicata-approval-desconto">Desconto ao cedente (%)</Label>
            <Input
              id="duplicata-approval-desconto"
              type="number"
              inputMode="decimal"
              min={DESCONTO_MIN_PERCENT}
              max={DESCONTO_MAX_PERCENT}
              step={0.1}
              placeholder={`${DESCONTO_MIN_PERCENT} a ${DESCONTO_MAX_PERCENT}`}
              value={descontoInput}
              onChange={(e) => {
                setDescontoInput(e.target.value);
                if (errors.descontoPercent) setErrors((prev) => ({ ...prev, descontoPercent: undefined }));
              }}
              disabled={submitting}
              aria-invalid={Boolean(errors.descontoPercent)}
            />
            <p className="text-xs text-muted-foreground">
              Percentual de desconto sobre o valor da nota (entre {DESCONTO_MIN_PERCENT}% e {DESCONTO_MAX_PERCENT}%).
            </p>
            {errors.descontoPercent && <p className="text-sm text-destructive">{errors.descontoPercent}</p>}
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Valor que o cedente receberia</p>
            <p
              className={
                valorLiquidoCedente !== null
                  ? "mt-1 text-lg font-semibold tabular-nums"
                  : "mt-1 text-lg font-semibold tabular-nums text-muted-foreground"
              }
            >
              {valorLiquidoCedente !== null ? formatCurrencyBRL(valorLiquidoCedente) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {valorLiquidoCedente !== null
                ? `${formatCurrencyBRL(valorNota)} com desconto de ${descontoInput.replace(".", ",")}%`
                : "Informe o desconto para calcular o valor líquido"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duplicata-approval-taxa">Taxa ao investidor (% a.m.)</Label>
              <Input
                id="duplicata-approval-taxa"
                type="number"
                inputMode="decimal"
                min={0}
                max={MAX_YIELD_RATE_MONTHLY * 100}
                step="any"
                value={taxaInput}
                onChange={(e) => {
                  setTaxaInput(e.target.value);
                  if (errors.yieldRateMonthlyPercent) {
                    setErrors((prev) => ({ ...prev, yieldRateMonthlyPercent: undefined }));
                  }
                }}
                disabled={submitting}
                aria-invalid={Boolean(errors.yieldRateMonthlyPercent)}
              />
              <p className="text-xs text-muted-foreground">Juros simples, base 30 dias. Vazio = sem rendimento.</p>
              {errors.yieldRateMonthlyPercent && (
                <p className="text-sm text-destructive">{errors.yieldRateMonthlyPercent}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duplicata-approval-ticket">Ticket mínimo por aporte (R$)</Label>
              <Input
                id="duplicata-approval-ticket"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="Opcional"
                value={ticketInput}
                onChange={(e) => {
                  setTicketInput(e.target.value);
                  if (errors.minInvestment) setErrors((prev) => ({ ...prev, minInvestment: undefined }));
                }}
                disabled={submitting}
                aria-invalid={Boolean(errors.minInvestment)}
              />
              <p className="text-xs text-muted-foreground">Vazio ou 0 = sem mínimo. O admin pode ajustar ao abrir a captação.</p>
              {errors.minInvestment && <p className="text-sm text-destructive">{errors.minInvestment}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duplicata-approval-observacoes">Observações</Label>
            <Textarea
              id="duplicata-approval-observacoes"
              placeholder="Registre observações sobre a aprovação..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="min-h-[80px] resize-y"
              disabled={submitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="button" variant="default" onClick={handleConfirm} disabled={submitting || !parsed.success}>
            {submitting ? "Confirmando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
