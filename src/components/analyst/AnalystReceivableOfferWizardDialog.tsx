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
import { calcProposedValueFromDiscount } from "@/domain/receivable/receivable-antecipacao.helpers";
import type { ReceivableDetail } from "@/domain/receivable/receivable.types";
import { formatCurrencyBRL } from "@/lib/formatters";

const DESCONTO_MIN = 0.1;
const DESCONTO_MAX = 50;

function parseDescontoPercent(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function isDescontoValid(percent: number | null): percent is number {
  return percent !== null && percent >= DESCONTO_MIN && percent <= DESCONTO_MAX;
}

export function AnalystReceivableOfferWizardDialog({
  open,
  onOpenChange,
  receivable,
  submitting,
  onConfirm,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: ReceivableDetail;
  submitting: boolean;
  onConfirm: (discountPercent: number) => void | Promise<void>;
}>) {
  const [descontoInput, setDescontoInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDescontoInput("");
      setError(null);
    }
  }, [open]);

  const descontoPercent = useMemo(() => parseDescontoPercent(descontoInput), [descontoInput]);
  const descontoValido = isDescontoValid(descontoPercent);
  const valorLiquidoCedente = descontoValido
    ? calcProposedValueFromDiscount(receivable.faceValue, descontoPercent)
    : null;

  function handleConfirm() {
    if (!isDescontoValid(descontoPercent)) {
      setError(`Informe um desconto entre ${DESCONTO_MIN}% e ${DESCONTO_MAX}%.`);
      return;
    }
    setError(null);
    void onConfirm(descontoPercent);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Enviar oferta</DialogTitle>
          <DialogDescription>
            Recebível{" "}
            <span className="font-mono font-medium text-foreground">{receivable.billNumber}</span>. Defina o
            desconto e confirme a oferta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Valor da nota</p>
              <p className="mt-1 font-medium tabular-nums">{formatCurrencyBRL(receivable.faceValue)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Score</p>
              <p className="mt-1 text-sm text-muted-foreground">Score — em breve</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receivable-offer-desconto">Desconto (%)</Label>
            <Input
              id="receivable-offer-desconto"
              type="number"
              inputMode="decimal"
              min={DESCONTO_MIN}
              max={DESCONTO_MAX}
              step={0.1}
              placeholder={`${DESCONTO_MIN} a ${DESCONTO_MAX}`}
              value={descontoInput}
              onChange={(e) => {
                setDescontoInput(e.target.value);
                if (error) setError(null);
              }}
              disabled={submitting}
              aria-invalid={descontoInput.length > 0 && !descontoValido}
            />
            <p className="text-xs text-muted-foreground">
              Percentual de desconto aplicado sobre o valor da nota.
            </p>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Valor que o cedente receberia</p>
            <p
              className={
                descontoValido
                  ? "mt-1 text-lg font-semibold tabular-nums"
                  : "mt-1 text-lg font-semibold tabular-nums text-muted-foreground"
              }
            >
              {descontoValido && valorLiquidoCedente !== null
                ? formatCurrencyBRL(valorLiquidoCedente)
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {descontoValido
                ? `${formatCurrencyBRL(receivable.faceValue)} com desconto de ${descontoPercent}%`
                : "Informe o desconto para calcular o valor líquido"}
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="button" variant="default" onClick={handleConfirm} disabled={submitting || !descontoValido}>
            {submitting ? "Confirmando..." : "Confirmar oferta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
