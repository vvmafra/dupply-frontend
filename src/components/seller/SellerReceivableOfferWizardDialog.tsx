import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReceivableDetail } from "@/domain/receivable/receivable.types";
import { formatCurrencyBRL } from "@/lib/formatters";

export function SellerReceivableOfferWizardDialog({
  open,
  onOpenChange,
  receivable,
  submitting,
  onDecision,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receivable: ReceivableDetail | null;
  submitting: boolean;
  onDecision: (decision: "accept" | "reject") => void | Promise<void>;
}>) {
  if (!receivable) return null;

  const proposedValue = receivable.proposedValue;
  const discountPercent = receivable.discountPercent;
  const ofertaCompleta = proposedValue != null;

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
            Recebível{" "}
            <span className="font-mono font-medium text-foreground">{receivable.billNumber}</span>. Revise a
            proposta da Dupply antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Valor total do recebível</p>
              <p className="mt-1 font-medium tabular-nums">{formatCurrencyBRL(receivable.faceValue)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Desconto sugerido</p>
              <p className="mt-1 font-medium tabular-nums">
                {discountPercent != null ? `${discountPercent}%` : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
            <p className="text-xs font-medium text-muted-foreground">Valor que você receberia</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {ofertaCompleta ? formatCurrencyBRL(proposedValue) : "—"}
            </p>
            {ofertaCompleta && discountPercent != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCurrencyBRL(receivable.faceValue)} com desconto de {discountPercent}%
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end sm:flex-row">
          <Button
            type="button"
            variant="destructive"
            onClick={() => void onDecision("reject")}
            disabled={submitting || !ofertaCompleta}
          >
            {submitting ? "Processando..." : "Recusar proposta"}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => void onDecision("accept")}
            disabled={submitting || !ofertaCompleta}
          >
            {submitting ? "Processando..." : "Aceitar proposta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
