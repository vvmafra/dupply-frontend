import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SellerDashboardSummary } from "@/components/seller/SellerDashboardSummary";
import { SellerWalletReconnectBanner } from "@/components/seller/SellerWalletReconnectBanner";
import {
  SellerDashboardSummarySkeleton,
  SellerReceivablesPreviewCardSkeleton,
  SellerValidationProgressCardSkeleton,
} from "@/components/seller/SellerPageCardsSkeleton";
import { SellerReceivablesPreview } from "@/components/seller/SellerReceivablesPreview";
import { SellerValidationProgress } from "@/components/seller/SellerValidationProgress";
import { Button } from "@/components/ui/button";
import { ReceivableError } from "@/domain/receivable/receivable.errors";
import type { ReceivableListItem } from "@/domain/receivable/receivable.types";
import { canSellerRegisterReceivables } from "@/domain/seller/seller-receivable-access";
import { useSeller } from "@/contexts/SellerContext";
import { fetchReceivables } from "@/services/receivable.service";

export function SellerDashboardPage() {
  const { seller, isLoading, fetchError, refreshSeller } = useSeller();
  const [receivables, setReceivables] = useState<ReceivableListItem[]>([]);
  const [receivablesLoading, setReceivablesLoading] = useState(true);

  useEffect(() => {
    if (!seller && !isLoading && !fetchError) void refreshSeller();
  }, [seller, isLoading, fetchError, refreshSeller]);

  useEffect(() => {
    if (!seller) return;

    async function loadReceivables() {
      setReceivablesLoading(true);
      try {
        const items = await fetchReceivables();
        setReceivables(items);
      } catch (err) {
        toast.error(
          err instanceof ReceivableError
            ? err.message
            : "Não foi possível carregar os recebíveis.",
        );
      } finally {
        setReceivablesLoading(false);
      }
    }

    void loadReceivables();
  }, [seller]);

  const loading = (isLoading && !seller) || receivablesLoading;

  if (fetchError && !seller) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={() => void refreshSeller()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <SellerWalletReconnectBanner />

      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral dos seus recebíveis</p>
      </div>

      {loading ? (
        <>
          <SellerValidationProgressCardSkeleton />
          <SellerDashboardSummarySkeleton />
          <SellerReceivablesPreviewCardSkeleton />
        </>
      ) : (
        <>
          {seller && <SellerValidationProgress seller={seller} receivables={receivables} />}
          <SellerDashboardSummary receivables={receivables} />
          <SellerReceivablesPreview
            receivables={receivables}
            canRegisterNew={seller ? canSellerRegisterReceivables(seller) : false}
          />
        </>
      )}
    </div>
  );
}
