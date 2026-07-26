import { calcEstimatedInvestorReturnPercent } from "@/domain/offer/offer-economics.helpers";
import { mapScoreToRiskLevel } from "@/domain/offer/offer-risk.helpers";
import type {
  Investment,
  InvestmentStatus,
  Offer,
  OfferStatus,
} from "@/domain/offer/offer.types";

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function buildOffer(input: {
  id: string;
  duplicataId: string;
  faceValue: number;
  analystDiscountPercent: number;
  platformSpreadPercent: number;
  scoreDuplicata: number;
  quotaPrice: number;
  quotaCount: number;
  quotasSold: number;
  minAmount: number;
  deadlineInDays: number;
  createdDaysAgo: number;
  status?: OfferStatus;
  fidcBackfillAmount?: number;
  closedDaysAgo?: number;
}): Offer {
  const targetAmount = input.quotaCount * input.quotaPrice;
  const raisedAmount = input.quotasSold * input.quotaPrice;
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - input.createdDaysAgo);
  const status = input.status ?? "fundraising";
  const closedAt =
    status !== "fundraising" && input.closedDaysAgo != null
      ? daysFromNow(-input.closedDaysAgo)
      : undefined;

  return {
    id: input.id,
    duplicataId: input.duplicataId,
    faceValue: input.faceValue,
    analystDiscountPercent: input.analystDiscountPercent,
    platformSpreadPercent: input.platformSpreadPercent,
    estimatedInvestorReturnPercent: calcEstimatedInvestorReturnPercent(
      input.analystDiscountPercent,
      input.platformSpreadPercent
    ),
    riskLevel: mapScoreToRiskLevel(input.scoreDuplicata),
    scoreDuplicataSnapshot: input.scoreDuplicata,
    targetAmount,
    minAmount: input.minAmount,
    quotaPrice: input.quotaPrice,
    quotaCount: input.quotaCount,
    quotasSold: input.quotasSold,
    raisedAmount,
    deadline: daysFromNow(input.deadlineInDays),
    status,
    backfillSource: "fidc",
    fidcBackfillAmount: input.fidcBackfillAmount ?? 0,
    createdAt: createdAt.toISOString(),
    closedAt,
  };
}

function inv(input: {
  id: string;
  offerId: string;
  investorUserId: string;
  quotaCount: number;
  quotaPrice: number;
  daysAgo: number;
  status?: InvestmentStatus;
}): Investment {
  return {
    id: input.id,
    offerId: input.offerId,
    investorUserId: input.investorUserId,
    quotaCount: input.quotaCount,
    amount: input.quotaCount * input.quotaPrice,
    status: input.status ?? "active",
    createdAt: daysFromNow(-input.daysAgo),
  };
}

/** Seed opportunities so investor cards are visible without admin setup */
export const INITIAL_OFFERS: Offer[] = [
  buildOffer({
    id: "offer-demo-001",
    duplicataId: "dup-seed-offer-001",
    faceValue: 120_000,
    analystDiscountPercent: 3,
    platformSpreadPercent: 1,
    scoreDuplicata: 82,
    quotaPrice: 1_000,
    quotaCount: 117,
    quotasSold: 48,
    minAmount: 70_000,
    deadlineInDays: 5,
    createdDaysAgo: 2,
  }),
  buildOffer({
    id: "offer-demo-002",
    duplicataId: "dup-seed-offer-002",
    faceValue: 45_000,
    analystDiscountPercent: 2.5,
    platformSpreadPercent: 0.8,
    scoreDuplicata: 68,
    quotaPrice: 500,
    quotaCount: 88,
    quotasSold: 12,
    minAmount: 22_000,
    deadlineInDays: 9,
    createdDaysAgo: 1,
  }),
  buildOffer({
    id: "offer-demo-003",
    duplicataId: "dup-seed-offer-003",
    faceValue: 78_500,
    analystDiscountPercent: 3.2,
    platformSpreadPercent: 1.2,
    scoreDuplicata: 44,
    quotaPrice: 1_000,
    quotaCount: 76,
    quotasSold: 61,
    minAmount: 45_000,
    deadlineInDays: 3,
    createdDaysAgo: 4,
  }),
  buildOffer({
    id: "offer-demo-004",
    duplicataId: "dup-seed-offer-004",
    faceValue: 200_000,
    analystDiscountPercent: 2.8,
    platformSpreadPercent: 1,
    scoreDuplicata: 91,
    quotaPrice: 2_000,
    quotaCount: 98,
    quotasSold: 90,
    minAmount: 120_000,
    deadlineInDays: 2,
    createdDaysAgo: 6,
  }),
  // Closed seeds — so status filters work without admin actions
  buildOffer({
    id: "offer-demo-005",
    duplicataId: "dup-seed-offer-005",
    faceValue: 60_000,
    analystDiscountPercent: 3.5,
    platformSpreadPercent: 1,
    scoreDuplicata: 55,
    quotaPrice: 1_000,
    quotaCount: 58,
    quotasSold: 8,
    minAmount: 35_000,
    deadlineInDays: -2,
    createdDaysAgo: 12,
    status: "failed",
    closedDaysAgo: 2,
  }),
  buildOffer({
    id: "offer-demo-006",
    duplicataId: "dup-seed-offer-006",
    faceValue: 95_000,
    analystDiscountPercent: 2.6,
    platformSpreadPercent: 0.9,
    scoreDuplicata: 78,
    quotaPrice: 1_000,
    quotaCount: 93,
    quotasSold: 60,
    minAmount: 50_000,
    deadlineInDays: -1,
    createdDaysAgo: 14,
    status: "disbursed",
    fidcBackfillAmount: 33_000,
    closedDaysAgo: 1,
  }),
];

/** Mock investments — offer-demo-004 has 12+ so detail page can preview max 10 */
export const INITIAL_INVESTMENTS: Investment[] = [
  // Portfolio of the demo investor (user-demo — default login + profile switch)
  inv({
    id: "inv-demo-001",
    offerId: "offer-demo-001",
    investorUserId: "user-demo",
    quotaCount: 5,
    quotaPrice: 1_000,
    daysAgo: 1,
  }),
  inv({
    id: "inv-demo-001b",
    offerId: "offer-demo-005",
    investorUserId: "user-demo",
    quotaCount: 3,
    quotaPrice: 1_000,
    daysAgo: 10,
    status: "refunded",
  }),
  inv({
    id: "inv-demo-001c",
    offerId: "offer-demo-006",
    investorUserId: "user-demo",
    quotaCount: 8,
    quotaPrice: 1_000,
    daysAgo: 8,
    status: "settled",
  }),
  inv({
    id: "inv-demo-001d",
    offerId: "offer-demo-002",
    investorUserId: "user-demo",
    quotaCount: 4,
    quotaPrice: 500,
    daysAgo: 0,
  }),
  inv({
    id: "inv-demo-001e",
    offerId: "offer-demo-003",
    investorUserId: "user-demo",
    quotaCount: 10,
    quotaPrice: 1_000,
    daysAgo: 3,
  }),
  inv({
    id: "inv-demo-001f",
    offerId: "offer-demo-004",
    investorUserId: "user-demo",
    quotaCount: 6,
    quotaPrice: 2_000,
    daysAgo: 2,
  }),
  inv({
    id: "inv-demo-002",
    offerId: "offer-demo-001",
    investorUserId: "investor-carla",
    quotaCount: 10,
    quotaPrice: 1_000,
    daysAgo: 1,
  }),
  inv({
    id: "inv-demo-003",
    offerId: "offer-demo-001",
    investorUserId: "investor-diego",
    quotaCount: 8,
    quotaPrice: 1_000,
    daysAgo: 2,
  }),
  inv({
    id: "inv-demo-004",
    offerId: "offer-demo-002",
    investorUserId: "investor-elena",
    quotaCount: 6,
    quotaPrice: 500,
    daysAgo: 1,
  }),
  inv({
    id: "inv-demo-005",
    offerId: "offer-demo-002",
    investorUserId: "investor-felipe",
    quotaCount: 6,
    quotaPrice: 500,
    daysAgo: 0,
  }),
  inv({
    id: "inv-demo-006",
    offerId: "offer-demo-003",
    investorUserId: "investor-gabi",
    quotaCount: 15,
    quotaPrice: 1_000,
    daysAgo: 3,
  }),
  inv({
    id: "inv-demo-007",
    offerId: "offer-demo-003",
    investorUserId: "investor-hugo",
    quotaCount: 20,
    quotaPrice: 1_000,
    daysAgo: 2,
  }),
  inv({
    id: "inv-demo-008",
    offerId: "offer-demo-003",
    investorUserId: "investor-iris",
    quotaCount: 12,
    quotaPrice: 1_000,
    daysAgo: 2,
  }),
  // offer-demo-004 — 12 rows (detail shows 10 + CTA)
  inv({
    id: "inv-demo-004-01",
    offerId: "offer-demo-004",
    investorUserId: "investor-ana",
    quotaCount: 10,
    quotaPrice: 2_000,
    daysAgo: 5,
  }),
  inv({
    id: "inv-demo-004-02",
    offerId: "offer-demo-004",
    investorUserId: "investor-bruno",
    quotaCount: 8,
    quotaPrice: 2_000,
    daysAgo: 5,
  }),
  inv({
    id: "inv-demo-004-03",
    offerId: "offer-demo-004",
    investorUserId: "investor-clara",
    quotaCount: 12,
    quotaPrice: 2_000,
    daysAgo: 4,
  }),
  inv({
    id: "inv-demo-004-04",
    offerId: "offer-demo-004",
    investorUserId: "investor-daniel",
    quotaCount: 5,
    quotaPrice: 2_000,
    daysAgo: 4,
  }),
  inv({
    id: "inv-demo-004-05",
    offerId: "offer-demo-004",
    investorUserId: "investor-edu",
    quotaCount: 7,
    quotaPrice: 2_000,
    daysAgo: 3,
  }),
  inv({
    id: "inv-demo-004-06",
    offerId: "offer-demo-004",
    investorUserId: "investor-fernanda",
    quotaCount: 6,
    quotaPrice: 2_000,
    daysAgo: 3,
  }),
  inv({
    id: "inv-demo-004-07",
    offerId: "offer-demo-004",
    investorUserId: "investor-gustavo",
    quotaCount: 9,
    quotaPrice: 2_000,
    daysAgo: 2,
  }),
  inv({
    id: "inv-demo-004-08",
    offerId: "offer-demo-004",
    investorUserId: "investor-helena",
    quotaCount: 4,
    quotaPrice: 2_000,
    daysAgo: 2,
  }),
  inv({
    id: "inv-demo-004-09",
    offerId: "offer-demo-004",
    investorUserId: "investor-igor",
    quotaCount: 8,
    quotaPrice: 2_000,
    daysAgo: 1,
  }),
  inv({
    id: "inv-demo-004-10",
    offerId: "offer-demo-004",
    investorUserId: "investor-julia",
    quotaCount: 6,
    quotaPrice: 2_000,
    daysAgo: 1,
  }),
  inv({
    id: "inv-demo-004-11",
    offerId: "offer-demo-004",
    investorUserId: "investor-kai",
    quotaCount: 10,
    quotaPrice: 2_000,
    daysAgo: 0,
  }),
  inv({
    id: "inv-demo-004-12",
    offerId: "offer-demo-004",
    investorUserId: "investor-lia",
    quotaCount: 5,
    quotaPrice: 2_000,
    daysAgo: 0,
  }),
  inv({
    id: "inv-demo-005-01",
    offerId: "offer-demo-005",
    investorUserId: "investor-marco",
    quotaCount: 5,
    quotaPrice: 1_000,
    daysAgo: 11,
    status: "refunded",
  }),
  inv({
    id: "inv-demo-006-01",
    offerId: "offer-demo-006",
    investorUserId: "investor-nina",
    quotaCount: 20,
    quotaPrice: 1_000,
    daysAgo: 9,
    status: "settled",
  }),
  inv({
    id: "inv-demo-006-02",
    offerId: "offer-demo-006",
    investorUserId: "investor-otto",
    quotaCount: 15,
    quotaPrice: 1_000,
    daysAgo: 7,
    status: "settled",
  }),
];
