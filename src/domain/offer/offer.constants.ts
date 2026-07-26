import type { InvestmentStatus, OfferStatus, RiskLevel } from "./offer.types";

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
