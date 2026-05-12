import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { TrendingUp } from "lucide-react";
import { formatCurrencyBRL, formatDate, formatPercent } from "@/lib/formatters";
import { getInvestmentStatusLabel, getInvestmentStatusColor } from "@/domain/investor/investment.helpers";
import { cn } from "@/lib/utils";
import type { Investment } from "@/domain/investor/investment.types";

interface InvestorPositionsTableProps {
  investments: Investment[];
}

export function InvestorPositionsTable({ investments }: InvestorPositionsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="size-4" />
          Minhas posições
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {investments.length === 0 ? (
          <div className="p-6">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Nenhum investimento ainda</EmptyTitle>
                <EmptyDescription>
                  Explore o marketplace e simule seu primeiro investimento.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Duplicata</TableHead>
                <TableHead className="hidden sm:table-cell">Sacado</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right hidden md:table-cell">Retorno</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Taxa</TableHead>
                <TableHead className="hidden lg:table-cell">Vencimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs">{inv.operationCode}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">{inv.debtorName}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrencyBRL(inv.investedAmount)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-success hidden md:table-cell">
                    +{formatCurrencyBRL(inv.estimatedReturn)}
                  </TableCell>
                  <TableCell className="text-right text-sm hidden lg:table-cell">
                    {formatPercent(inv.rate)}
                  </TableCell>
                  <TableCell className="text-sm hidden lg:table-cell">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(getInvestmentStatusColor(inv.status), "text-xs")}
                    >
                      {getInvestmentStatusLabel(inv.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
