import { Link, useNavigate } from "react-router-dom";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { TableSkeleton } from "@/components/shared/PageSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAsyncData } from "@/hooks/use-async-data";
import { DUPLICATA_TIPO_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import { fetchAllDuplicatas } from "@/services/duplicata.service";
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";

const TABLE_COLUMNS = [
  "Número",
  "Cedente",
  "Tipo",
  { label: "Valor", align: "right" as const },
  { label: "Análise", kind: "pill" as const },
];

export function AnalystDuplicatasPage() {
  const navigate = useNavigate();
  const { data, loading } = useAsyncData(fetchAllDuplicatas, []);
  const items = data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Duplicatas</h1>
        <p className="text-sm text-muted-foreground">Verificação pelo analista de risco</p>
      </div>
      {loading ? (
        <TableSkeleton columns={TABLE_COLUMNS} />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cedente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Análise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow
                  key={d.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(ROUTES.analyst.duplicatas.detail(d.id))}
                >
                  <TableCell>
                    <Link
                      to={ROUTES.analyst.duplicatas.detail(d.id)}
                      className="font-mono text-sm text-primary hover:underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {d.numeroDuplicata}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{d.sellerName}</TableCell>
                  <TableCell>{DUPLICATA_TIPO_LABELS[d.tipo]}</TableCell>
                  <TableCell className="text-right">{formatCurrencyBRL(d.valor)}</TableCell>
                  <TableCell>
                    <DuplicataAnaliseBadge status={d.analiseAnalista} />
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
