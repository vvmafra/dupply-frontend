import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncData } from "@/hooks/use-async-data";
import { LIST_FILTER_ALL, ListFilterSelect } from "@/components/shared/ListFilterSelect";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OFFER_STATUS_LABELS } from "@/domain/offer/offer.constants";
import type { Offer, OfferStatus } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { closeExpiredOffers, listOffers } from "@/services/offer.service";

const STATUS_OPTIONS = (
  Object.entries(OFFER_STATUS_LABELS) as [OfferStatus, string][]
).map(([value, label]) => ({ value, label }));

export function AdminOffersPage() {
  const [statusFilter, setStatusFilter] = useState(LIST_FILTER_ALL);

  const { data, loading } = useAsyncData<Offer[]>(async () => {
    await closeExpiredOffers();
    return listOffers(
      statusFilter === LIST_FILTER_ALL ? undefined : { status: statusFilter as OfferStatus },
    );
  }, [statusFilter]);
  const offers = data ?? [];

  const emptyMessage = useMemo(() => {
    if (statusFilter === LIST_FILTER_ALL) return "Nenhuma oferta criada";
    return `Nenhuma oferta com status "${OFFER_STATUS_LABELS[statusFilter as OfferStatus]}"`;
  }, [statusFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ofertas</h1>
          <p className="text-sm text-muted-foreground">Acompanhe captação, status e fechamentos</p>
        </div>
        <ListFilterSelect
          id="admin-offers-status"
          label="Status"
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : offers.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{emptyMessage}</p>
          {statusFilter === LIST_FILTER_ALL && (
            <Link to={ROUTES.admin.offers.ready} className="text-sm text-primary hover:underline">
              Ver duplicatas prontas
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oferta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Captado / Alvo</TableHead>
                <TableHead className="text-right">Retorno est.</TableHead>
                <TableHead className="text-right">FIDC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <Link
                      to={ROUTES.admin.offers.detail(offer.id)}
                      className="font-medium text-primary hover:underline"
                    >
                      {offer.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{OFFER_STATUS_LABELS[offer.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrencyBRL(offer.raisedAmount)} /{" "}
                    {formatCurrencyBRL(offer.targetAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(offer.estimatedInvestorReturnPercent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {offer.fidcBackfillAmount > 0
                      ? formatCurrencyBRL(offer.fidcBackfillAmount)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
