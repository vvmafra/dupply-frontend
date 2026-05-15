import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import { buildInitialSellerReviews } from "@/data/seller-reviews.mock";
import type { SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";

let sellerReviews: SellerReviewSummary[] = buildInitialSellerReviews();

export async function fetchSellerReviews(): Promise<SellerReviewSummary[]> {
  await sleep(350);
  return sellerReviews.map((row) => ({ ...row }));
}

export async function fetchSellerReviewById(sellerId: string): Promise<SellerReviewSummary | null> {
  await sleep(250);
  const row = sellerReviews.find((r) => r.sellerId === sellerId);
  if (!row) return null;
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  return {
    ...row,
    analystDuplicatasAccess: seller?.analystDuplicatasAccess ?? row.analystDuplicatasAccess,
  };
}

export async function markSellerReviewedByAnalyst(
  sellerId: string,
  analystId: string,
  analystName: string
): Promise<void> {
  await sleep(400);
  sellerReviews = sellerReviews.map((row) =>
    row.sellerId === sellerId
      ? {
          ...row,
          reviewedByAnalystId: analystId,
          reviewedByAnalystName: analystName,
          reviewedAt: new Date().toISOString(),
        }
      : row
  );
}

export function getSellerDisplayName(sellerId: string): string {
  return MOCK_SELLERS.find((s) => s.id === sellerId)?.legalName ?? sellerId;
}
