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
    UPLOADED: "text-info bg-info/20",
    UNDER_REVIEW: "text-warning bg-warning/20",
    APPROVED: "text-success bg-success/20",
    REJECTED: "text-destructive bg-destructive/20",
  };
  return colors[status];
}
