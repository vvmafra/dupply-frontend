import type { AnalystDuplicatasAccessStatus, ValidationStatus } from "@/domain/seller/seller.types";

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
}
