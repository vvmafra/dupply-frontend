import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { OFFER_VISIBLE_STAGES, RECEIVABLE_STAGE_LABELS } from "@/domain/offer/offer.constants";
import type { ReceivableStage } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatMonthlyRate } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";

function stageLabel(status?: string): string {
  return status && status in RECEIVABLE_STAGE_LABELS
    ? RECEIVABLE_STAGE_LABELS[status as ReceivableStage]
    : (status ?? "—");
}

/** Admin view of every receivable at its real backend stage (HTTP mode). */
export function AdminDuplicatasTable({ duplicatas }: Readonly<{ duplicatas: DuplicataTitulo[] }>) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Todas as duplicatas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Duplicata</TableHead>
                <TableHead>Cedente</TableHead>
                <TableHead>Sacado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Captação</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicatas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhuma duplicata registrada.
                  </TableCell>
                </TableRow>
              ) : (
                duplicatas.map((d) => {
                  const stage = d.statusRecebivel ?? "";
                  const isOffer = OFFER_VISIBLE_STAGES.has(stage as ReceivableStage);
                  const canOpenFunding = stage === "confirmed";
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-sm">{d.numeroDuplicata || d.id}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{d.sellerName}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{d.sacadoRazaoSocial}</TableCell>
                      <TableCell className="text-right">{formatCurrencyBRL(d.valor)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {d.targetFunding
                          ? `${formatCurrencyBRL(d.funded ?? 0)} / ${formatCurrencyBRL(d.targetFunding)}`
                          : d.yieldRateMonthly != null
                            ? formatMonthlyRate(d.yieldRateMonthly)
                            : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{stageLabel(d.statusRecebivel)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canOpenFunding && (
                          <Button asChild size="sm">
                            <Link to={ROUTES.admin.offers.create(d.id)}>Abrir captação</Link>
                          </Button>
                        )}
                        {isOffer && (
                          <Button asChild size="sm" variant="outline">
                            <Link to={ROUTES.admin.offers.detail(d.id)}>Ver captação</Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
