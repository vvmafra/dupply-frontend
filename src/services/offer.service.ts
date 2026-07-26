import { sleep } from "@/lib/utils";
import { resolveOfferClose } from "@/domain/offer/offer-close.helpers";
import {
  calcEstimatedInvestorReturnPercent,
  calcRaisedAmount,
  snapTargetToQuotas,
  calcDefaultTargetAmount,
  calcRemainingQuotas,
} from "@/domain/offer/offer-economics.helpers";
import { mapScoreToRiskLevel } from "@/domain/offer/offer-risk.helpers";
import type {
  CreateOfferInput,
  InvestInOfferInput,
  Investment,
  InvestmentStatus,
  Offer,
  OfferStatus,
  RiskLevel,
} from "@/domain/offer/offer.types";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { INITIAL_INVESTMENTS, INITIAL_OFFERS } from "@/data/offers.mock";
import { fetchAllDuplicatas, fetchDuplicataById } from "@/services/duplicata.service";

let offers: Offer[] = INITIAL_OFFERS.map((o) => ({ ...o }));
let investments: Investment[] = INITIAL_INVESTMENTS.map((i) => ({ ...i }));

function cloneOffer(offer: Offer): Offer {
  return { ...offer };
}

function cloneInvestment(investment: Investment): Investment {
  return { ...investment };
}

function applyCloseToOffer(offer: Offer): Offer {
  const resolution = resolveOfferClose({
    raisedAmount: offer.raisedAmount,
    minAmount: offer.minAmount,
    targetAmount: offer.targetAmount,
  });

  const closedAt = new Date().toISOString();

  if (resolution.outcome === "failed") {
    investments = investments.map((inv) =>
      inv.offerId === offer.id && inv.status === "active"
        ? { ...inv, status: "refunded" }
        : inv
    );
    return {
      ...offer,
      status: "failed",
      fidcBackfillAmount: 0,
      closedAt,
    };
  }

  if (resolution.outcome === "partial_with_fidc") {
    investments = investments.map((inv) =>
      inv.offerId === offer.id && inv.status === "active"
        ? { ...inv, status: "settled" }
        : inv
    );
    return {
      ...offer,
      status: "disbursed",
      fidcBackfillAmount: resolution.fidcAmount,
      closedAt,
    };
  }

  investments = investments.map((inv) =>
    inv.offerId === offer.id && inv.status === "active"
      ? { ...inv, status: "settled" }
      : inv
  );

  return {
    ...offer,
    status: "disbursed",
    fidcBackfillAmount: 0,
    closedAt,
  };
}

export async function listOffers(filters?: {
  status?: OfferStatus | OfferStatus[];
  riskLevel?: RiskLevel;
}): Promise<Offer[]> {
  await sleep(250);
  let result = offers.map(cloneOffer);
  if (filters?.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    result = result.filter((o) => statuses.includes(o.status));
  }
  if (filters?.riskLevel) {
    result = result.filter((o) => o.riskLevel === filters.riskLevel);
  }
  return result;
}

export async function listFundraisingOffers(filters?: {
  riskLevel?: RiskLevel;
}): Promise<Offer[]> {
  await closeExpiredOffers();
  return listOffers({ status: "fundraising", riskLevel: filters?.riskLevel });
}

export async function getOfferById(id: string): Promise<Offer | null> {
  await sleep(180);
  const offer = offers.find((o) => o.id === id);
  return offer ? cloneOffer(offer) : null;
}

export async function getOfferByDuplicataId(duplicataId: string): Promise<Offer | null> {
  await sleep(150);
  const offer = offers.find((o) => o.duplicataId === duplicataId);
  return offer ? cloneOffer(offer) : null;
}

export async function listDuplicatasReadyForOffer(filters?: {
  sellerId?: string;
}): Promise<DuplicataTitulo[]> {
  await sleep(280);
  const all = await fetchAllDuplicatas();
  const offeredIds = new Set(offers.map((o) => o.duplicataId));
  return all.filter(
    (d) =>
      d.analiseAnalista === "aprovado" &&
      !offeredIds.has(d.id) &&
      d.descontoAntecipacaoPercent != null &&
      (filters?.sellerId == null || d.sellerId === filters.sellerId)
  );
}

export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  await sleep(400);

  if (offers.some((o) => o.duplicataId === input.duplicataId)) {
    throw new Error("Já existe uma oferta para esta duplicata.");
  }

  const duplicata = await fetchDuplicataById(input.duplicataId);
  if (!duplicata) {
    throw new Error("Duplicata não encontrada.");
  }
  if (duplicata.analiseAnalista !== "aprovado") {
    throw new Error("A duplicata precisa estar aprovada pelo cedente.");
  }

  const analystDiscountPercent = duplicata.descontoAntecipacaoPercent;
  if (analystDiscountPercent == null) {
    throw new Error("Deságio do analista não encontrado na duplicata.");
  }

  if (input.platformSpreadPercent > analystDiscountPercent) {
    throw new Error("Spread da plataforma não pode exceder o deságio do analista.");
  }

  const rawTarget =
    input.targetAmount ?? calcDefaultTargetAmount(duplicata.valor, analystDiscountPercent);
  const { quotaCount, targetAmount } = snapTargetToQuotas(rawTarget, input.quotaPrice);

  if (input.minAmount > targetAmount) {
    throw new Error("Mínimo de captação não pode ser maior que o valor alvo.");
  }

  const offer: Offer = {
    id: `offer-${Date.now()}`,
    duplicataId: duplicata.id,
    faceValue: duplicata.valor,
    analystDiscountPercent,
    platformSpreadPercent: input.platformSpreadPercent,
    estimatedInvestorReturnPercent: calcEstimatedInvestorReturnPercent(
      analystDiscountPercent,
      input.platformSpreadPercent
    ),
    riskLevel: mapScoreToRiskLevel(duplicata.scoreDuplicata),
    scoreDuplicataSnapshot: duplicata.scoreDuplicata,
    targetAmount,
    minAmount: input.minAmount,
    quotaPrice: input.quotaPrice,
    quotaCount,
    quotasSold: 0,
    raisedAmount: 0,
    deadline: new Date(input.deadline).toISOString(),
    status: "fundraising",
    backfillSource: "fidc",
    fidcBackfillAmount: 0,
    createdAt: new Date().toISOString(),
  };

  offers = [offer, ...offers];
  return cloneOffer(offer);
}

export async function investInOffer(input: InvestInOfferInput): Promise<Investment> {
  await sleep(350);

  const index = offers.findIndex((o) => o.id === input.offerId);
  if (index < 0) {
    throw new Error("Oferta não encontrada.");
  }

  let offer = offers[index]!;
  if (offer.status !== "fundraising") {
    throw new Error("Esta oferta não está aberta para investimentos.");
  }

  if (new Date(offer.deadline).getTime() <= Date.now()) {
    offer = applyCloseToOffer(offer);
    offers = offers.map((o) => (o.id === offer.id ? offer : o));
    throw new Error("O prazo desta oferta encerrou.");
  }

  const remaining = calcRemainingQuotas(offer.quotaCount, offer.quotasSold);
  if (input.quotaCount <= 0) {
    throw new Error("Invista ao menos 1 cota.");
  }
  if (input.quotaCount > remaining) {
    throw new Error(`Restam apenas ${remaining} cotas nesta oferta.`);
  }

  const investment: Investment = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    offerId: offer.id,
    investorUserId: input.investorUserId,
    quotaCount: input.quotaCount,
    amount: input.quotaCount * offer.quotaPrice,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  // Persist investment before close so applyCloseToOffer can settle it.
  investments = [investment, ...investments];

  const quotasSold = offer.quotasSold + input.quotaCount;
  const raisedAmount = calcRaisedAmount(offer.quotaPrice, quotasSold);
  let nextOffer: Offer = {
    ...offer,
    quotasSold,
    raisedAmount,
  };

  if (raisedAmount >= nextOffer.targetAmount) {
    nextOffer = applyCloseToOffer(nextOffer);
  }

  offers = offers.map((o) => (o.id === nextOffer.id ? nextOffer : o));

  const stored = investments.find((i) => i.id === investment.id);
  return cloneInvestment(stored ?? investment);
}

/** Demo login may restore either id depending on session age */
const DEMO_INVESTOR_IDS = new Set(["user-demo", "user-investor-demo"]);

function matchesInvestor(investmentUserId: string, queryUserId: string): boolean {
  if (investmentUserId === queryUserId) return true;
  return DEMO_INVESTOR_IDS.has(investmentUserId) && DEMO_INVESTOR_IDS.has(queryUserId);
}

export async function listInvestmentsByInvestor(
  investorUserId: string,
  filters?: { status?: InvestmentStatus }
): Promise<Investment[]> {
  await sleep(220);
  let result = investments
    .filter((i) => matchesInvestor(i.investorUserId, investorUserId))
    .map(cloneInvestment);
  if (filters?.status) {
    result = result.filter((i) => i.status === filters.status);
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listInvestmentsByOffer(offerId: string): Promise<Investment[]> {
  await sleep(200);
  return investments
    .filter((i) => i.offerId === offerId)
    .map(cloneInvestment)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllInvestments(filters?: {
  offerId?: string;
  status?: InvestmentStatus;
}): Promise<Investment[]> {
  await sleep(220);
  let result = investments.map(cloneInvestment);
  if (filters?.offerId) {
    result = result.filter((i) => i.offerId === filters.offerId);
  }
  if (filters?.status) {
    result = result.filter((i) => i.status === filters.status);
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function closeOffer(offerId: string): Promise<Offer> {
  await sleep(350);
  const index = offers.findIndex((o) => o.id === offerId);
  if (index < 0) {
    throw new Error("Oferta não encontrada.");
  }

  const current = offers[index]!;
  if (current.status !== "fundraising") {
    throw new Error("Oferta já encerrada.");
  }

  const closed = applyCloseToOffer(current);
  offers = offers.map((o) => (o.id === closed.id ? closed : o));
  return cloneOffer(closed);
}

export async function closeExpiredOffers(now: Date = new Date()): Promise<Offer[]> {
  await sleep(120);
  const closed: Offer[] = [];
  const nowMs = now.getTime();

  offers = offers.map((offer) => {
    if (offer.status !== "fundraising") return offer;
    if (new Date(offer.deadline).getTime() > nowMs) return offer;
    const next = applyCloseToOffer(offer);
    closed.push(cloneOffer(next));
    return next;
  });

  return closed;
}

/** Demo helper: move deadline to the past then close */
export async function simulateOfferDeadline(offerId: string): Promise<Offer> {
  await sleep(200);
  const index = offers.findIndex((o) => o.id === offerId);
  if (index < 0) {
    throw new Error("Oferta não encontrada.");
  }
  const current = offers[index]!;
  if (current.status !== "fundraising") {
    throw new Error("Oferta já encerrada.");
  }

  const withPastDeadline: Offer = {
    ...current,
    deadline: new Date(Date.now() - 60_000).toISOString(),
  };
  offers = offers.map((o) => (o.id === withPastDeadline.id ? withPastDeadline : o));
  return closeOffer(offerId);
}
