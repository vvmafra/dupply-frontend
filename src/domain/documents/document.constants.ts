import type { DocumentStatus } from "./document.types";

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING: "Pendente",
  UPLOADED: "Enviado",
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

export function getDocumentStatusLabel(status: DocumentStatus): string {
  return DOCUMENT_STATUS_LABELS[status];
}

export function getDocumentStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    PENDING: "text-muted-foreground bg-muted",
    UPLOADED: "text-info-foreground bg-info/15",
    UNDER_REVIEW: "text-warning-foreground bg-warning/15",
    APPROVED: "text-success-foreground bg-success/15",
    REJECTED: "text-destructive bg-destructive/15",
  };
  return colors[status];
}
