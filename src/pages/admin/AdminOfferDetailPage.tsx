import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  INVESTMENT_STATUS_LABELS,
  NEXT_RECEIVABLE_STAGE,
  OFFER_STATUS_LABELS,
  RECEIVABLE_STAGE_LABELS,
  RISK_LEVEL_LABELS,
} from "@/domain/offer/offer.constants";
import { calcFundingProgress, calcMinProgress } from "@/domain/offer/offer-economics.helpers";
import type { Investment, Offer } from "@/domain/offer/offer.types";
import { resolveApiMode } from "@/lib/env";
import { formatCurrencyBRL, formatDateTime, formatMonthlyRate, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import {
  advanceOfferStage,
  closeExpiredOffers,
  closeOffer,
  getOfferById,
  listInvestmentsByOffer,
  simulateOfferDeadline,
} from "@/services/offer.service";

export function AdminOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isHttp = resolveApiMode() === "http";
  const [acting, setActing] = useState(false);

  const { data, loading, reload: refresh } = useAsyncData<{
    offer: Offer | null;
    investments: Investment[];
  }>(
    async () => {
      await closeExpiredOffers();
      const [offer, investments] = await Promise.all([getOfferById(id!), listInvestmentsByOffer(id!)]);
      return { offer, investments };
    },
    [id],
    { enabled: Boolean(id) },
  );
  const offer = data?.offer ?? null;
  const investments = data?.investments ?? [];

  async function runAction(action: () => Promise<void>, fallback: string) {
    setActing(true);
    try {
      await action();
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : fallback);
    } finally {
      setActing(false);
    }
  }

  function handleClose() {
    if (!offer) return;
    void runAction(async () => {
      const closed = await closeOffer(offer.id);
      toast.success("Oferta encerrada", { description: OFFER_STATUS_LABELS[closed.status] });
    }, "Falha ao encerrar.");
  }

  function handleSimulateDeadline() {
    if (!offer) return;
    void runAction(async () => {
      await simulateOfferDeadline(offer.id);
      toast.success("Deadline simulado", { description: "Oferta encerrada com as regras híbridas." });
    }, "Falha ao simular.");
  }

  function handleAdvanceStage() {
    if (!offer) return;
    void runAction(async () => {
      const result = await advanceOfferStage(offer.id);
      toast.success("Etapa avançada", {
        description: `${RECEIVABLE_STAGE_LABELS[result.from]} → ${RECEIVABLE_STAGE_LABELS[result.to]}${
          result.to === "payer_settled" ? " · investidores creditados (principal + juros)" : ""
        }`,
      });
    }, "Falha ao avançar a etapa.");
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando oferta...</div>;
  }

  if (!offer) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm">Oferta não encontrada.</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.admin.offers.list}>Voltar</Link>
        </Button>
      </div>
    );
  }

  const progress = calcFundingProgress(offer.raisedAmount, offer.targetAmount);
  const minMarker = calcMinProgress(offer.minAmount, offer.targetAmount);
  const stage = offer.receivableStage;
  const nextStage = stage ? NEXT_RECEIVABLE_STAGE[stage] : undefined;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{offer.id}</h1>
          <p className="text-sm text-muted-foreground">
            Duplicata {offer.duplicataId} · risco {RISK_LEVEL_LABELS[offer.riskLevel]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stage && <Badge variant="outline">{RECEIVABLE_STAGE_LABELS[stage]}</Badge>}
          <Badge variant="secondary">{OFFER_STATUS_LABELS[offer.status]}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Captação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Captado: </span>
              {formatCurrencyBRL(offer.raisedAmount)}
            </p>
            <p>
              <span className="text-muted-foreground">Alvo: </span>
              {formatCurrencyBRL(offer.targetAmount)}
            </p>
            <p>
              <span className="text-muted-foreground">Mínimo de captação: </span>
              {formatCurrencyBRL(offer.minAmount)}
            </p>
            <p>
              <span className="text-muted-foreground">Ticket mínimo: </span>
              {offer.minInvestment > 0 ? formatCurrencyBRL(offer.minInvestment) : "sem mínimo"}
            </p>
            <p>
              <span className="text-muted-foreground">Rentabilidade investidor: </span>
              {formatMonthlyRate(offer.yieldRateMonthly)}
            </p>
            {!isHttp && (
              <p>
                <span className="text-muted-foreground">Spread plataforma: </span>
                {formatPercent(offer.platformSpreadPercent)}
              </p>
            )}
            <p>
              <span className="text-muted-foreground">{isHttp ? "Vencimento: " : "Prazo: "}</span>
              {formatDateTime(offer.deadline)}
            </p>
          </div>
          <div className="relative">
            <Progress value={progress} />
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-foreground/50"
              style={{ left: `${minMarker}%` }}
            />
          </div>
          {offer.status === "disbursed" && (
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">{isHttp ? "Captação concluída" : "Fechamento"}</p>
              <p className="text-muted-foreground">
                Investidores {formatCurrencyBRL(offer.raisedAmount)}
                {offer.fidcBackfillAmount > 0
                  ? ` · FIDC ${formatCurrencyBRL(offer.fidcBackfillAmount)}`
                  : isHttp
                    ? ""
                    : " · sem backfill FIDC"}
              </p>
            </div>
          )}
          {offer.status === "failed" && (
            <p className="text-destructive">Captação abaixo do mínimo — investimentos estornados.</p>
          )}
        </CardContent>
      </Card>

      {isHttp && stage && nextStage && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleAdvanceStage} disabled={acting}>
            {acting ? <Loader2 className="size-4 animate-spin" /> : null}
            Avançar etapa
          </Button>
          <span className="text-xs text-muted-foreground">
            {RECEIVABLE_STAGE_LABELS[stage]} → {RECEIVABLE_STAGE_LABELS[nextStage]}
            {nextStage === "payer_settled" && " · executa o pagamento aos investidores"}
          </span>
        </div>
      )}

      {!isHttp && offer.status === "fundraising" && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleClose} disabled={acting}>
            {acting ? <Loader2 className="size-4 animate-spin" /> : null}
            Encerrar oferta
          </Button>
          <Button variant="outline" onClick={handleSimulateDeadline} disabled={acting}>
            Simular deadline
          </Button>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Investimentos</CardTitle>
          {investments.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {Math.min(investments.length, 10)} de {investments.length}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {investments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {isHttp
                ? `Captado ${formatCurrencyBRL(offer.raisedAmount)} de ${formatCurrencyBRL(offer.targetAmount)}. A listagem por investidor ainda não é exposta pelo backend.`
                : "Nenhum investimento ainda."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investidor</TableHead>
                    <TableHead className="text-right">Cotas</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.slice(0, 10).map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.investorUserId}</TableCell>
                      <TableCell className="text-right">{inv.quotaCount}</TableCell>
                      <TableCell className="text-right">{formatCurrencyBRL(inv.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{INVESTMENT_STATUS_LABELS[inv.status]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button asChild variant="outline" size="sm">
                <Link to={`${ROUTES.admin.investments}?offerId=${encodeURIComponent(offer.id)}`}>
                  Ver todos os investimentos
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link to={ROUTES.admin.offers.list}>Voltar à lista</Link>
      </Button>
    </div>
  );
}
