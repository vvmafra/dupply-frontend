export type ReceivableStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "LISTED"
  | "FUNDED"
  | "SETTLED"
  | "DEFAULTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface BusinessEvent {
  id: string;
  label: string;
  description?: string;
  date: string;
  completed: boolean;
}

export interface ReceivableDocument {
  id: string;
  name: string;
  type: string;
  status: "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
}

export interface Receivable {
  id: string;
  tradeNoteNumber: string;
  invoiceNumber: string;
  sellerName: string;
  sellerTaxId: string;
  debtorName: string;
  debtorTaxId: string;
  grossAmount: number;
  estimatedNetAmount: number;
  availableAmount: number;
  estimatedRate: number;
  issueDate: string;
  dueDate: string;
  termInDays: number;
  score: number;
  risk: RiskLevel;
  status: ReceivableStatus;
  documents: ReceivableDocument[];
  businessEvents: BusinessEvent[];
  internalTransactionIds: string[];
  description?: string;
  debtorEmail?: string;
  debtorConfirmed?: boolean;
}
