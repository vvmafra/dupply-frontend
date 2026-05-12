import { useEffect, useState } from "react";
import { SellerDashboardSummary } from "@/components/seller/SellerDashboardSummary";
import { SellerValidationProgress } from "@/components/seller/SellerValidationProgress";
import { SellerReceivablesTable } from "@/components/seller/SellerReceivablesTable";
import { fetchCurrentSeller } from "@/services/seller.service";
import { fetchReceivables } from "@/services/receivables.service";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type { Receivable } from "@/domain/receivables/receivable.types";

export function SellerDashboardPage() {
  const [seller, setSeller] = useState<SellerCompany | null>(null);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, r] = await Promise.all([fetchCurrentSeller(), fetchReceivables()]);
      setSeller(s);
      setReceivables(r);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos seus recebíveis</p>
      </div>

      {seller && (
        <SellerValidationProgress seller={seller} />
      )}

      <SellerDashboardSummary receivables={receivables} />

      <SellerReceivablesTable receivables={receivables.slice(0, 5)} />
    </div>
  );
}
