/**
 * Registro único de status por entidade: valor → rótulo + tom de cor.
 * É a única fonte que `StatusBadge` consulta. Os rótulos vêm das constantes
 * de cada domínio; aqui só se acrescenta o tom (cor semântica).
 *
 * Tons: success · warning · destructive · info · neutral · ai
 * Regra: azul = ação/andamento, verde/âmbar/coral = estado, violeta = IA.
 * Inventário e decisões pendentes em .specs/features/design-system/spec.md.
 */
import {
  DUPLICATA_ANALISE_LABELS,
  DUPLICATA_ANALISE_LABELS_FEMININE,
} from "@/domain/duplicata/duplicata-analise.constants";
import { DUPLICATA_ACEITE_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import type { DuplicataAceiteSacado, DuplicataAnaliseAnalista } from "@/domain/duplicata/duplicata.types";
import { INVESTMENT_STATUS_LABELS, OFFER_STATUS_LABELS, RECEIVABLE_STAGE_LABELS, RISK_LEVEL_LABELS } from "@/domain/offer/offer.constants";
import type { InvestmentStatus, OfferStatus, ReceivableStage, RiskLevel } from "@/domain/offer/offer.types";
import { DOCUMENT_STATUS_LABELS, RECEIVABLE_STATUS_LABELS, RISK_LABELS } from "@/domain/receivables/receivable.constants";
import type { ReceivableStatus, RiskLevel as ReceivableRiskLevel } from "@/domain/receivables/receivable.types";
import { INVESTOR_KYC_STATUS_LABELS } from "@/domain/investor/investor.constants";
import type { InvestorKycStatus } from "@/domain/investor/investor.types";
import type { AnalystDuplicatasAccessStatus, ValidationStatus } from "@/domain/seller/seller.types";
import type { BlockchainTransactionStatus } from "@/domain/blockchain/blockchain.types";
import type { DocumentStatus } from "@/domain/documents/document.types";

export type StatusTone = "success" | "warning" | "destructive" | "info" | "neutral" | "ai";

export type StatusEntry = { label: string; tone: StatusTone };

type Registry<T extends string> = Record<T, StatusEntry>;

function withTones<T extends string>(labels: Record<T, string>, tones: Record<T, StatusTone>): Registry<T> {
  const out = {} as Registry<T>;
  for (const key of Object.keys(labels) as T[]) out[key] = { label: labels[key], tone: tones[key] };
  return out;
}

export const STATUS_REGISTRY = {
  /** Análise do analista sobre a duplicata (`DuplicataAnaliseAnalista`). */
  duplicataAnalise: withTones<DuplicataAnaliseAnalista>(DUPLICATA_ANALISE_LABELS, {
    pendente: "warning",
    for_approval: "info",
    aprovado: "success",
    reprovado: "destructive",
  }),
  /** Mesma análise, rótulo no feminino ("Aprovada") para quando o sujeito é "duplicata". */
  duplicataAnaliseFeminine: withTones<DuplicataAnaliseAnalista>(DUPLICATA_ANALISE_LABELS_FEMININE, {
    pendente: "warning",
    for_approval: "info",
    aprovado: "success",
    reprovado: "destructive",
  }),
  /** Aceite do sacado (`DuplicataAceiteSacado`). */
  duplicataAceite: withTones<DuplicataAceiteSacado>(DUPLICATA_ACEITE_LABELS, {
    pendente: "warning",
    aceito: "success",
    recusado: "destructive",
  }),
  /** Estágio do recebível no backend (`ReceivableStage`, modo HTTP). */
  receivableStage: withTones<ReceivableStage>(RECEIVABLE_STAGE_LABELS, {
    created: "neutral",
    under_review: "warning",
    reproved: "destructive",
    offer: "info",
    rejected: "destructive",
    confirmed: "success",
    funding: "info",
    funded: "success",
    processing: "info",
    completed: "success",
    payer_settled: "success",
    overdue: "destructive",
  }),
  /** Status legado do admin (`ReceivableStatus`); deprecado junto com receivables. */
  receivableStatus: withTones<ReceivableStatus>(RECEIVABLE_STATUS_LABELS, {
    DRAFT: "neutral",
    UNDER_REVIEW: "warning",
    APPROVED: "success",
    LISTED: "info",
    FUNDED: "success",
    SETTLED: "success",
    DEFAULTED: "destructive",
  }),
  offer: withTones<OfferStatus>(OFFER_STATUS_LABELS, {
    fundraising: "info",
    failed: "destructive",
    disbursed: "success",
  }),
  investment: withTones<InvestmentStatus>(INVESTMENT_STATUS_LABELS, {
    active: "info",
    refunded: "warning",
    settled: "success",
  }),
  /** Cadastro do cedente (`ValidationStatus`). Não havia mapa de rótulos; este é o canônico. */
  sellerValidation: withTones<ValidationStatus>(
    {
      NOT_STARTED: "Não iniciado",
      DOCUMENTS_PENDING: "Documentos pendentes",
      KYC_PENDING: "KYC pendente",
      UNDER_REVIEW: "Em análise",
      APPROVED: "Aprovado",
      REJECTED: "Rejeitado",
    },
    {
      NOT_STARTED: "neutral",
      DOCUMENTS_PENDING: "warning",
      KYC_PENDING: "warning",
      UNDER_REVIEW: "warning",
      APPROVED: "success",
      REJECTED: "destructive",
    },
  ),
  analystAccess: withTones<AnalystDuplicatasAccessStatus>(
    { PENDING: "Pendente", UNDER_REVIEW: "Em análise", APPROVED: "Aprovado", REJECTED: "Rejeitado" },
    { PENDING: "warning", UNDER_REVIEW: "warning", APPROVED: "success", REJECTED: "destructive" },
  ),
  investorKyc: withTones<InvestorKycStatus>(INVESTOR_KYC_STATUS_LABELS, {
    PENDING: "warning",
    IN_PROGRESS: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
  }),
  document: withTones<DocumentStatus>(DOCUMENT_STATUS_LABELS, {
    PENDING: "neutral",
    UPLOADED: "info",
    UNDER_REVIEW: "warning",
    APPROVED: "success",
    REJECTED: "destructive",
  }),
  blockchainTx: withTones<BlockchainTransactionStatus>(
    { PENDING: "Pendente", SUCCESS: "Confirmada", FAILED: "Falhou" },
    { PENDING: "warning", SUCCESS: "success", FAILED: "destructive" },
  ),
  /** Risco em minúsculas (`offer.types`). */
  risk: withTones<RiskLevel>(RISK_LEVEL_LABELS, { low: "success", medium: "warning", high: "destructive" }),
  /** Risco em maiúsculas (`receivable.types`). Unificar quando receivables for deprecado. */
  riskUpper: withTones<ReceivableRiskLevel>(RISK_LABELS, { LOW: "success", MEDIUM: "warning", HIGH: "destructive" }),
} as const;

export type StatusEntity = keyof typeof STATUS_REGISTRY;
export type StatusValue<E extends StatusEntity> = keyof (typeof STATUS_REGISTRY)[E] & string;

export function getStatus<E extends StatusEntity>(entity: E, value: StatusValue<E>): StatusEntry {
  const table = STATUS_REGISTRY[entity] as Record<string, StatusEntry>;
  return table[value] ?? { label: value, tone: "neutral" };
}
