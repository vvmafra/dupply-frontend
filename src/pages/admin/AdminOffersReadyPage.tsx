import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LIST_FILTER_ALL, ListFilterSelect } from "@/components/shared/ListFilterSelect";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { formatCurrencyBRL, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { listDuplicatasReadyForOffer } from "@/services/offer.service";

export function AdminOffersReadyPage() {
  const [rows, setRows] = useState<DuplicataTitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerFilter, setSellerFilter] = useState(LIST_FILTER_ALL);
  const [sellerOptions, setSellerOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setLoading(true);
    listDuplicatasReadyForOffer(
      sellerFilter === LIST_FILTER_ALL ? undefined : { sellerId: sellerFilter }
    ).then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, [sellerFilter]);

  // Load full queue once to populate seller options (independent of current filter)
  useEffect(() => {
    listDuplicatasReadyForOffer().then((data) => {
      const bySeller = new Map<string, string>();
      for (const row of data) {
        bySeller.set(row.sellerId, row.sellerName);
      }
      setSellerOptions(
        [...bySeller.entries()]
          .map(([value, label]) => ({ value, label }))
          .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))
      );
    });
  }, []);

  const emptyMessage = useMemo(() => {
    if (sellerFilter === LIST_FILTER_ALL) {
      return {
        title: "Nenhuma duplicata elegível",
        hint: "Quando um cedente aceitar a antecipação, o título aparece aqui.",
      };
    }
    const seller = sellerOptions.find((s) => s.value === sellerFilter)?.label;
    return {
      title: seller
        ? `Nenhuma duplicata pronta de ${seller}`
        : "Nenhuma duplicata para este cedente",
      hint: "Tente outro cedente ou limpe o filtro.",
    };
  }, [sellerFilter, sellerOptions]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Prontas para oferta</h1>
          <p className="text-sm text-muted-foreground">
            Duplicatas aprovadas pelo cedente e ainda sem oferta de investimento
          </p>
        </div>
        <ListFilterSelect
          id="admin-ready-seller"
          label="Cedente"
          value={sellerFilter}
          onValueChange={setSellerFilter}
          options={sellerOptions}
          allLabel="Todos os cedentes"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{emptyMessage.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{emptyMessage.hint}</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Duplicata</TableHead>
                <TableHead>Cedente</TableHead>
                <TableHead className="text-right">Valor face</TableHead>
                <TableHead className="text-right">Deságio</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.numeroDuplicata}</TableCell>
                  <TableCell>{row.sellerName}</TableCell>
                  <TableCell className="text-right">{formatCurrencyBRL(row.valor)}</TableCell>
                  <TableCell className="text-right">
                    {row.descontoAntecipacaoPercent != null
                      ? formatPercent(row.descontoAntecipacaoPercent)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm">
                      <Link to={ROUTES.admin.offers.create(row.id)}>Criar oferta</Link>
                    </Button>
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
