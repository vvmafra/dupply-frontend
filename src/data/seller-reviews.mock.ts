import { MOCK_SELLERS } from "@/data/users.mock";
import type { SellerReviewSummary } from "@/domain/risk-analyst/seller-review.types";

const attentionTemplates: string[][] = [
  ["Concentração em poucos sacados institucionais", "Histórico de inadimplência baixo no segmento"],
  ["Liquidez corrente pressionada", "Dependência de capital de terceiros"],
  ["Documentação societária em regularização", "Prazo médio de recebíveis alinhado ao setor"],
  ["Endividamento bancário moderado", "Receita recorrente com clientes recorrentes"],
  ["Operação recente em expansão", "Monitorar margem e fluxo de caixa"],
];

export function buildInitialSellerReviews(): SellerReviewSummary[] {
  return MOCK_SELLERS.map((seller, index) => ({
    sellerId: seller.id,
    legalName: seller.legalName,
    taxId: seller.taxId,
    email: seller.email,
    representativeName: seller.representativeName,
    validationStatus: seller.validationStatus,
    analystDuplicatasAccess: seller.analystDuplicatasAccess,
    riskScore: [68, 74, 52, 81, 59][index] ?? 60,
    attentionPoints: attentionTemplates[index] ?? ["Sem apontamentos adicionais no mock"],
    reviewedByAnalystId: index < 2 ? "analyst-ana" : null,
    reviewedByAnalystName: index < 2 ? "Ana Risco" : null,
    reviewedAt: index < 2 ? "2025-05-10T14:30:00Z" : null,
  }));
}
