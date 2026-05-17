import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { SellerDuplicataOperacaoWizardDialog } from "@/components/seller/SellerDuplicataOperacaoWizardDialog";
import { SellerDuplicatasListTableSkeleton } from "@/components/seller/SellerPageCardsSkeleton";
import { Button } from "@/components/ui/button";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchDuplicatasBySeller,
  setDuplicataDecisaoCedente,
} from "@/services/duplicata.service";
import { fetchCurrentSeller } from "@/services/seller.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";
import { ROUTES } from "@/lib/routes";
import type { SellerCompany } from "@/domain/seller/seller.types";
import { formatCurrencyBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

export function SellerDuplicatasPage() {
  const [items, setItems] = useState<DuplicataTitulo[]>([]);
  const [seller, setSeller] = useState<SellerCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [operacaoDuplicata, setOperacaoDuplicata] = useState<DuplicataTitulo | null>(null);
  const [operacaoWizardOpen, setOperacaoWizardOpen] = useState(false);
  const [operacaoSubmitting, setOperacaoSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const s = await fetchCurrentSeller();
      const data = await fetchDuplicatasBySeller(s.id);
      setSeller(s);
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  function openOperacaoWizard(duplicata: DuplicataTitulo) {
    setOperacaoDuplicata(duplicata);
    setOperacaoWizardOpen(true);
  }

  async function refreshItems(sellerId: string) {
    const data = await fetchDuplicatasBySeller(sellerId);
    setItems(data);
  }

  async function handleOperacaoApprove() {
    if (!operacaoDuplicata || !seller) return;
    const valorReceber = operacaoDuplicata.valorLiquidoAntecipacao;
    setOperacaoSubmitting(true);
    try {
      await setDuplicataDecisaoCedente(operacaoDuplicata.id, "aprovado");
      await refreshItems(seller.id);
      setOperacaoWizardOpen(false);
      setOperacaoDuplicata(null);
      toast.success("Operação aprovada", {
        description: valorReceber
          ? `A antecipação de ${operacaoDuplicata.numeroDuplicata} foi confirmada. Você receberá ${formatCurrencyBRL(valorReceber)}. A operação pode demorar até 2h para ser finalizada.`
          : `A antecipação de ${operacaoDuplicata.numeroDuplicata} foi confirmada. A operação pode demorar até 2h para ser finalizada.`,
      });
    } finally {
      setOperacaoSubmitting(false);
    }
  }

  async function handleOperacaoReject() {
    if (!operacaoDuplicata || !seller) return;
    setOperacaoSubmitting(true);
    try {
      await setDuplicataDecisaoCedente(operacaoDuplicata.id, "reprovado");
      await refreshItems(seller.id);
      setOperacaoWizardOpen(false);
      setOperacaoDuplicata(null);
      toast.error("Operação reprovada", {
        description: `Você recusou a antecipação de ${operacaoDuplicata.numeroDuplicata}.`,
      });
    } finally {
      setOperacaoSubmitting(false);
    }
  }

  let headerAction: ReactNode;
  if (loading) {
    headerAction = <Skeleton className="h-10 w-52 shrink-0 rounded-md" />;
  } else if (seller && canSellerRegisterDuplicatas(seller)) {
    headerAction = (
      <Button asChild>
        <Link to={ROUTES.seller.duplicatas.new}>Nova duplicata</Link>
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
        <h1 className="text-xl font-semibold tracking-tight">Duplicatas</h1>
        <p className="text-sm text-muted-foreground">
          Versão hackathon — envie títulos para análise do analista de risco
        </p>
      </div>
      {headerAction}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {header}
        <SellerDuplicatasListTableSkeleton />
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
              <TableHead>Análise</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma duplicata enviada. Cadastre a primeira.
                </TableCell>
              </TableRow>
            ) : (
              items.map((d) => {
                const aguardandoAprovacao = d.analiseAnalista === "for_approval";

                return (
                  <TableRow
                    key={d.id}
                    className={cn(
                      aguardandoAprovacao &&
                        "cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    )}
                    tabIndex={aguardandoAprovacao ? 0 : undefined}
                    role={aguardandoAprovacao ? "button" : undefined}
                    aria-label={
                      aguardandoAprovacao
                        ? `Revisar proposta de antecipação da duplicata ${d.numeroDuplicata}`
                        : undefined
                    }
                    onClick={aguardandoAprovacao ? () => openOperacaoWizard(d) : undefined}
                    onKeyDown={
                      aguardandoAprovacao
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openOperacaoWizard(d);
                            }
                          }
                        : undefined
                    }
                  >
                    <TableCell className="font-mono text-sm">{d.numeroDuplicata}</TableCell>
                    <TableCell>{d.sacadoRazaoSocial}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(d.valor)}</TableCell>
                    <TableCell>{d.dataVencimento}</TableCell>
                    <TableCell>
                      <DuplicataAnaliseBadge
                        status={d.analiseAnalista}
                        interactive={aguardandoAprovacao}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <SellerDuplicataOperacaoWizardDialog
        open={operacaoWizardOpen}
        onOpenChange={(open) => {
          if (!open && operacaoSubmitting) return;
          setOperacaoWizardOpen(open);
          if (!open) setOperacaoDuplicata(null);
        }}
        duplicata={operacaoDuplicata}
        submitting={operacaoSubmitting}
        onApprove={handleOperacaoApprove}
        onReject={handleOperacaoReject}
      />
    </div>
  );
}
