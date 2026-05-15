import { Link } from "react-router-dom";
import { Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

const analiseLabel: Record<DuplicataTitulo["analiseAnalista"], string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

interface SellerDuplicatasPreviewProps {
  duplicatas: DuplicataTitulo[];
  maxRows?: number;
  /** Quando false, oculta atalhos para cadastrar nova duplicata (ex.: analista ainda não liberou). */
  canRegisterNew?: boolean;
}

export function SellerDuplicatasPreview({
  duplicatas,
  maxRows = 5,
  canRegisterNew = true,
}: SellerDuplicatasPreviewProps) {
  const rows = duplicatas.slice(0, maxRows);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="size-4" />
            Duplicatas recentes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.seller.duplicatas.list}>Ver todas</Link>
            </Button>
            {canRegisterNew && (
              <Button size="sm" asChild>
                <Link to={ROUTES.seller.duplicatas.new}>
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
            <p className="text-sm">Nenhuma duplicata ainda.</p>
            {canRegisterNew ? (
              <Button className="mt-4" size="sm" asChild>
                <Link to={ROUTES.seller.duplicatas.new}>Cadastrar duplicata</Link>
              </Button>
            ) : (
              <p className="text-xs mt-3 max-w-sm mx-auto">
                Após KYC, aprovação cadastral e liberação do analista, você poderá cadastrar duplicatas em{" "}
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
                  <TableHead>Análise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.numeroDuplicata}</TableCell>
                    <TableCell>{d.sacadoRazaoSocial}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(d.valor)}</TableCell>
                    <TableCell>{d.dataVencimento}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{analiseLabel[d.analiseAnalista]}</Badge>
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
