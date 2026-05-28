import type {
  ReceivableFiscalDocumentType,
  ReceivablePayerAcceptanceStatus,
  ReceivableProofType,
  ReceivableType,
} from "@/domain/receivable/receivable.types";

/** Dados canônicos da recebível demo — usados no autofill e fluxos de demonstração. */
export const RECEIVABLE_DEMO = {
  type: "commercial" as ReceivableType,
  billNumber: "DUP-DEMO-8842",
  invoiceNumber: "NF-2026-0018842",
  faceValue: 18500.75,
  issuedAt: "2026-01-18",
  dueDate: "2026-05-18",
  payerCnpj: "33.444.555/0001-66",
  payerLegalName: "Sacado Demo Ltda",
  payerFinancialEmail: "financeiro@sacadodemo.com.br",
  fiscalDocumentType: "nfe" as ReceivableFiscalDocumentType,
  fiscalDocumentKey: "35260112345678901234550010000001231234567890",
  fiscalDocumentUploaded: true,
  proofType: "delivery" as ReceivableProofType,
  proofDocumentUploaded: true,
  payerAcceptanceStatus: "pending" as ReceivablePayerAcceptanceStatus,
  desiredAnticipationValue: 15000,
  antifraudDeclarationsAccepted: true,
  userScore: 74,
  receivableScore: 81,
  discountPercent: 2.8,
} as const;

/** Valores em string para o formulário de cadastro (autofill). */
export function getReceivableDemoAutofillFormValues() {
  return {
    type: RECEIVABLE_DEMO.type,
    billNumber: RECEIVABLE_DEMO.billNumber,
    invoiceNumber: RECEIVABLE_DEMO.invoiceNumber,
    faceValue: String(RECEIVABLE_DEMO.faceValue),
    issuedAt: RECEIVABLE_DEMO.issuedAt,
    dueDate: RECEIVABLE_DEMO.dueDate,
    payerCnpj: RECEIVABLE_DEMO.payerCnpj,
    payerLegalName: RECEIVABLE_DEMO.payerLegalName,
    payerFinancialEmail: RECEIVABLE_DEMO.payerFinancialEmail,
    fiscalDocumentType: RECEIVABLE_DEMO.fiscalDocumentType,
    fiscalDocumentKey: RECEIVABLE_DEMO.fiscalDocumentKey,
    fiscalUploaded: RECEIVABLE_DEMO.fiscalDocumentUploaded,
    proofType: RECEIVABLE_DEMO.proofType,
    proofUploaded: RECEIVABLE_DEMO.proofDocumentUploaded,
    payerAcceptanceStatus: RECEIVABLE_DEMO.payerAcceptanceStatus,
    desiredAnticipationValue: String(RECEIVABLE_DEMO.desiredAnticipationValue),
    declarations: RECEIVABLE_DEMO.antifraudDeclarationsAccepted,
  };
}
