import { useState } from "react";
import { CircleCheck as CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RiskBadge } from "@/components/receivables/RiskBadge";
import { formatCurrencyBRL, formatDate, formatPercent } from "@/lib/formatters";
import { calculateEstimatedReturn } from "@/lib/utils";
import { simulateInvestment } from "@/services/investment.service";
import type { Receivable } from "@/domain/receivables/receivable.types";

interface InvestmentSimulationModalProps {
  receivable: Receivable;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestmentSimulationModal({ receivable, open, onOpenChange }: InvestmentSimulationModalProps) {
  const [amount, setAmount] = useState(receivable.grossAmount.toString());
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const estimatedReturn = calculateEstimatedReturn(parsedAmount, receivable.estimatedRate, receivable.termInDays);
  const netAmount = parsedAmount + estimatedReturn;

  async function handleConfirm() {
    setLoading(true);
    await simulateInvestment({
      receivableId: receivable.id,
      amount: parsedAmount,
      rate: receivable.estimatedRate,
      termInDays: receivable.termInDays,
      sellerName: receivable.sellerName,
      debtorName: receivable.debtorName,
      dueDate: receivable.dueDate,
      risk: receivable.risk,
    });
    setLoading(false);
    setConfirmed(true);
  }

  function handleClose() {
    setConfirmed(false);
    setAmount(receivable.grossAmount.toString());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Simular investimento</DialogTitle>
          <DialogDescription>
            Simulação para {receivable.invoiceNumber} — {receivable.debtorName}
          </DialogDescription>
        </DialogHeader>

        {confirmed ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-12 text-success" />
            <div className="space-y-1">
              <p className="font-semibold text-base">Investimento simulado com sucesso.</p>
              <p className="text-sm text-muted-foreground">
                Esta versão não realiza movimentação financeira real.
              </p>
            </div>
            <Button onClick={handleClose} className="mt-2">Fechar</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Valor investido (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={1}
                  max={receivable.grossAmount}
                />
                <p className="text-xs text-muted-foreground">
                  Valor máximo: {formatCurrencyBRL(receivable.grossAmount)}
                </p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor investido</span>
                  <span className="font-medium">{formatCurrencyBRL(parsedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retorno estimado</span>
                  <span className="font-medium text-success">+{formatCurrencyBRL(estimatedReturn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa anual</span>
                  <span className="font-medium">{formatPercent(receivable.estimatedRate)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total esperado</span>
                  <span>{formatCurrencyBRL(netAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data esperada de pagamento</span>
                  <span>{formatDate(receivable.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Risco da operação</span>
                  <RiskBadge risk={receivable.risk} />
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  Esta é uma simulação. Nenhum valor real será movimentado.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={handleConfirm} disabled={loading || parsedAmount <= 0}>
                {loading ? "Confirmando..." : "Confirmar simulação"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
