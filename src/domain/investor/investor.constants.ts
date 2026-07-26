import type {
  InvestorKycStatus,
  InvestorPersonType,
  InvestorSuitability,
} from "./investor.types";

export const INVESTOR_KYC_STATUS_LABELS: Record<InvestorKycStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export const INVESTOR_PERSON_TYPE_LABELS: Record<InvestorPersonType, string> = {
  PF: "Pessoa física",
  PJ: "Pessoa jurídica",
};

export const INVESTOR_SUITABILITY_LABELS: Record<InvestorSuitability, string> = {
  conservative: "Conservador",
  moderate: "Moderado",
  aggressive: "Arrojado",
};
