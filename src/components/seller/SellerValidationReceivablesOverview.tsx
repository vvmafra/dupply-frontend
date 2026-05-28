import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { ReceivableStatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface SellerValidationReceivablesOverviewProps {
  readonly items: ReceivableListItem[];
  readonly canRegisterNew: boolean;
}

export function SellerValidationReceivablesOverview({
  items,
  canRegisterNew,
}: SellerValidationReceivablesOverviewProps) {
  const preview = items.slice(0, 6);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Receipt className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Seus recebíveis</CardTitle>
              <CardDescription>
                Resumo do que você já enviou para análise (quando houver).
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.seller.receivables.list}>Ver lista completa</Link>
            </Button>
            {canRegisterNew && (
              <Button size="sm" asChild>
                <Link to={ROUTES.seller.receivables.new}>Nova recebível</Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {preview.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Você ainda não enviou nenhum recebível.
            {canRegisterNew
              ? " Quando estiver liberado, use o botão acima ou o menu lateral."
              : " Após a aprovação cadastral, você poderá cadastrar aqui."}
          </p>
        ) : (
          <div className="rounded-md border overflow-x-auto">
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
                {preview.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.billNumber}</TableCell>
                    <TableCell>{item.payerLegalName}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(item.faceValue)}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <ReceivableStatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
