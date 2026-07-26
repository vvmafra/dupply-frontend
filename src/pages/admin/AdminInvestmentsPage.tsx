import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LIST_FILTER_ALL, ListFilterSelect } from "@/components/shared/ListFilterSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INVESTMENT_STATUS_LABELS } from "@/domain/offer/offer.constants";
import type { Investment, InvestmentStatus } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatDateTime } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { listAllInvestments } from "@/services/offer.service";

const STATUS_OPTIONS = (
  Object.entries(INVESTMENT_STATUS_LABELS) as [InvestmentStatus, string][]
).map(([value, label]) => ({ value, label }));

export function AdminInvestmentsPage() {
  const [searchParams] = useSearchParams();
  const offerIdFilter = searchParams.get("offerId") ?? undefined;
  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(LIST_FILTER_ALL);

  useEffect(() => {
    setLoading(true);
    listAllInvestments({
      offerId: offerIdFilter,
      status:
        statusFilter === LIST_FILTER_ALL
          ? undefined
          : (statusFilter as InvestmentStatus),
    }).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [offerIdFilter, statusFilter]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Investimentos</h1>
          <p className="text-sm text-muted-foreground">
            {offerIdFilter
              ? `Filtrado pela oferta ${offerIdFilter}`
              : "Todos os investimentos mockados da plataforma"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ListFilterSelect
            id="admin-investments-status"
            label="Status"
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          {offerIdFilter && (
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.admin.investments}>Ver todos</Link>
            </Button>
          )}
        </div>
      </div>

      {!loading && items.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {items.length} investimento(s) · total {formatCurrencyBRL(totalAmount)}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">Nenhum investimento encontrado</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investidor</TableHead>
                <TableHead>Oferta</TableHead>
                <TableHead className="text-right">Cotas</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.investorUserId}</TableCell>
                  <TableCell>
                    <Link
                      to={ROUTES.admin.offers.detail(item.offerId)}
                      className="text-primary hover:underline font-medium"
                    >
                      {item.offerId}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{item.quotaCount}</TableCell>
                  <TableCell className="text-right">{formatCurrencyBRL(item.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{INVESTMENT_STATUS_LABELS[item.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(item.createdAt)}
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
