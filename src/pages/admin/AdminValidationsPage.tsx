import { useEffect, useState } from "react";
import { AdminValidationTable } from "@/components/admin/AdminValidationTable";
import { fetchAllSellers, adminApproveValidation, adminRejectValidation } from "@/services/admin.service";
import type { AdminValidationRow } from "@/domain/admin/admin.types";
import type { SellerCompany } from "@/domain/seller/seller.types";

function toRow(s: SellerCompany): AdminValidationRow {
  return {
    id: s.id,
    sellerId: s.id,
    sellerName: s.legalName,
    companyName: s.legalName,
    contactEmail: s.email,
    taxId: s.taxId,
    validationStatus: s.validationStatus,
    documentsProgress: s.documentsProgress,
    kycStatus: s.kycStatus,
    createdAt: s.createdAt,
  };
}

export function AdminValidationsPage() {
  const [rows, setRows] = useState<AdminValidationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSellers().then((data) => {
      setRows(data.map(toRow));
      setLoading(false);
    });
  }, []);

  async function handleApprove(sellerId: string) {
    await adminApproveValidation(sellerId);
    setRows((prev) =>
      prev.map((r) => (r.id === sellerId ? { ...r, validationStatus: "APPROVED" as const } : r))
    );
  }

  async function handleReject(sellerId: string) {
    await adminRejectValidation(sellerId);
    setRows((prev) =>
      prev.map((r) => (r.id === sellerId ? { ...r, validationStatus: "REJECTED" as const } : r))
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Validações</h1>
        <p className="text-sm text-muted-foreground">Gerencie o cadastro e validação de cedentes</p>
      </div>
      <AdminValidationTable rows={rows} onApprove={handleApprove} onReject={handleReject} />
    </div>
  );
}
