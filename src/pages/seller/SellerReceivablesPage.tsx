import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ReceivableStatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { SellerReceivableOfferWizardDialog } from "@/components/seller/SellerReceivableOfferWizardDialog";
import { SellerReceivablesListTableSkeleton } from "@/components/seller/SellerPageCardsSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceivableError } from "@/domain/receivable/receivable.errors";
import type { ReceivableDetail, ReceivableListItem } from "@/domain/receivable/receivable.types";
import { canSellerRegisterReceivables } from "@/domain/seller/seller-receivable-access";
import { useSeller } from "@/contexts/SellerContext";
import { formatCurrencyBRL } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  fetchReceivableById,
  fetchReceivables,
  submitSellerDecision,
} from "@/services/receivable.service";

export function SellerReceivablesPage() {
  const { seller, isLoading, fetchError, refreshSeller } = useSeller();
  const [items, setItems] = useState<ReceivableListItem[]>([]);
  const [receivablesLoading, setReceivablesLoading] = useState(true);
  const [offerReceivable, setOfferReceivable] = useState<ReceivableDetail | null>(null);
  const [offerWizardOpen, setOfferWizardOpen] = useState(false);
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  useEffect(() => {
    if (!seller && !isLoading && !fetchError) void refreshSeller();
  }, [seller, isLoading, fetchError, refreshSeller]);

  useEffect(() => {
    if (!seller) return;

    async function loadReceivables() {
      setReceivablesLoading(true);
      try {
        const receivables = await fetchReceivables();
        setItems(receivables);
      } catch (err) {
        toast.error(
          err instanceof ReceivableError
            ? err.message
            : "Não foi possível carregar os recebíveis.",
        );
      } finally {
        setReceivablesLoading(false);
      }
    }

    void loadReceivables();
  }, [seller]);

  async function refreshItems() {
    const receivables = await fetchReceivables();
    setItems(receivables);
  }

  async function openOfferWizard(item: ReceivableListItem) {
    try {
      const detail = await fetchReceivableById(item.id);
      setOfferReceivable(detail);
      setOfferWizardOpen(true);
    } catch (err) {
      toast.error(err instanceof ReceivableError ? err.message : "Não foi possível carregar a proposta.");
    }
  }

  async function handleOfferDecision(decision: "accept" | "reject") {
    if (!offerReceivable) return;
    setOfferSubmitting(true);
    try {
      await submitSellerDecision(offerReceivable.id, decision);
      await refreshItems();
      setOfferWizardOpen(false);
      setOfferReceivable(null);
      if (decision === "accept") {
        toast.success("Proposta aceita", {
          description: "O recebível segue para análise do sacado.",
        });
      } else {
        toast.error("Proposta recusada", {
          description: `Você recusou a proposta do recebível ${offerReceivable.billNumber}.`,
        });
      }
    } catch (err) {
      toast.error(err instanceof ReceivableError ? err.message : "Não foi possível registrar sua decisão.");
    } finally {
      setOfferSubmitting(false);
    }
  }

  const loading = (isLoading && !seller) || receivablesLoading;

  let headerAction: ReactNode;
  if (loading) {
    headerAction = <Skeleton className="h-10 w-52 shrink-0 rounded-md" />;
  } else if (seller && canSellerRegisterReceivables(seller)) {
    headerAction = (
      <Button asChild>
        <Link to={ROUTES.seller.receivables.new}>Nova recebível</Link>
      </Button>
    );
  } else {
    headerAction = (
      <Button variant="outline" asChild>
        <Link to={ROUTES.seller.validation}>Ver requisitos em Validação</Link>
      </Button>
    );
  }

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Recebíveis</h1>
        <p className="text-sm text-muted-foreground">Envie títulos para análise do analista de risco</p>
      </div>
      {headerAction}
    </div>
  );

  if (fetchError && !seller) {
    return (
      <div className="p-6 space-y-6">
        {header}
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={() => void refreshSeller()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {header}
        <SellerReceivablesListTableSkeleton />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Não foi possível carregar os dados do vendedor.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {header}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Sacado</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum recebível enviado. Cadastre o primeiro.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const hasOpenOffer = item.status === "offer";

                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      hasOpenOffer &&
                        "cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    )}
                    tabIndex={hasOpenOffer ? 0 : undefined}
                    role={hasOpenOffer ? "button" : undefined}
                    aria-label={
                      hasOpenOffer
                        ? `Revisar proposta de antecipação do recebível ${item.billNumber}`
                        : undefined
                    }
                    onClick={hasOpenOffer ? () => void openOfferWizard(item) : undefined}
                    onKeyDown={
                      hasOpenOffer
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              void openOfferWizard(item);
                            }
                          }
                        : undefined
                    }
                  >
                    <TableCell className="font-mono text-sm">{item.billNumber}</TableCell>
                    <TableCell>{item.payerLegalName}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(item.faceValue)}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <ReceivableStatusBadge status={item.status} interactive={hasOpenOffer} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <SellerReceivableOfferWizardDialog
        open={offerWizardOpen}
        onOpenChange={(open) => {
          if (!open && offerSubmitting) return;
          setOfferWizardOpen(open);
          if (!open) setOfferReceivable(null);
        }}
        receivable={offerReceivable}
        submitting={offerSubmitting}
        onDecision={handleOfferDecision}
      />
    </div>
  );
}
