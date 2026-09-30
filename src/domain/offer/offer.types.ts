export type OfferStatus = "fundraising" | "failed" | "disbursed";

export type InvestmentStatus = "active" | "refunded" | "settled";

export type RiskLevel = "low" | "medium" | "high";

export type OfferCloseOutcome = "failed" | "full" | "partial_with_fidc";

/**
 * Backend receivable lifecycle stage. Present only in HTTP mode, where an
 * offer is the receivable itself (`offer.id === receivable.id`).
 */
export type ReceivableStage =
  | "created"
  | "under_review"
  | "reproved"
  | "offer"
  | "rejected"
  | "confirmed"
  | "funding"
  | "funded"
  | "processing"
  | "completed"
  | "payer_settled"
  | "overdue";

export interface Offer {
  id: string;
  duplicataId: string;
  /** Snapshot for investor UI — no counterparty names */
  faceValue: number;
  analystDiscountPercent: number;
  platformSpreadPercent: number;
  estimatedInvestorReturnPercent: number;
  /** Taxa mensal ao investidor, fração (0.018 = 1,8% a.m.), juros simples base 30 dias. */
  yieldRateMonthly: number;
  /** Ticket mínimo por aporte em reais; 0 = sem mínimo. */
  minInvestment: number;
  /** Raw backend stage (HTTP mode only). */
  receivableStage?: ReceivableStage;
  riskLevel: RiskLevel;
  scoreDuplicataSnapshot: number;
  targetAmount: number;
  minAmount: number;
  quotaPrice: number;
  quotaCount: number;
  quotasSold: number;
  raisedAmount: number;
  deadline: string;
  status: OfferStatus;
  backfillSource: "fidc";
  fidcBackfillAmount: number;
  createdAt: string;
  closedAt?: string;
}

export interface Investment {
  id: string;
  offerId: string;
  investorUserId: string;
  quotaCount: number;
  amount: number;
  status: InvestmentStatus;
  createdAt: string;
  receivable?: {
    status: string;
    targetFunding: number;
    funded: number;
    /** Fração (0.018 = 1,8% a.m.). */
    yieldRateMonthly: number;
  };
}

export interface CreateOfferInput {
  duplicataId: string;
  quotaPrice: number;
  minAmount: number;
  deadline: string;
  platformSpreadPercent: number;
  /** Optional override; default from face + analyst discount */
  targetAmount?: number;
  /** Override the analyst's monthly rate (fraction). */
  yieldRateMonthly?: number;
  /** Override the analyst's minimum ticket (reais). */
  minInvestment?: number;
}

/** `POST /v1/admin/receivables/:id/open-funding` — optional overrides of the analyst's terms. */
export interface OpenFundingInput {
  duplicataId: string;
  yieldRateMonthly?: number;
  minInvestment?: number;
}

export interface StageAdvanceResult {
  from: ReceivableStage;
  to: ReceivableStage;
}

export interface InvestInOfferInput {
  offerId: string;
  investorUserId: string;
  /** Mock: whole quotas of `offer.quotaPrice`. */
  quotaCount: number;
  /** HTTP: exact amount in reais (the backend closes a funding only on the exact target). */
  amount?: number;
}

export interface OfferCloseResolution {
  outcome: OfferCloseOutcome;
  fidcAmount: number;
}
