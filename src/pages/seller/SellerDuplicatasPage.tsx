import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { SellerDuplicatasListTableSkeleton } from "@/components/seller/SellerPageCardsSkeleton";
import { Button } from "@/components/ui/button";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchDuplicatasBySeller } from "@/services/duplicata.service";
import { fetchCurrentSeller } from "@/services/seller.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";
import { ROUTES } from "@/lib/routes";
import type { SellerCompany } from "@/domain/seller/seller.types";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

export function SellerDuplicatasPage() {
  const [items, setItems] = useState<DuplicataTitulo[]>([]);
  const [seller, setSeller] = useState<SellerCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await fetchCurrentSeller();
      const data = await fetchDuplicatasBySeller(s.id);
      setSeller(s);
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  let headerAction: ReactNode;
  if (loading) {
    headerAction = <Skeleton className="h-10 w-52 shrink-0 rounded-md" />;
  } else if (seller && canSellerRegisterDuplicatas(seller)) {
    headerAction = (
      <Button asChild>
        <Link to={ROUTES.seller.duplicatas.new}>Nova duplicata</Link>
      </Button>
    );
  } else {
    headerAction = (
      <Button variant="outline" asChild>
        <Link to={ROUTES.seller.validation}>Ver requisitos em Validação</Link>
      </Button>
    );
  }

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Duplicatas</h1>
        <p className="text-sm text-muted-foreground">
          Versão hackathon — envie títulos para análise do analista de risco
        </p>
      </div>
      {headerAction}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {header}
        <SellerDuplicatasListTableSkeleton />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Não foi possível carregar os dados do vendedor.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {header}
      <div className="rounded-md border">
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
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma duplicata enviada. Cadastre a primeira.
                </TableCell>
              </TableRow>
            ) : (
              items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-sm">{d.numeroDuplicata}</TableCell>
                  <TableCell>{d.sacadoRazaoSocial}</TableCell>
                  <TableCell className="text-right">{formatCurrencyBRL(d.valor)}</TableCell>
                  <TableCell>{d.dataVencimento}</TableCell>
                  <TableCell>
                    <DuplicataAnaliseBadge status={d.analiseAnalista} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
