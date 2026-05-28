// --- Metadata (nested in create/update; parsed from string in responses) ---

export type ReceivableMetaDataDTO = {
  type?: "commercial" | "service";
  billNumber?: string;
  invoiceNumber?: string;
  issuedAt?: string;
  dueDate?: string;
  payerCnpj?: string;
  payerLegalName?: string;
  payerFinancialEmail?: string;
  fiscalDocumentType?: "nfe" | "nfce" | "nfse" | "other";
  fiscalDocumentKey?: string;
  proofType?: "delivery" | "acceptance" | "service_provision";
  payerAcceptanceStatus?: "accepted" | "pending" | "refused";
  /** API I/O: reais (backend converts to centavos in stored JSON) */
  desiredAnticipationValue?: number;
  antifraudDeclarationsAccepted?: boolean;
};

// --- Request DTOs ---

export type CreateReceivableRequestDTO = {
  payerCnpj: string;
  payerLegalName?: string;
  payerFinancialEmail?: string;
  /** Face value — reais, multipleOf 0.01 */
  value?: number;
  receivableMetaData?: ReceivableMetaDataDTO;
};

export type UpdateReceivableRequestDTO = {
  value?: number;
  receivableMetaData?: ReceivableMetaDataDTO;
};

export type RiskDecisionRequestDTO =
  | { decision: "offer"; proposedValue: number }
  | { decision: "reprove" };

export type SellerDecisionRequestDTO = {
  decision: "accept" | "reject";
};

// --- Response DTOs ---

export type ReceivableStatusDTO =
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

export type ReceivableRowDTO = {
  id: string;
  status: ReceivableStatusDTO;
  sellerId: string;
  payerId: string;
  /** JSON string from API — parse in mapper */
  receivableMetaData: string | null;
  /** Face value — reais (backend maps DB cents → reais) */
  value: number;
  proposedValue: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ReceivableErrorBodyDTO = {
  error: string;
};
