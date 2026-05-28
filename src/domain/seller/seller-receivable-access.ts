import type { AnalystDuplicatasAccessStatus, SellerCompany } from "@/domain/seller/seller.types";

export const ANALYST_RECEIVABLES_ACCESS_LABELS: Record<AnalystDuplicatasAccessStatus, string> = {
  PENDING: "Aguardando analista",
  UNDER_REVIEW: "Em análise pelo analista",
  APPROVED: "Liberado para recebíveis",
  REJECTED: "Envio de recebíveis não liberado",
};

export function getAnalystReceivablesAccessLabel(status: AnalystDuplicatasAccessStatus): string {
  return ANALYST_RECEIVABLES_ACCESS_LABELS[status];
}

/** Seller may register receivables when profile status is active (backend enforces on create). */
export function canSellerRegisterReceivables(seller: SellerCompany): boolean {
  return seller.validationStatus === "APPROVED" && seller.kycStatus === "APPROVED";
}
