import { CircleCheck as CheckCircle2, Circle as XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTaxId, formatDate } from "@/lib/formatters";
import { getValidationStatusLabel, getValidationStatusColor } from "@/domain/seller/seller.validation";
import { cn } from "@/lib/utils";
import type { AdminValidationRow } from "@/domain/admin/admin.types";

interface AdminValidationTableProps {
  rows: AdminValidationRow[];
  onApprove: (sellerId: string) => void;
  onReject: (sellerId: string) => void;
}

export function AdminValidationTable({ rows, onApprove, onReject }: AdminValidationTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Vendedores em validação</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead className="hidden sm:table-cell">CNPJ</TableHead>
              <TableHead className="hidden md:table-cell">Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{row.companyName}</p>
                    <p className="text-xs text-muted-foreground">{row.contactEmail}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm font-mono">
                  {formatTaxId(row.taxId)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {formatDate(row.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(getValidationStatusColor(row.validationStatus), "text-xs")}
                  >
                    {getValidationStatusLabel(row.validationStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {row.validationStatus === "UNDER_REVIEW" && (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-success border-success/40 hover:bg-success/10"
                        onClick={() => onApprove(row.id)}
                      >
                        <CheckCircle2 className="size-3" />
                        Aprovar
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => onReject(row.id)}
                      >
                        <XCircle className="size-3" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
