import type { DuplicataAnaliseAnalista } from "@/domain/duplicata/duplicata.types";
import type { SellerReviewSummary } from "./seller-review.types";

/** Status de exibição da revisão cadastral (mesmas cores das tags de análise de duplicata). */
export function getSellerCadastralReviewDisplayStatus(
  row: Pick<SellerReviewSummary, "analystCadastralDecision">,
): DuplicataAnaliseAnalista {
  if (row.analystCadastralDecision === "APPROVED") return "aprovado";
  if (row.analystCadastralDecision === "REJECTED") return "reprovado";
  return "pendente";
}
