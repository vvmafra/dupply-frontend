import { Link } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { ReceivableStatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface SellerReceivablesPreviewProps {
  readonly receivables: ReceivableListItem[];
  readonly maxRows?: number;
  readonly canRegisterNew?: boolean;
}

export function SellerReceivablesPreview({
  receivables,
  maxRows = 5,
  canRegisterNew = true,
}: SellerReceivablesPreviewProps) {
  const rows = receivables.slice(0, maxRows);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="size-4" />
            Recebíveis recentes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.seller.receivables.list}>Ver todas</Link>
            </Button>
            {canRegisterNew && (
              <Button size="sm" asChild>
                <Link to={ROUTES.seller.receivables.new}>
                  <Plus className="size-4" />
                  Nova
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground px-4">
            <p className="text-sm">Nenhum recebível ainda.</p>
            {canRegisterNew ? (
              <Button className="mt-4" size="sm" asChild>
                <Link to={ROUTES.seller.receivables.new}>Cadastrar recebível</Link>
              </Button>
            ) : (
              <p className="text-xs mt-3 max-w-sm mx-auto">
                Após KYC e aprovação cadastral, você poderá cadastrar recebíveis em{" "}
                <Link to={ROUTES.seller.validation} className="underline font-medium text-foreground">
                  Validação
                </Link>
                .
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-t-0 rounded-t-none overflow-x-auto">
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
                {rows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.billNumber}</TableCell>
                    <TableCell>{item.payerLegalName}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(item.faceValue)}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <ReceivableStatusBadge
                        status={item.status}
                        interactive={item.status === "offer"}
                      />
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
