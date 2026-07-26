import { useCallback, useEffect, useState } from "react";
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
import {
  INVESTMENT_STATUS_LABELS,
  OFFER_STATUS_LABELS,
  RISK_LEVEL_LABELS,
} from "@/domain/offer/offer.constants";
import {
  calcFundingProgress,
  calcMinProgress,
} from "@/domain/offer/offer-economics.helpers";
import type { Investment, Offer } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatDateTime, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import {
  closeExpiredOffers,
  closeOffer,
  getOfferById,
  listInvestmentsByOffer,
  simulateOfferDeadline,
} from "@/services/offer.service";

export function AdminOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await closeExpiredOffers();
      const [nextOffer, nextInvestments] = await Promise.all([
        getOfferById(id),
        listInvestmentsByOffer(id),
      ]);
      setOffer(nextOffer);
      setInvestments(nextInvestments);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleClose() {
    if (!offer) return;
    setActing(true);
    try {
      const closed = await closeOffer(offer.id);
      toast.success("Oferta encerrada", {
        description: OFFER_STATUS_LABELS[closed.status],
      });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao encerrar.");
    } finally {
      setActing(false);
    }
  }

  async function handleSimulateDeadline() {
    if (!offer) return;
    setActing(true);
    try {
      await simulateOfferDeadline(offer.id);
      toast.success("Deadline simulado", {
        description: "Oferta encerrada com as regras híbridas.",
      });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao simular.");
    } finally {
      setActing(false);
    }
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

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{offer.id}</h1>
          <p className="text-sm text-muted-foreground">
            Duplicata {offer.duplicataId} · risco {RISK_LEVEL_LABELS[offer.riskLevel]}
          </p>
        </div>
        <Badge variant="secondary">{OFFER_STATUS_LABELS[offer.status]}</Badge>
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
              <span className="text-muted-foreground">Mínimo: </span>
              {formatCurrencyBRL(offer.minAmount)}
            </p>
            <p>
              <span className="text-muted-foreground">Retorno investidor: </span>
              {formatPercent(offer.estimatedInvestorReturnPercent)}
            </p>
            <p>
              <span className="text-muted-foreground">Spread plataforma: </span>
              {formatPercent(offer.platformSpreadPercent)}
            </p>
            <p>
              <span className="text-muted-foreground">Prazo: </span>
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
              <p className="font-medium">Fechamento</p>
              <p className="text-muted-foreground">
                Investidores {formatCurrencyBRL(offer.raisedAmount)}
                {offer.fidcBackfillAmount > 0
                  ? ` · FIDC ${formatCurrencyBRL(offer.fidcBackfillAmount)}`
                  : " · sem backfill FIDC"}
              </p>
            </div>
          )}
          {offer.status === "failed" && (
            <p className="text-destructive">
              Captação abaixo do mínimo — investimentos estornados.
            </p>
          )}
        </CardContent>
      </Card>

      {offer.status === "fundraising" && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleClose()} disabled={acting}>
            {acting ? <Loader2 className="size-4 animate-spin" /> : null}
            Encerrar oferta
          </Button>
          <Button variant="outline" onClick={() => void handleSimulateDeadline()} disabled={acting}>
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
            <p className="text-sm text-muted-foreground">Nenhum investimento ainda.</p>
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