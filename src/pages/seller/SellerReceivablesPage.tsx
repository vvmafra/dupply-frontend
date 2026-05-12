import { useEffect, useState } from "react";
import { SellerReceivablesTable } from "@/components/seller/SellerReceivablesTable";
import { fetchReceivables } from "@/services/receivables.service";
import type { Receivable } from "@/domain/receivables/receivable.types";

export function SellerReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceivables().then((data) => {
      setReceivables(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Meus recebíveis</h1>
        <p className="text-sm text-muted-foreground">Gerencie todos os seus títulos cadastrados</p>
      </div>
      <SellerReceivablesTable receivables={receivables} />
    </div>
  );
}
