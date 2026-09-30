import type { SellerCompany } from "@/domain/seller/seller.types";

/** `GET /v1/sellers` / `GET /v1/sellers/:id` payload (fields the frontend reads). */
export interface BackendSeller {
  id: string;
  status: "created" | "in_review" | "active" | "inactive" | string;
  name: string;
  companyMetaData?: {
    legalName?: string;
    cnpj?: string;
    corporateEmail?: string;
    phone?: string;
  } | null;
  legalRepresentativeMetaData?: {
    fullName?: string;
    cpf?: string;
  } | null;
  createdAt?: string;
}

/**
 * Backend seller status → the frontend's validation/KYC/analyst-access trio.
 * The backend has a single status, so KYC and analyst access mirror it.
 */
export function mapBackendSellerToCompany(s: BackendSeller): SellerCompany {
  const company = s.companyMetaData ?? {};
  const legal = s.legalRepresentativeMetaData ?? {};
  const active = s.status === "active";
  const inReview = s.status === "in_review";
  const inactive = s.status === "inactive";

  return {
    id: s.id,
    legalName: company.legalName || s.name || "Sem nome",
    taxId: company.cnpj ?? "",
    email: company.corporateEmail ?? "",
    phone: company.phone ?? "",
    representativeName: legal.fullName ?? "",
    representativeCpf: legal.cpf ?? "",
    validationStatus: active ? "APPROVED" : inactive ? "REJECTED" : inReview ? "UNDER_REVIEW" : "DOCUMENTS_PENDING",
    documentsProgress: active || inReview ? 100 : 60,
    kycStatus: active ? "APPROVED" : inactive ? "REJECTED" : "PENDING",
    onboardingStep: active ? 4 : inReview ? 3 : 2,
    analystDuplicatasAccess: active ? "APPROVED" : inactive ? "REJECTED" : inReview ? "UNDER_REVIEW" : "PENDING",
    createdAt: s.createdAt ?? new Date().toISOString(),
  };
}
