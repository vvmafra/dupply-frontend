import { useEffect, useState } from "react";
import { SellerDashboardSummary } from "@/components/seller/SellerDashboardSummary";
import {
  SellerDashboardSummarySkeleton,
  SellerDuplicatasPreviewCardSkeleton,
  SellerValidationProgressCardSkeleton,
} from "@/components/seller/SellerPageCardsSkeleton";
import { SellerValidationProgress } from "@/components/seller/SellerValidationProgress";
import { SellerDuplicatasPreview } from "@/components/seller/SellerDuplicatasPreview";
import { fetchCurrentSeller } from "@/services/seller.service";
import { fetchDuplicatasBySeller } from "@/services/duplicata.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

export function SellerDashboardPage() {
  const [seller, setSeller] = useState<SellerCompany | null>(null);
  const [duplicatas, setDuplicatas] = useState<DuplicataTitulo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await fetchCurrentSeller();
      const d = await fetchDuplicatasBySeller(s.id);
      setSeller(s);
      setDuplicatas(d);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral das suas duplicatas</p>
      </div>

      {loading ? (
        <>
          <SellerValidationProgressCardSkeleton />
          <SellerDashboardSummarySkeleton />
          <SellerDuplicatasPreviewCardSkeleton />
        </>
      ) : (
        <>
          {seller && (
            <SellerValidationProgress seller={seller} duplicatas={duplicatas} />
          )}
          <SellerDashboardSummary duplicatas={duplicatas} />
          <SellerDuplicatasPreview
            duplicatas={duplicatas}
            canRegisterNew={seller ? canSellerRegisterDuplicatas(seller) : false}
          />
        </>
      )}
    </div>
  );
}
