import type { SellerReviewSummary } from "./seller-review.types";

export type CadastralReviewDisplayStatus = "pendente" | "aprovado" | "reprovado";

export const CADASTRAL_REVIEW_LABELS: Record<CadastralReviewDisplayStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export const CADASTRAL_REVIEW_COLORS: Record<CadastralReviewDisplayStatus, string> = {
  pendente: "text-warning bg-warning/20 border-warning/40",
  aprovado: "text-success bg-success/20 border-success/40",
  reprovado: "text-destructive bg-destructive/20 border-destructive/40",
};

/** Status de exibição da revisão cadastral. */
export function getSellerCadastralReviewDisplayStatus(
  row: Pick<SellerReviewSummary, "analystCadastralDecision">,
): CadastralReviewDisplayStatus {
  if (row.analystCadastralDecision === "APPROVED") return "aprovado";
  if (row.analystCadastralDecision === "REJECTED") return "reprovado";
  return "pendente";
}
