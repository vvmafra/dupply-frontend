import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

export function SellerDuplicataOperacaoWizardDialog({
  open,
  onOpenChange,
  duplicata,
  submitting,
  onApprove,
  onReject,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicata: DuplicataTitulo | null;
  submitting: boolean;
  onApprove: () => void | Promise<void>;
  onReject: () => void | Promise<void>;
}>) {
  if (!duplicata) return null;

  const desconto = duplicata.descontoAntecipacaoPercent;
  const valorLiquido = duplicata.valorLiquidoAntecipacao;
  const ofertaCompleta = desconto != null && valorLiquido != null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[min(90vh,560px)] overflow-y-auto sm:max-w-lg" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Aprovar operação de antecipação</DialogTitle>
          <DialogDescription>
            Duplicata{" "}
            <span className="font-mono font-medium text-foreground">{duplicata.numeroDuplicata}</span>. Revise a
            proposta da Dupply antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Valor total da duplicata</p>
              <p className="mt-1 font-medium tabular-nums">{formatCurrencyBRL(duplicata.valor)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Desconto sugerido</p>
              <p className="mt-1 font-medium tabular-nums">{ofertaCompleta ? `${desconto}%` : "—"}</p>
            </div>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Valor que você receberia</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {ofertaCompleta ? formatCurrencyBRL(valorLiquido) : "—"}
            </p>
            {ofertaCompleta ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCurrencyBRL(duplicata.valor)} com desconto de {desconto}%
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end sm:flex-row">
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onReject()}
            disabled={submitting || !ofertaCompleta}
          >
            {submitting ? "Processando..." : "Reprovar operação"}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => void onApprove()}
            disabled={submitting || !ofertaCompleta}
          >
            {submitting ? "Processando..." : "Aprovar operação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
