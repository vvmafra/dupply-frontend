export type DocumentStatus = "PENDING" | "UPLOADED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface DocumentItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  uploadedAt?: string;
}
