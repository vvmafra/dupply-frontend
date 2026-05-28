import type { SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";

/**
 * Cedentes na fila de revisão cadastral pelo analista (estado «criado» / aguardando decisão).
 * No mock: ainda sem `reviewedByAnalystId` — quando existir um campo explícito created | approved | rejected,
 * este contador deve passar a usar esse status.
 */
export function countCedentesEmRevisaoCadastral(rows: readonly SellerReviewSummary[]): number {
  return rows.filter((row) => row.reviewedByAnalystId == null).length;
}
