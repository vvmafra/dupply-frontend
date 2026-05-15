import type { AnalystDuplicatasAccessStatus, SellerCompany } from "@/domain/seller/seller.types";

export const ANALYST_DUPLICATAS_ACCESS_LABELS: Record<AnalystDuplicatasAccessStatus, string> = {
  PENDING: "Aguardando analista",
  UNDER_REVIEW: "Em análise pelo analista",
  APPROVED: "Liberado para duplicatas",
  REJECTED: "Envio de duplicatas não liberado",
};

export function getAnalystDuplicatasAccessLabel(status: AnalystDuplicatasAccessStatus): string {
  return ANALYST_DUPLICATAS_ACCESS_LABELS[status];
}

/** Cedente pode cadastrar e enviar duplicatas (mock / hackathon). */
export function canSellerRegisterDuplicatas(seller: SellerCompany): boolean {
  if (seller.validationStatus !== "APPROVED") return false;
  if (seller.kycStatus !== "APPROVED") return false;
  return seller.analystDuplicatasAccess === "APPROVED";
}
