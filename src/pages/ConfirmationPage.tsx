import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CircleCheck as CheckCircle2, ArrowLeft, Loader as Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchReceivableById, confirmDebtorAwareness } from "@/services/receivables.service";
import { ReceivableStatusBadge } from "@/components/receivables/ReceivableStatusBadge";
import { formatCurrencyBRL, formatDate } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import type { Receivable } from "@/domain/receivables/receivable.types";

export function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [receivable, setReceivable] = useState<Receivable | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchReceivableById(id).then((data) => {
      setReceivable(data ?? null);
      setLoading(false);
    });
  }, [id]);

  async function handleConfirm() {
    if (!id) return;
    setConfirming(true);
    await confirmDebtorAwareness(id);
    setConfirmed(true);
    setConfirming(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!receivable) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">Operação não encontrada.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.home}><ArrowLeft className="size-4" />Voltar ao início</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" />
            <CardTitle className="text-base">Confirmação de ciência</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {confirmed ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="size-12 text-success" />
              <div>
                <p className="font-semibold">Ciência registrada com sucesso</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sua confirmação foi registrada. Obrigado pela colaboração.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Você foi identificado como sacado na seguinte operação de antecipação de recebíveis.
                Por favor, confirme a ciência desta operação.
              </p>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">Duplicata</p>
                    <p className="font-mono text-sm font-medium">{receivable.invoiceNumber}</p>
                  </div>
                  <ReceivableStatusBadge status={receivable.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Cedente</p>
                    <p className="font-medium">{receivable.sellerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="font-medium">{formatCurrencyBRL(receivable.grossAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vencimento</p>
                    <p className="font-medium">{formatDate(receivable.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Prazo</p>
                    <p className="font-medium">{receivable.termInDays} dias</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Ao confirmar, você declara estar ciente da cessão deste título à plataforma Dupply.
                Esta ação não implica em nenhuma obrigação adicional além do pagamento na data acordada.
              </p>

              <Button className="w-full" onClick={handleConfirm} disabled={confirming}>
                {confirming ? (
                  <><Loader2 className="size-4 animate-spin" />Registrando ciência...</>
                ) : (
                  <><CheckCircle2 className="size-4" />Confirmar ciência</>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
