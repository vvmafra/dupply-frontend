export type ReceivableStatus =
  | "created"
  | "under_review"
  | "reproved"
  | "offer"
  | "rejected"
  | "approved"
  | "payer_rejected"
  | "confirmed"
  | "processing"
  | "completed"
  | "payer_settled"
  | "overdue";

export type ReceivableType = "commercial" | "service";

export type ReceivableFiscalDocumentType = "nfe" | "nfce" | "nfse" | "other";

export type ReceivableProofType = "delivery" | "acceptance" | "service_provision";

export type ReceivablePayerAcceptanceStatus = "accepted" | "pending" | "refused";

/** UI form values — English API enums aligned with backend metadata keys. */
export type ReceivableFormValues = {
  type: ReceivableType;
  billNumber: string;
  invoiceNumber: string;
  faceValue: number;
  issuedAt: string;
  dueDate: string;
  payerCnpj: string;
  payerLegalName: string;
  payerFinancialEmail: string;
  fiscalDocumentType: ReceivableFiscalDocumentType;
  fiscalDocumentKey: string;
  proofType: ReceivableProofType;
  payerAcceptanceStatus: ReceivablePayerAcceptanceStatus;
  desiredAnticipationValue: number;
  antifraudDeclarationsAccepted: boolean;
  /** Document upload booleans — UI only until Module 6 */
  fiscalDocumentUploaded?: boolean;
  proofDocumentUploaded?: boolean;
};

export type ReceivableListItem = {
  id: string;
  billNumber: string;
  payerLegalName: string;
  faceValue: number;
  dueDate: string;
  status: ReceivableStatus;
};

export type ReceivableDetail = ReceivableListItem & {
  sellerId: string;
  payerId: string;
  invoiceNumber: string;
  issuedAt: string;
  payerCnpj: string;
  payerFinancialEmail: string;
  type: ReceivableType;
  proposedValue: number | null;
  fiscalDocumentType: ReceivableFiscalDocumentType;
  fiscalDocumentKey: string;
  proofType: ReceivableProofType;
  payerAcceptanceStatus: ReceivablePayerAcceptanceStatus;
  desiredAnticipationValue: number;
  antifraudDeclarationsAccepted: boolean;
  /** Derived for seller offer wizard when status=offer */
  discountPercent?: number;
  createdAt: string;
  updatedAt: string;
  /** From createdAt when status !== created */
  submittedAt: string;
};
