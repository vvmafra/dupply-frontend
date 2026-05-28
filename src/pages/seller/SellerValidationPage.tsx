import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SellerKycCard } from "@/components/seller/SellerKycCard";
import {
  SellerKycCardSkeleton,
  SellerValidationReceivablesOverviewCardSkeleton,
  SellerValidationProgressCardSkeleton,
} from "@/components/seller/SellerPageCardsSkeleton";
import { SellerValidationProgress } from "@/components/seller/SellerValidationProgress";
import { SellerValidationReceivablesOverview } from "@/components/seller/SellerValidationReceivablesOverview";
import { Button } from "@/components/ui/button";
import { ReceivableError } from "@/domain/receivable/receivable.errors";
import type { ReceivableListItem } from "@/domain/receivable/receivable.types";
import { canSellerRegisterReceivables } from "@/domain/seller/seller-receivable-access";
import { SellerProfileError } from "@/domain/seller/seller-profile.errors";
import { useSeller } from "@/contexts/SellerContext";
import { fetchReceivables } from "@/services/receivable.service";
import { updateSellerValidationStatus } from "@/services/seller.service";

export function SellerValidationPage() {
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

  async function handleKycApproved() {
    if (!seller) return;
    try {
      await updateSellerValidationStatus(seller.id, {
        validationStatus: "UNDER_REVIEW",
        kycStatus: "APPROVED",
      });
      await refreshSeller();
      toast.success("Cadastro enviado para análise.");
    } catch (err) {
      toast.error(
        err instanceof SellerProfileError
          ? err.message
          : "Não foi possível enviar o cadastro para análise.",
      );
    }
  }

  const titleBlock = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Validação cadastral</h1>
      <p className="text-sm text-muted-foreground">
        Acompanhe KYC e aprovação na plataforma para enviar recebíveis. Os documentos do cadastro
        inicial já foram enviados no registro.
      </p>
    </div>
  );

  const loading = (isLoading && !seller) || receivablesLoading;

  if (fetchError && !seller) {
    return (
      <div className="p-6 space-y-6">
        {titleBlock}
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={() => void refreshSeller()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {titleBlock}
        <SellerValidationProgressCardSkeleton />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SellerKycCardSkeleton />
          </div>
          <SellerValidationReceivablesOverviewCardSkeleton />
        </div>
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

  const canRegisterReceivables = canSellerRegisterReceivables(seller);

  return (
    <div className="p-6 space-y-6">
      {titleBlock}
      <SellerValidationProgress seller={seller} receivables={receivables} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SellerKycCard kycStatus={seller.kycStatus} onApproved={handleKycApproved} />
        </div>
        <SellerValidationReceivablesOverview
          items={receivables}
          canRegisterNew={canRegisterReceivables}
        />
      </div>
    </div>
  );
}
