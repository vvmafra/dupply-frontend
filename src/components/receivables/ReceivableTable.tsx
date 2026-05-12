import * as React from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReceivableStatusBadge } from "./ReceivableStatusBadge";
import { RiskBadge } from "./RiskBadge";
import { ScoreBadge } from "./ScoreBadge";
import { formatCurrencyBRL, formatDate } from "@/lib/formatters";
import type { Receivable } from "@/domain/receivables/receivable.types";

interface ReceivableTableProps {
  receivables: Receivable[];
  detailBasePath: string;
  extraColumn?: {
    header: string;
    render: (r: Receivable) => React.ReactNode;
  };
}

export function ReceivableTable({ receivables, detailBasePath, extraColumn }: ReceivableTableProps) {
  if (receivables.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhum recebível encontrado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Duplicata</TableHead>
            <TableHead>Sacado</TableHead>
            <TableHead className="text-right">Valor Bruto</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Risco</TableHead>
            <TableHead>Status</TableHead>
            {extraColumn && <TableHead>{extraColumn.header}</TableHead>}
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receivables.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-sm font-medium">{r.tradeNoteNumber}</TableCell>
              <TableCell className="text-sm">{r.debtorName}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrencyBRL(r.grossAmount)}</TableCell>
              <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
              <TableCell><ScoreBadge score={r.score} /></TableCell>
              <TableCell><RiskBadge risk={r.risk} /></TableCell>
              <TableCell><ReceivableStatusBadge status={r.status} /></TableCell>
              {extraColumn && <TableCell>{extraColumn.render(r)}</TableCell>}
              <TableCell>
                <Button variant="ghost" size="icon-sm" asChild>
                  <Link to={`${detailBasePath}/${r.id}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
