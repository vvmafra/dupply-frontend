export type OfferStatus = "fundraising" | "failed" | "disbursed";

export type InvestmentStatus = "active" | "refunded" | "settled";

export type RiskLevel = "low" | "medium" | "high";

export type OfferCloseOutcome = "failed" | "full" | "partial_with_fidc";

export interface Offer {
  id: string;
  duplicataId: string;
  /** Snapshot for investor UI — no counterparty names */
  faceValue: number;
  analystDiscountPercent: number;
  platformSpreadPercent: number;
  estimatedInvestorReturnPercent: number;
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
    yieldRateAnnual: number;
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
}

export interface InvestInOfferInput {
  offerId: string;
  investorUserId: string;
  quotaCount: number;
}

export interface OfferCloseResolution {
  outcome: OfferCloseOutcome;
  fidcAmount: number;
}
