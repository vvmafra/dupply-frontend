import { useEffect, useState } from "react";
import { SellerKycCard } from "@/components/seller/SellerKycCard";
import { SellerDocumentChecklist } from "@/components/seller/SellerDocumentChecklist";
import { SellerValidationProgress } from "@/components/seller/SellerValidationProgress";
import { fetchCurrentSeller, updateSellerValidationStatus } from "@/services/seller.service";
import { createInitialDocumentList } from "@/data/documents.mock";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type { DocumentItem } from "@/domain/documents/document.types";

export function SellerValidationPage() {
  const [seller, setSeller] = useState<SellerCompany | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await fetchCurrentSeller();
      setSeller(s);
      setDocuments(createInitialDocumentList());
      setLoading(false);
    }
    load();
  }, []);

  async function handleKycApproved() {
    if (!seller) return;
    await updateSellerValidationStatus(seller.id, { validationStatus: "UNDER_REVIEW", kycStatus: "APPROVED" });
    setSeller((prev) => prev ? { ...prev, validationStatus: "UNDER_REVIEW", kycStatus: "APPROVED" } : prev);
  }

  if (loading || !seller) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Validação cadastral</h1>
        <p className="text-sm text-muted-foreground">Complete as etapas para habilitar sua empresa na plataforma</p>
      </div>

      <SellerValidationProgress seller={seller} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SellerKycCard
            kycStatus={seller.validationStatus === "KYC_PENDING" ? "PENDING" : "APPROVED"}
            onApproved={handleKycApproved}
          />
        </div>
        <div className="lg:col-span-2">
          <SellerDocumentChecklist
            documents={documents}
            onDocumentsChange={setDocuments}
          />
        </div>
      </div>
    </div>
  );
}
