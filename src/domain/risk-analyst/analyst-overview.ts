import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import type { SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";

/**
 * Cedentes na fila de revisão cadastral pelo analista (estado «criado» / aguardando decisão).
 * No mock: ainda sem `reviewedByAnalystId` — quando existir um campo explícito created | approved | rejected,
 * este contador deve passar a usar esse status.
 */
export function countCedentesEmRevisaoCadastral(rows: readonly SellerReviewSummary[]): number {
  return rows.filter((r) => r.reviewedByAnalystId == null).length;
}

/** Duplicatas com análise do analista ainda pendente. */
export function countDuplicatasAnalisePendente(items: readonly DuplicataTitulo[]): number {
  return items.filter((d) => d.analiseAnalista === "pendente").length;
}
