import type {
  DuplicataAnaliseAnalista,
  DuplicataTitulo,
} from "@/domain/duplicata/duplicata.types";
import { OFFER_VISIBLE_STAGES } from "@/domain/offer/offer.constants";
import { mapScoreToRiskLevel } from "@/domain/offer/offer-risk.helpers";
import type {
  Investment,
  InvestmentStatus,
  Offer,
  OfferStatus,
  ReceivableStage,
} from "@/domain/offer/offer.types";

/**
 * Backend receivable (`GET /v1/receivables`, `/v1/receivables/:id`) → frontend models.
 * Money is in reais, `yieldRateMonthly` is a fraction (0.018 = 1,8% a.m.),
 * `minInvestment` is reais (0 = no minimum).
 */

/** Standard quota size used to express reais amounts as quotas in the investor UI. */
export const HTTP_QUOTA_PRICE = 100;

export interface BackendReceivable {
  id: string;
  status: string;
  sellerId: string;
  payerId?: string;
  receivableMetaData?: string | Record<string, unknown> | null;
  aiReport?: string | Record<string, unknown> | null;
  aiReportPdfUrl?: string | null;
  value: number;
  proposedValue?: number | null;
  statusHistory?: Record<string, string> | null;
  targetFunding?: number;
  funded?: number;
  yieldRateMonthly?: number;
  minInvestment?: number;
  createdAt?: string;
}

export interface BackendInvestment {
  id: string;
  receivableId: string;
  amount: number;
  status: string;
  createdAt?: string;
  receivable?: {
    status: string;
    targetFunding: number;
    funded: number;
    yieldRateMonthly: number;
  };
}

function parseJsonField<T>(raw: unknown, label: string): T | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to parse ${label}`, e);
    return null;
  }
}

export function isReceivableStage(value: string): value is ReceivableStage {
  return (
    [
      "created",
      "under_review",
      "reproved",
      "offer",
      "rejected",
      "confirmed",
      "funding",
      "funded",
      "processing",
      "completed",
      "payer_settled",
      "overdue",
    ] as string[]
  ).includes(value);
}

/** Analyst discount (%) implied by `proposedValue` over `value`, 2 decimals. */
export function calcDescontoPercent(value: number, proposedValue?: number | null): number | undefined {
  if (proposedValue == null || value <= 0) return undefined;
  return Math.round((1 - proposedValue / value) * 100 * 100) / 100;
}

function mapStageToAnalise(status: string): DuplicataAnaliseAnalista {
  switch (status) {
    case "offer":
      return "for_approval";
    case "confirmed":
    case "funding":
    case "funded":
    case "processing":
    case "completed":
    case "payer_settled":
    case "overdue":
      return "aprovado";
    case "reproved":
    case "rejected":
      return "reprovado";
    default:
      return "pendente";
  }
}

export function mapBackendReceivableToDuplicata(r: BackendReceivable): DuplicataTitulo {
  const meta = parseJsonField<Record<string, any>>(r.receivableMetaData, "receivableMetaData") ?? {};
  const value = r.value ?? 0;
  const proposedValue = r.proposedValue ?? undefined;

  return {
    id: r.id,
    sellerId: r.sellerId,
    sellerName: "Sua Empresa",
    tipo: meta.type === "service" ? "servico" : "mercantil",
    numeroDuplicata: meta.billNumber ?? "",
    numeroFatura: meta.invoiceNumber ?? "",
    valor: value,
    dataEmissao: meta.issuedAt ? String(meta.issuedAt).split("T")[0] : "",
    dataVencimento: meta.dueDate ? String(meta.dueDate).split("T")[0] : "",
    sacadoCnpj: meta.payerCnpj ?? "",
    sacadoRazaoSocial: meta.payerLegalName ?? "",
    sacadoEmailFinanceiro: meta.payerFinancialEmail ?? "",
    documentoFiscalTipo: meta.fiscalDocumentType ?? "nfe",
    documentoFiscalChave: meta.fiscalDocumentKey ?? "",
    documentoFiscalAnexado: Boolean(meta.fiscalDocumentType),
    comprovanteTipo:
      meta.proofType === "service_provision"
        ? "prestacao_servico"
        : meta.proofType === "acceptance"
          ? "aceite"
          : "entrega",
    comprovanteAnexado: Boolean(meta.proofType),
    statusAceiteSacado:
      meta.payerAcceptanceStatus === "accepted" || meta.payerAcceptanceStatus === "aceito"
        ? "aceito"
        : meta.payerAcceptanceStatus === "refused" || meta.payerAcceptanceStatus === "recusado"
          ? "recusado"
          : "pendente",
    valorDesejadoAntecipacao: meta.desiredAnticipationValue ?? value,
    declaracoesAntifraudeAceitas: meta.antifraudDeclarationsAccepted ?? false,
    enviadoEm: r.createdAt ?? new Date().toISOString(),
    analiseAnalista: mapStageToAnalise(r.status),
    descontoAntecipacaoPercent: calcDescontoPercent(value, proposedValue),
    valorLiquidoAntecipacao: proposedValue,
    yieldRateMonthly: r.yieldRateMonthly ?? undefined,
    minInvestment: r.minInvestment ?? undefined,
    targetFunding: r.targetFunding ?? undefined,
    funded: r.funded ?? undefined,
    scoreUsuario: 85,
    scoreDuplicata: 90,
    statusHistory: r.statusHistory ?? undefined,
    statusRecebivel: r.status,
    aiReport: parseJsonField<DuplicataTitulo["aiReport"]>(r.aiReport, "aiReport"),
    aiReportPdfUrl: r.aiReportPdfUrl,
  };
}

/** Whether a receivable stage is exposed as an offer to investors / the admin offers list. */
export function isOfferStage(status: string): status is ReceivableStage {
  return isReceivableStage(status) && OFFER_VISIBLE_STAGES.has(status);
}

function mapStageToOfferStatus(stage: string): OfferStatus {
  if (stage === "reproved" || stage === "rejected") return "failed";
  if (stage === "funding") return "fundraising";
  if (isOfferStage(stage)) return "disbursed";
  // Pre-funding stages are not offers; callers filter with `isOfferStage`.
  return "fundraising";
}

/**
 * Backend receivable → `Offer`. In HTTP mode an offer *is* the receivable
 * (`offer.id === receivable.id`), so callers should filter with `isOfferStage`.
 */
export function mapBackendReceivableToOffer(r: BackendReceivable): Offer {
  const targetAmount =
    r.targetFunding && r.targetFunding > 0 ? r.targetFunding : (r.proposedValue ?? r.value);
  const raisedAmount = r.funded ?? 0;
  const quotaCount = Math.max(1, Math.floor(targetAmount / HTTP_QUOTA_PRICE));
  const quotasSold = Math.floor(raisedAmount / HTTP_QUOTA_PRICE);
  const yieldRateMonthly = r.yieldRateMonthly ?? 0;
  const analystDiscountPercent = calcDescontoPercent(r.value, r.proposedValue) ?? 0;

  const meta = parseJsonField<Record<string, any>>(r.receivableMetaData, "receivableMetaData");
  const dueDate = meta?.dueDate ? new Date(String(meta.dueDate)) : null;
  const deadline =
    dueDate && !Number.isNaN(dueDate.getTime())
      ? dueDate.toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const status = mapStageToOfferStatus(r.status);
  const scoreSnapshot = 75;

  return {
    id: r.id,
    duplicataId: r.id,
    faceValue: r.value,
    analystDiscountPercent,
    platformSpreadPercent: 0,
    // Investor return is the monthly rate (simple interest, 30-day base).
    estimatedInvestorReturnPercent: yieldRateMonthly * 100,
    yieldRateMonthly,
    minInvestment: r.minInvestment ?? 0,
    receivableStage: isReceivableStage(r.status) ? r.status : undefined,
    riskLevel: mapScoreToRiskLevel(scoreSnapshot),
    scoreDuplicataSnapshot: scoreSnapshot,
    targetAmount,
    // The backend only closes a funding when it is fully funded — no partial floor.
    minAmount: targetAmount,
    quotaPrice: HTTP_QUOTA_PRICE,
    quotaCount,
    quotasSold,
    raisedAmount,
    deadline,
    status,
    backfillSource: "fidc",
    fidcBackfillAmount: 0,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  };
}

export function mapBackendInvestmentToFrontend(inv: BackendInvestment): Investment {
  let status: InvestmentStatus = "active";
  if (inv.status === "refunded") {
    status = "refunded";
  } else if (
    inv.status === "settled" ||
    inv.receivable?.status === "completed" ||
    inv.receivable?.status === "payer_settled"
  ) {
    status = "settled";
  }

  return {
    id: inv.id,
    offerId: inv.receivableId,
    investorUserId: "user-demo",
    quotaCount: Math.floor(inv.amount / HTTP_QUOTA_PRICE),
    amount: inv.amount,
    status,
    createdAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : new Date().toISOString(),
    receivable: inv.receivable
      ? {
          status: inv.receivable.status,
          targetFunding: inv.receivable.targetFunding,
          funded: inv.receivable.funded,
          yieldRateMonthly: inv.receivable.yieldRateMonthly,
        }
      : undefined,
  };
}
