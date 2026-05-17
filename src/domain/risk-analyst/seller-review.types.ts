import type { AnalystDuplicatasAccessStatus, ValidationStatus } from "@/domain/seller/seller.types";

/** Arquivo enviado no cadastro do cedente (mesmos IDs do checklist de registro). */
export interface SellerRegistrationDocumentFile {
  documentId: string;
  fileName: string;
  uploadedAt: string;
}

/** Resultado da revisão cadastral feita pelo analista. */
export type AnalystCadastralReviewDecision = "APPROVED" | "REJECTED";

export interface SellerReviewSummary {
  sellerId: string;
  legalName: string;
  taxId: string;
  email: string;
  representativeName: string;
  validationStatus: ValidationStatus;
  analystDuplicatasAccess: AnalystDuplicatasAccessStatus;
  /** Score simulado gerado por IA (0–100). */
  riskScore: number;
  /** Pontos de atenção simulados gerados por IA. */
  attentionPoints: string[];
  reviewedByAnalystId: string | null;
  reviewedByAnalystName: string | null;
  reviewedAt: string | null;
  /** Decisão da última revisão cadastral do analista. */
  analystCadastralDecision: AnalystCadastralReviewDecision | null;
  /** Justificativa informada pelo analista na revisão cadastral. */
  analystReviewJustification: string | null;
  /** Preenchido no detalhe do cedente — anexos do formulário de cadastro. */
  registrationDocumentFiles?: SellerRegistrationDocumentFile[];
}
