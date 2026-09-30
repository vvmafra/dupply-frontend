import { AdminValidationTable } from "@/components/admin/AdminValidationTable";
import { TableSkeleton } from "@/components/shared/PageSkeleton";
import { useAsyncData } from "@/hooks/use-async-data";
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

const TABLE_COLUMNS = [
  "Empresa",
  { label: "CNPJ", className: "hidden sm:table-cell" },
  { label: "Cadastro", className: "hidden md:table-cell" },
  { label: "Status", kind: "pill" as const },
  { label: "Ações", align: "right" as const, kind: "action" as const },
];

export function AdminValidationsPage() {
  const { data, loading, setData } = useAsyncData(
    async () => (await fetchAllSellers()).map(toRow),
    [],
  );
  const rows = data ?? [];

  function patchRow(sellerId: string, validationStatus: AdminValidationRow["validationStatus"]) {
    setData((prev) => prev?.map((r) => (r.id === sellerId ? { ...r, validationStatus } : r)) ?? prev);
  }

  async function handleApprove(sellerId: string) {
    await adminApproveValidation(sellerId);
    patchRow(sellerId, "APPROVED");
  }

  async function handleReject(sellerId: string) {
    await adminRejectValidation(sellerId);
    patchRow(sellerId, "REJECTED");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Validações</h1>
        <p className="text-sm text-muted-foreground">Gerencie o cadastro e validação de cedentes</p>
      </div>
      {loading ? (
        <TableSkeleton card columns={TABLE_COLUMNS} />
      ) : (
        <AdminValidationTable rows={rows} onApprove={handleApprove} onReject={handleReject} />
      )}
    </div>
  );
}
