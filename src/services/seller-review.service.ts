import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import { buildInitialSellerReviews } from "@/data/seller-reviews.mock";
import { getRegistrationDocumentFilesForSeller } from "@/data/seller-registration-documents.mock";
import type { AnalystCadastralReviewDecision, SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";

let sellerReviews: SellerReviewSummary[] = buildInitialSellerReviews();

export async function fetchSellerReviews(): Promise<SellerReviewSummary[]> {
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
  return MOCK_SELLERS.find((s) => s.id === sellerId)?.legalName ?? sellerId;
}
