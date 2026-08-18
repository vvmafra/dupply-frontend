import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { INVESTMENT_STATUS_LABELS } from "@/domain/offer/offer.constants";
import type { Investment, InvestmentStatus } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatDateTime } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { listInvestmentsByInvestor } from "@/services/offer.service";

const STATUS_OPTIONS = (
  Object.entries(INVESTMENT_STATUS_LABELS) as [InvestmentStatus, string][]
).map(([value, label]) => ({ value, label }));

export function InvestorInvestmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(LIST_FILTER_ALL);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    listInvestmentsByInvestor(
      user.id,
      statusFilter === LIST_FILTER_ALL
        ? undefined
        : { status: statusFilter as InvestmentStatus }
    ).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [user, statusFilter]);

  const emptyMessage = useMemo(() => {
    if (statusFilter === LIST_FILTER_ALL) {
      return {
        title: "Você ainda não investiu",
        showCta: true,
      };
    }
    return {
      title: `Nenhum investimento ${INVESTMENT_STATUS_LABELS[statusFilter as InvestmentStatus].toLowerCase()}`,
      showCta: false,
    };
  }, [statusFilter]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Meus investimentos</h1>
          <p className="text-sm text-muted-foreground">Posições mockadas nesta demonstração</p>
        </div>
        <ListFilterSelect
          id="investor-investments-status"
          label="Status"
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />
      </div>

      {!loading && items.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {items.length} posição(ões) · total {formatCurrencyBRL(totalAmount)}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center space-y-3">
          <p className="font-medium">{emptyMessage.title}</p>
          {emptyMessage.showCta && (
            <Link to={ROUTES.investor.opportunities} className="text-sm text-primary hover:underline">
              Ver oportunidades
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell>
                    <Link
                      to={ROUTES.investor.offerDetail(item.offerId)}
                      className="font-semibold text-primary hover:underline"
                    >
                      Oferta {item.offerId.slice(-6)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{item.quotaCount}</TableCell>
                  <TableCell className="text-right">{formatCurrencyBRL(item.amount)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="w-fit">{INVESTMENT_STATUS_LABELS[item.status]}</Badge>
                      {item.receivable && (
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Duplicata: {
                            (item.receivable.status === "funding" || item.receivable.status === "fundraising")
                              ? "Captando"
                              : (item.receivable.status === "funded" || item.receivable.status === "processing" || item.receivable.status === "disbursed")
                              ? "Em Andamento"
                              : "Liquidada"
                          }
                        </span>
                      )}
                    </div>
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
