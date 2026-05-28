import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnalystReceivablesTableSkeleton } from "@/components/analyst/AnalystListTablesSkeleton";
import { ReceivableStatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReceivableListItem } from "@/domain/receivable/receivable.types";
import { formatCurrencyBRL } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { fetchReceivables } from "@/services/receivable.service";

export function AnalystReceivablesPage() {
  const [items, setItems] = useState<ReceivableListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceivables()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Recebíveis</h1>
        <p className="text-sm text-muted-foreground">Verificação pelo analista de risco</p>
      </div>
      {loading ? (
        <AnalystReceivablesTableSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cedente</TableHead>
                <TableHead>Sacado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum recebível encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        to={ROUTES.analyst.receivables.detail(item.id)}
                        className="font-mono text-sm text-primary hover:underline"
                      >
                        {item.billNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">—</TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.payerLegalName}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(item.faceValue)}</TableCell>
                    <TableCell>
                      <ReceivableStatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
