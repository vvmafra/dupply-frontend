import type { ReceivableStatus } from "@/domain/receivable/receivable.types";

export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
  created: "Rascunho",
  under_review: "Em análise",
  offer: "Proposta em aberto",
  reproved: "Reprovada",
  rejected: "Proposta recusada",
  approved: "Em análise do sacado",
  processing: "Transação em andamento",
  completed: "Transação completa",
  payer_rejected: "Recusada pelo sacado",
  confirmed: "Confirmada",
  payer_settled: "Liquidada",
  overdue: "Em atraso",
};

export function getReceivableStatusLabel(status: ReceivableStatus): string {
  return RECEIVABLE_STATUS_LABELS[status];
}

export function getReceivableStatusColor(status: ReceivableStatus): string {
  const colors: Record<ReceivableStatus, string> = {
    created: "text-muted-foreground bg-muted/50 border-muted-foreground/30",
    under_review: "text-warning bg-warning/20 border-warning/40",
    offer: "text-info bg-info/20 border-info/40",
    reproved: "text-destructive bg-destructive/20 border-destructive/40",
    rejected: "text-destructive bg-destructive/20 border-destructive/40",
    approved: "text-info bg-info/20 border-info/40",
    processing: "text-warning bg-warning/20 border-warning/40",
    completed: "text-success bg-success/20 border-success/40",
    payer_rejected: "text-destructive bg-destructive/20 border-destructive/40",
    confirmed: "text-success bg-success/20 border-success/40",
    payer_settled: "text-success bg-success/20 border-success/40",
    overdue: "text-destructive bg-destructive/20 border-destructive/40",
  };
  return colors[status];
}
