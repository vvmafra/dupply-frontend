import type { InvestmentStatus, OfferStatus, ReceivableStage, RiskLevel } from "./offer.types";

export const RECEIVABLE_STAGE_LABELS: Record<ReceivableStage, string> = {
  created: "Rascunho",
  under_review: "Em análise",
  reproved: "Reprovada",
  offer: "Proposta enviada",
  rejected: "Recusada pelo cedente",
  confirmed: "Aceita pelo cedente",
  funding: "Em captação",
  funded: "Captada",
  processing: "Em processamento",
  completed: "Concluída",
  payer_settled: "Liquidada pelo sacado",
  overdue: "Em atraso",
};

/** Next stage the admin can trigger with `advance-stage`; absent = not advanceable. */
export const NEXT_RECEIVABLE_STAGE: Partial<Record<ReceivableStage, ReceivableStage>> = {
  funded: "processing",
  processing: "completed",
  completed: "payer_settled",
  overdue: "payer_settled",
};

/** Stages that map to an investor-visible offer; earlier stages are not offers yet. */
export const OFFER_VISIBLE_STAGES: ReadonlySet<ReceivableStage> = new Set([
  "funding",
  "funded",
  "processing",
  "completed",
  "payer_settled",
  "overdue",
]);

/** Upper bound for the monthly rate accepted by the backend (fraction). */
export const MAX_YIELD_RATE_MONTHLY = 0.1;

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  fundraising: "Em captação",
  failed: "Não captada",
  disbursed: "Desembolsada",
};

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
  active: "Ativo",
  refunded: "Estornado",
  settled: "Liquidado",
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

/** Default platform spread (% of face) suggested on create form */
export const DEFAULT_PLATFORM_SPREAD_PERCENT = 1;
