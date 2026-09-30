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
import { DEFAULT_PLATFORM_SPREAD_PERCENT } from "@/domain/offer/offer.constants";
import type {
  CreateOfferInput,
  InvestInOfferInput,
  Investment,
  InvestmentStatus,
  Offer,
  OfferStatus,
  OpenFundingInput,
  RiskLevel,
  StageAdvanceResult,
} from "@/domain/offer/offer.types";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { INITIAL_INVESTMENTS, INITIAL_OFFERS } from "@/data/offers.mock";
import { fetchAllDuplicatas, fetchDuplicataById } from "@/services/duplicata.service";
import {
  HTTP_QUOTA_PRICE,
  isOfferStage,
  mapBackendInvestmentToFrontend,
  mapBackendReceivableToOffer,
  type BackendInvestment,
  type BackendReceivable,
} from "@/services/mappers/backend-receivable.mapper";
import { resolveApiMode } from "@/lib/env";
import { apiRequest } from "@/lib/api-client";
import { describeApiError } from "@/lib/api-errors";
import { createMockStore } from "@/lib/mock-store";

/** Mock stores — persisted so demo data survives F5 and is shared across tabs. */
const offersStore = createMockStore<Offer[]>("offers", () =>
  INITIAL_OFFERS.map((o) => ({ ...o })),
);
const investmentsStore = createMockStore<Investment[]>("investments", () =>
  INITIAL_INVESTMENTS.map((i) => ({ ...i })),
);

const HTTP_ONLY = "Disponível apenas com o backend (VITE_USE_MOCKS=false).";
const MOCK_ONLY = "Ação do protótipo; com o backend use Abrir captação / Avançar etapa.";

/** Message for a mock/HTTP invest below the minimum ticket (mirrors `investment_below_minimum`). */
function belowMinimumMessage(minInvestment: number): string {
  return `Aporte mínimo de R$ ${minInvestment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} nesta oferta.`;
}

function cloneOffer(offer: Offer): Offer {
  return { ...offer };
}

function cloneInvestment(investment: Investment): Investment {
  const offer = offersStore.get().find((o) => o.id === investment.offerId);
  return {
    ...investment,
    receivable: offer
      ? {
          status: offer.status,
          targetFunding: offer.targetAmount,
          funded: offer.raisedAmount,
          yieldRateMonthly: offer.yieldRateMonthly,
        }
      : undefined,
  };
}

function settleInvestments(offerId: string, status: InvestmentStatus): void {
  investmentsStore.set(
    investmentsStore
      .get()
      .map((inv) => (inv.offerId === offerId && inv.status === "active" ? { ...inv, status } : inv)),
  );
}

function applyCloseToOffer(offer: Offer): Offer {
  const resolution = resolveOfferClose({
    raisedAmount: offer.raisedAmount,
    minAmount: offer.minAmount,
    targetAmount: offer.targetAmount,
  });

  const closedAt = new Date().toISOString();

  if (resolution.outcome === "failed") {
    settleInvestments(offer.id, "refunded");
    return { ...offer, status: "failed", fidcBackfillAmount: 0, closedAt };
  }

  settleInvestments(offer.id, "settled");
  return {
    ...offer,
    status: "disbursed",
    fidcBackfillAmount: resolution.outcome === "partial_with_fidc" ? resolution.fidcAmount : 0,
    closedAt,
  };
}

async function fetchBackendReceivables(): Promise<BackendReceivable[]> {
  const data = await apiRequest<{ receivables: BackendReceivable[] }>("/v1/receivables");
  return data.receivables;
}

async function fetchBackendReceivable(id: string): Promise<BackendReceivable | null> {
  try {
    const data = await apiRequest<{ receivable: BackendReceivable }>(`/v1/receivables/${id}`);
    return data.receivable;
  } catch {
    return null;
  }
}

export async function listOffers(filters?: {
  status?: OfferStatus | OfferStatus[];
  riskLevel?: RiskLevel;
}): Promise<Offer[]> {
  let result: Offer[];

  if (resolveApiMode() === "http") {
    // Only receivables at `funding` or later are offers; earlier stages are still with the seller/analyst.
    result = (await fetchBackendReceivables())
      .filter((r) => isOfferStage(r.status))
      .map(mapBackendReceivableToOffer);
  } else {
    await sleep(250);
    result = offersStore.get().map(cloneOffer);
  }

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
  if (resolveApiMode() === "http") {
    const receivable = await fetchBackendReceivable(id);
    if (!receivable || !isOfferStage(receivable.status)) return null;
    return mapBackendReceivableToOffer(receivable);
  }

  await sleep(180);
  const offer = offersStore.get().find((o) => o.id === id);
  return offer ? cloneOffer(offer) : null;
}

export async function getOfferByDuplicataId(duplicataId: string): Promise<Offer | null> {
  if (resolveApiMode() === "http") {
    // HTTP: the offer id is the receivable id.
    return getOfferById(duplicataId);
  }

  await sleep(150);
  const offer = offersStore.get().find((o) => o.duplicataId === duplicataId);
  return offer ? cloneOffer(offer) : null;
}

/** Duplicatas the admin can open a funding for: accepted by the seller and not yet funding. */
export async function listDuplicatasReadyForOffer(filters?: {
  sellerId?: string;
}): Promise<DuplicataTitulo[]> {
  const all = await fetchAllDuplicatas();

  if (resolveApiMode() === "http") {
    return all.filter(
      (d) =>
        d.statusRecebivel === "confirmed" &&
        (filters?.sellerId == null || d.sellerId === filters.sellerId),
    );
  }

  await sleep(280);
  const offeredIds = new Set(offersStore.get().map((o) => o.duplicataId));
  return all.filter(
    (d) =>
      d.analiseAnalista === "aprovado" &&
      !offeredIds.has(d.id) &&
      d.descontoAntecipacaoPercent != null &&
      (filters?.sellerId == null || d.sellerId === filters.sellerId),
  );
}

/**
 * Admin `confirmed → funding` (`POST /v1/admin/receivables/:id/open-funding`).
 * Overrides are optional; with none the analyst's terms are kept. The request is
 * sent without a body (and therefore without `content-type`) when nothing is overridden.
 */
export async function openFunding(input: OpenFundingInput): Promise<Offer> {
  if (resolveApiMode() === "http") {
    const overrides: Record<string, number> = {};
    if (input.yieldRateMonthly !== undefined) overrides.yieldRateMonthly = input.yieldRateMonthly;
    if (input.minInvestment !== undefined && input.minInvestment > 0) {
      overrides.minInvestment = Math.round(input.minInvestment * 100) / 100;
    }
    try {
      await apiRequest(`/v1/admin/receivables/${input.duplicataId}/open-funding`, {
        method: "POST",
        ...(Object.keys(overrides).length > 0 ? { body: overrides } : {}),
      });
    } catch (err) {
      throw new Error(describeApiError(err, "Não foi possível abrir a captação."));
    }
    const offer = await getOfferById(input.duplicataId);
    if (!offer) throw new Error("Captação aberta, mas a oferta não pôde ser carregada.");
    return offer;
  }

  // Mock: open a funding with the prototype's default structure.
  const duplicata = await fetchDuplicataById(input.duplicataId);
  if (!duplicata) throw new Error("Duplicata não encontrada.");
  const target = calcDefaultTargetAmount(duplicata.valor, duplicata.descontoAntecipacaoPercent ?? 0);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7);
  return createOffer({
    duplicataId: input.duplicataId,
    quotaPrice: 1000,
    minAmount: Math.round(target * 0.6 * 100) / 100,
    deadline: deadline.toISOString(),
    platformSpreadPercent: DEFAULT_PLATFORM_SPREAD_PERCENT,
    yieldRateMonthly: input.yieldRateMonthly,
    minInvestment: input.minInvestment,
  });
}

export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  if (resolveApiMode() === "http") {
    return openFunding({
      duplicataId: input.duplicataId,
      yieldRateMonthly: input.yieldRateMonthly,
      minInvestment: input.minInvestment,
    });
  }

  await sleep(400);

  if (offersStore.get().some((o) => o.duplicataId === input.duplicataId)) {
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

  const estimatedInvestorReturnPercent = calcEstimatedInvestorReturnPercent(
    analystDiscountPercent,
    input.platformSpreadPercent,
  );
  const minInvestment = input.minInvestment ?? duplicata.minInvestment ?? 0;
  if (minInvestment > targetAmount) {
    throw new Error("Ticket mínimo não pode ser maior que o valor alvo.");
  }

  const offer: Offer = {
    id: `offer-${Date.now()}`,
    duplicataId: duplicata.id,
    faceValue: duplicata.valor,
    analystDiscountPercent,
    platformSpreadPercent: input.platformSpreadPercent,
    estimatedInvestorReturnPercent,
    // Prototype approximation: the analyst's monthly rate when set, else the period return.
    yieldRateMonthly: input.yieldRateMonthly ?? duplicata.yieldRateMonthly ?? estimatedInvestorReturnPercent / 100,
    minInvestment,
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

  offersStore.set([offer, ...offersStore.get()]);
  return cloneOffer(offer);
}

/**
 * Admin `advance-stage`: funded → processing → completed → payer_settled
 * (and overdue → payer_settled). `payer_settled` runs the investor payout on the backend.
 */
export async function advanceOfferStage(offerId: string): Promise<StageAdvanceResult> {
  if (resolveApiMode() !== "http") {
    throw new Error(HTTP_ONLY);
  }
  try {
    return await apiRequest<StageAdvanceResult>(`/v1/admin/receivables/${offerId}/advance-stage`, {
      method: "POST",
    });
  } catch (err) {
    throw new Error(describeApiError(err, "Não foi possível avançar a etapa."));
  }
}

export async function investInOffer(input: InvestInOfferInput): Promise<Investment> {
  if (resolveApiMode() === "http") {
    const amount = Math.round((input.amount ?? input.quotaCount * HTTP_QUOTA_PRICE) * 100) / 100;
    const idempotencyKey = `idemp-invest-${input.offerId}-${Date.now()}`;

    try {
      const data = await apiRequest<BackendInvestment>("/v1/investors/invest", {
        method: "POST",
        body: { receivableId: input.offerId, amount, idempotencyKey },
      });
      return mapBackendInvestmentToFrontend(data);
    } catch (err) {
      throw new Error(describeApiError(err, "Não foi possível investir."));
    }
  }

  await sleep(350);

  const index = offersStore.get().findIndex((o) => o.id === input.offerId);
  if (index < 0) {
    throw new Error("Oferta não encontrada.");
  }

  let offer = offersStore.get()[index]!;
  if (offer.status !== "fundraising") {
    throw new Error("Esta oferta não está aberta para investimentos.");
  }

  if (new Date(offer.deadline).getTime() <= Date.now()) {
    offer = applyCloseToOffer(offer);
    offersStore.set(offersStore.get().map((o) => (o.id === offer.id ? offer : o)));
    throw new Error("O prazo desta oferta encerrou.");
  }

  const remaining = calcRemainingQuotas(offer.quotaCount, offer.quotasSold);
  if (input.quotaCount <= 0) {
    throw new Error("Invista ao menos 1 cota.");
  }
  if (input.quotaCount > remaining) {
    throw new Error(`Restam apenas ${remaining} cotas nesta oferta.`);
  }

  const amount = input.quotaCount * offer.quotaPrice;
  const remainingAmount = remaining * offer.quotaPrice;
  // Same rule as the backend: below the ticket is refused unless it closes the remainder.
  if (offer.minInvestment > 0 && amount < offer.minInvestment && amount !== remainingAmount) {
    throw new Error(belowMinimumMessage(offer.minInvestment));
  }

  const investment: Investment = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    offerId: offer.id,
    investorUserId: input.investorUserId,
    quotaCount: input.quotaCount,
    amount,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  // Persist investment before close so applyCloseToOffer can settle it.
  investmentsStore.set([investment, ...investmentsStore.get()]);

  const quotasSold = offer.quotasSold + input.quotaCount;
  const raisedAmount = calcRaisedAmount(offer.quotaPrice, quotasSold);
  let nextOffer: Offer = { ...offer, quotasSold, raisedAmount };

  if (raisedAmount >= nextOffer.targetAmount) {
    nextOffer = applyCloseToOffer(nextOffer);
  }

  offersStore.set(offersStore.get().map((o) => (o.id === nextOffer.id ? nextOffer : o)));

  const stored = investmentsStore.get().find((i) => i.id === investment.id);
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
  if (resolveApiMode() === "http") {
    const data = await apiRequest<BackendInvestment[]>("/v1/investors/investments");
    let result = data.map(mapBackendInvestmentToFrontend);
    if (filters?.status) {
      result = result.filter((i) => i.status === filters.status);
    }
    return result;
  }

  await sleep(220);
  let result = investmentsStore
    .get()
    .filter((i) => matchesInvestor(i.investorUserId, investorUserId))
    .map(cloneInvestment);
  if (filters?.status) {
    result = result.filter((i) => i.status === filters.status);
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listInvestmentsByOffer(offerId: string): Promise<Investment[]> {
  if (resolveApiMode() === "http") {
    // The backend has no per-receivable investment listing for admins yet.
    return [];
  }

  await sleep(200);
  return investmentsStore
    .get()
    .filter((i) => i.offerId === offerId)
    .map(cloneInvestment)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllInvestments(filters?: {
  offerId?: string;
  status?: InvestmentStatus;
}): Promise<Investment[]> {
  if (resolveApiMode() === "http") {
    return [];
  }

  await sleep(220);
  let result = investmentsStore.get().map(cloneInvestment);
  if (filters?.offerId) {
    result = result.filter((i) => i.offerId === filters.offerId);
  }
  if (filters?.status) {
    result = result.filter((i) => i.status === filters.status);
  }
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function closeOffer(offerId: string): Promise<Offer> {
  if (resolveApiMode() === "http") {
    throw new Error(MOCK_ONLY);
  }

  await sleep(350);
  const index = offersStore.get().findIndex((o) => o.id === offerId);
  if (index < 0) {
    throw new Error("Oferta não encontrada.");
  }

  const current = offersStore.get()[index]!;
  if (current.status !== "fundraising") {
    throw new Error("Oferta já encerrada.");
  }

  const closed = applyCloseToOffer(current);
  offersStore.set(offersStore.get().map((o) => (o.id === closed.id ? closed : o)));
  return cloneOffer(closed);
}

export async function closeExpiredOffers(now: Date = new Date()): Promise<Offer[]> {
  if (resolveApiMode() === "http") {
    return [];
  }
  await sleep(120);
  const closed: Offer[] = [];
  const nowMs = now.getTime();

  offersStore.set(
    offersStore.get().map((offer) => {
      if (offer.status !== "fundraising") return offer;
      if (new Date(offer.deadline).getTime() > nowMs) return offer;
      const next = applyCloseToOffer(offer);
      closed.push(cloneOffer(next));
      return next;
    }),
  );

  return closed;
}

/** Demo helper: move deadline to the past then close */
export async function simulateOfferDeadline(offerId: string): Promise<Offer> {
  if (resolveApiMode() === "http") {
    throw new Error(MOCK_ONLY);
  }

  await sleep(200);
  const index = offersStore.get().findIndex((o) => o.id === offerId);
  if (index < 0) {
    throw new Error("Oferta não encontrada.");
  }
  const current = offersStore.get()[index]!;
  if (current.status !== "fundraising") {
    throw new Error("Oferta já encerrada.");
  }

  const withPastDeadline: Offer = {
    ...current,
    deadline: new Date(Date.now() - 60_000).toISOString(),
  };
  offersStore.set(offersStore.get().map((o) => (o.id === withPastDeadline.id ? withPastDeadline : o)));
  return closeOffer(offerId);
}
