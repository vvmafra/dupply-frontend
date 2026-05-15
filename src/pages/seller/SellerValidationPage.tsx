import { useEffect, useState } from "react";
import { SellerKycCard } from "@/components/seller/SellerKycCard";
import {
  SellerKycCardSkeleton,
  SellerValidationDuplicatasOverviewCardSkeleton,
  SellerValidationProgressCardSkeleton,
} from "@/components/seller/SellerPageCardsSkeleton";
import { SellerValidationProgress } from "@/components/seller/SellerValidationProgress";
import { SellerValidationDuplicatasOverview } from "@/components/seller/SellerValidationDuplicatasOverview";
import { fetchCurrentSeller, updateSellerValidationStatus } from "@/services/seller.service";
import { fetchDuplicatasBySeller } from "@/services/duplicata.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

export function SellerValidationPage() {
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

  async function handleKycApproved() {
    if (!seller) return;
    await updateSellerValidationStatus(seller.id, { validationStatus: "UNDER_REVIEW", kycStatus: "APPROVED" });
    setSeller((prev) => (prev ? { ...prev, validationStatus: "UNDER_REVIEW", kycStatus: "APPROVED" } : prev));
  }

  const titleBlock = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Validação cadastral</h1>
      <p className="text-sm text-muted-foreground">
        Acompanhe KYC, aprovação na plataforma e liberação do analista para enviar duplicatas. Os documentos do
        cadastro inicial já foram enviados no registro.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {titleBlock}
        <SellerValidationProgressCardSkeleton />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <SellerKycCardSkeleton />
          </div>
          <SellerValidationDuplicatasOverviewCardSkeleton />
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

  const canRegisterDuplicatas = canSellerRegisterDuplicatas(seller);

  return (
    <div className="p-6 space-y-6">
      {titleBlock}
      <SellerValidationProgress seller={seller} duplicatas={duplicatas} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SellerKycCard kycStatus={seller.kycStatus} onApproved={handleKycApproved} />
        </div>
        <SellerValidationDuplicatasOverview
          items={duplicatas}
          canRegisterNew={canRegisterDuplicatas}
        />
      </div>
    </div>
  );
}
