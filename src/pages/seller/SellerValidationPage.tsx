import { SellerKycCard } from "@/components/seller/SellerKycCard";
import { SellerValidationProgress } from "@/components/seller/SellerValidationProgress";
import { SellerValidationDuplicatasOverview } from "@/components/seller/SellerValidationDuplicatasOverview";
import { CardSkeleton, TableSkeleton } from "@/components/shared/PageSkeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { fetchCurrentSeller, updateSellerValidationStatus } from "@/services/seller.service";
import { fetchDuplicatasBySeller } from "@/services/duplicata.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";

const DUPLICATAS_COLUMNS = [
  "Número",
  "Sacado",
  { label: "Valor", align: "right" as const },
  "Vencimento",
  { label: "Análise", kind: "pill" as const },
];

export function SellerValidationPage() {
  const { data, loading, setData } = useAsyncData(async () => {
    const seller = await fetchCurrentSeller();
    const duplicatas = await fetchDuplicatasBySeller(seller.id);
    return { seller, duplicatas };
  }, []);
  const seller = data?.seller ?? null;
  const duplicatas = data?.duplicatas ?? [];

  async function handleKycApproved() {
    if (!seller) return;
    const updates = { validationStatus: "UNDER_REVIEW", kycStatus: "APPROVED" } as const;
    await updateSellerValidationStatus(seller.id, updates);
    setData((prev) => (prev ? { ...prev, seller: { ...prev.seller, ...updates } } : prev));
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
        <CardSkeleton progress lines={3} action />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CardSkeleton lines={2} action />
          </div>
          <TableSkeleton card columns={DUPLICATAS_COLUMNS} className="lg:col-span-2" />
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
