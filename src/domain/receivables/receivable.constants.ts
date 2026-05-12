import type { ReceivableStatus, RiskLevel } from "./receivable.types";

export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
  DRAFT: "Rascunho",
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovado",
  LISTED: "Listado",
  FUNDED: "Financiado",
  SETTLED: "Liquidado",
  DEFAULTED: "Inadimplente",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
};

export const DOCUMENT_STATUS_LABELS = {
  PENDING: "Pendente",
  UPLOADED: "Enviado",
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
} as const;
