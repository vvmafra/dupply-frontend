import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminSellersTableSkeleton } from "@/components/admin/AdminPagesSkeleton";
import { Badge } from "@/components/ui/badge";
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

export function AdminSellersPage() {
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
        <h1 className="text-xl font-semibold tracking-tight">Cedentes e análise de risco</h1>
        <p className="text-sm text-muted-foreground">
          Lista de cedentes e qual analista registrou a revisão cadastral
        </p>
      </div>
      {loading ? (
        <AdminSellersTableSkeleton />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cedente</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead className="text-right">Score (IA)</TableHead>
                <TableHead>Analista</TableHead>
                <TableHead>Data revisão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.sellerId}>
                  <TableCell>
                    <Link
                      to={ROUTES.admin.sellers.detail(r.sellerId)}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.legalName}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{r.taxId}</TableCell>
                  <TableCell className="text-right">{r.riskScore}</TableCell>
                  <TableCell>
                    {r.reviewedByAnalystName ? (
                      <Badge variant="secondary">{r.reviewedByAnalystName}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString("pt-BR") : "—"}
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
