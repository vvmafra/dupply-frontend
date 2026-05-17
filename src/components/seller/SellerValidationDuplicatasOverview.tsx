import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
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
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

interface SellerValidationDuplicatasOverviewProps {
  readonly items: DuplicataTitulo[];
  readonly canRegisterNew: boolean;
}

export function SellerValidationDuplicatasOverview({
  items,
  canRegisterNew,
}: SellerValidationDuplicatasOverviewProps) {
  const preview = items.slice(0, 6);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2">
            <Receipt className="size-5 shrink-0 mt-0.5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Suas duplicatas</CardTitle>
              <CardDescription>
                Resumo do que você já enviou para análise (quando houver).
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.seller.duplicatas.list}>Ver lista completa</Link>
            </Button>
            {canRegisterNew && (
              <Button size="sm" asChild>
                <Link to={ROUTES.seller.duplicatas.new}>Nova duplicata</Link>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {preview.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Você ainda não enviou nenhuma duplicata.
            {canRegisterNew ? " Quando estiver liberado, use o botão acima ou o menu lateral." : " Após a liberação do analista, você poderá cadastrar aqui."}
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
                  <TableHead>Análise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-sm">{d.numeroDuplicata}</TableCell>
                    <TableCell>{d.sacadoRazaoSocial}</TableCell>
                    <TableCell className="text-right">{formatCurrencyBRL(d.valor)}</TableCell>
                    <TableCell>{d.dataVencimento}</TableCell>
                    <TableCell>
                      <DuplicataAnaliseBadge status={d.analiseAnalista} />
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
