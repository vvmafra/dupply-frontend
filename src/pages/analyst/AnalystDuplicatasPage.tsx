import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnalystDuplicatasTableSkeleton } from "@/components/analyst/AnalystListTablesSkeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAllDuplicatas } from "@/services/duplicata.service";
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

const tipoLabel: Record<DuplicataTitulo["tipo"], string> = {
  mercantil: "Mercantil",
  servico: "Serviço",
};

const analiseLabel: Record<DuplicataTitulo["analiseAnalista"], string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export function AnalystDuplicatasPage() {
  const [items, setItems] = useState<DuplicataTitulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllDuplicatas().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Duplicatas</h1>
        <p className="text-sm text-muted-foreground">Verificação pelo analista de risco</p>
      </div>
      {loading ? (
        <AnalystDuplicatasTableSkeleton />
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
                <TableRow key={d.id}>
                  <TableCell>
                    <Link
                      to={ROUTES.analyst.duplicatas.detail(d.id)}
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {d.numeroDuplicata}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{d.sellerName}</TableCell>
                  <TableCell>{tipoLabel[d.tipo]}</TableCell>
                  <TableCell className="text-right">{formatCurrencyBRL(d.valor)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{analiseLabel[d.analiseAnalista]}</Badge>
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
