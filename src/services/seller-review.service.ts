import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import { buildInitialSellerReviews } from "@/data/seller-reviews.mock";
import { getRegistrationDocumentFilesForSeller } from "@/data/seller-registration-documents.mock";
import type { AnalystCadastralReviewDecision, SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";
import { apiRequest } from "@/lib/api-client";
import { resolveApiMode } from "@/lib/env";

let sellerReviews: SellerReviewSummary[] = buildInitialSellerReviews();

function mapBackendSellerToReviewSummary(s: any): SellerReviewSummary {
  const comp = s.companyMetaData || {};
  const legal = s.legalRepresentativeMetaData || {};
  
  let valStatus: any = "PENDING";
  let dupAccess: any = "PENDING";
  
  if (s.status === "active") {
    valStatus = "APPROVED";
    dupAccess = "GRANTED";
  } else if (s.status === "inactive") {
    valStatus = "REJECTED";
    dupAccess = "REVOKED";
  }
  
  return {
    sellerId: s.id,
    legalName: comp.legalName || s.name || "Sem Nome",
    taxId: comp.cnpj || "00.000.000/0001-00",
    email: comp.corporateEmail || "contato@empresa.com",
    representativeName: legal.fullName || "Representante Legal",
    validationStatus: valStatus,
    analystDuplicatasAccess: dupAccess,
    riskScore: 78,
    attentionPoints: [],
    reviewedByAnalystId: null,
    reviewedByAnalystName: null,
    reviewedAt: null,
    analystCadastralDecision: s.status === "active" ? "APPROVED" : s.status === "inactive" ? "REJECTED" : null,
    analystReviewJustification: null,
    registrationDocumentFiles: [
      { documentId: "doc-cnpj", fileName: "cnpj.pdf", uploadedAt: s.createdAt || new Date().toISOString() },
      { documentId: "doc-estatuto", fileName: "estatuto_social.pdf", uploadedAt: s.createdAt || new Date().toISOString() },
      { documentId: "doc-faturamento", fileName: "declaracao_faturamento.pdf", uploadedAt: s.createdAt || new Date().toISOString() }
    ],
  };
}

export async function fetchSellerReviews(): Promise<SellerReviewSummary[]> {
  if (resolveApiMode() === "http") {
    const sellersList = await apiRequest<any[]>("/v1/sellers");
    return sellersList.map(mapBackendSellerToReviewSummary);
  }

  await sleep(350);
  return sellerReviews.map((row) => {
    const seller = MOCK_SELLERS.find((s) => s.id === row.sellerId);
    return {
      ...row,
      validationStatus: seller?.validationStatus ?? row.validationStatus,
      analystDuplicatasAccess: seller?.analystDuplicatasAccess ?? row.analystDuplicatasAccess,
    };
  });
}

export async function fetchSellerReviewById(sellerId: string): Promise<SellerReviewSummary | null> {
  if (resolveApiMode() === "http") {
    try {
      const seller = await apiRequest<any>(`/v1/sellers/${sellerId}`);
      return mapBackendSellerToReviewSummary(seller);
    } catch {
      return null;
    }
  }

  await sleep(250);
  const row = sellerReviews.find((r) => r.sellerId === sellerId);
  if (!row) return null;
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  return {
    ...row,
    analystDuplicatasAccess: seller?.analystDuplicatasAccess ?? row.analystDuplicatasAccess,
    validationStatus: seller?.validationStatus ?? row.validationStatus,
    registrationDocumentFiles: getRegistrationDocumentFilesForSeller(sellerId),
  };
}

export async function submitAnalystCadastralReview(
  sellerId: string,
  payload: Readonly<{
    analystId: string;
    analystName: string;
    decision: AnalystCadastralReviewDecision;
    justification: string;
  }>
): Promise<void> {
  if (resolveApiMode() === "http") {
    const status = payload.decision === "APPROVED" ? "active" : "inactive";
    await apiRequest<any>(`/v1/sellers/${sellerId}/status`, {
      method: "PATCH",
      body: { status },
    });
    return;
  }

  await sleep(450);
  sellerReviews = sellerReviews.map((row) =>
    row.sellerId === sellerId
      ? {
          ...row,
          reviewedByAnalystId: payload.analystId,
          reviewedByAnalystName: payload.analystName,
          reviewedAt: new Date().toISOString(),
          analystCadastralDecision: payload.decision,
          analystReviewJustification: payload.justification,
        }
      : row
  );
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.validationStatus = payload.decision === "APPROVED" ? "APPROVED" : "REJECTED";
  }
}

export function getSellerDisplayName(sellerId: string): string {
  if (resolveApiMode() === "http") {
    // In HTTP mode, we might not have the display name pre-cached, but we can return the ID
    // or keep a fallback lookup.
    return sellerId;
  }
  return MOCK_SELLERS.find((s) => s.id === sellerId)?.legalName ?? sellerId;
}
