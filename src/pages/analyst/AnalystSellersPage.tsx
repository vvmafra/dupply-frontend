import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnalystSellersTableSkeleton } from "@/components/analyst/AnalystListTablesSkeleton";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { getSellerCadastralReviewDisplayStatus } from "@/domain/risk-analyst/seller-cadastral-review.helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchSellerReviews } from "@/services/seller-review.service";
import { ROUTES } from "@/lib/routes";
import type { SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";

export function AnalystSellersPage() {
  const [rows, setRows] = useState<SellerReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerReviews().then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Cedentes</h1>
        <p className="text-sm text-muted-foreground">Visão consolidada para análise de risco</p>
      </div>
      {loading ? (
        <AnalystSellersTableSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-right">Score (IA)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.sellerId}>
                  <TableCell>
                    <Link
                      to={ROUTES.analyst.sellers.detail(r.sellerId)}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.legalName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{r.taxId}</TableCell>
                  <TableCell className="text-right">{r.riskScore}</TableCell>
                  <TableCell>
                    <DuplicataAnaliseBadge status={getSellerCadastralReviewDisplayStatus(r)} />
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
