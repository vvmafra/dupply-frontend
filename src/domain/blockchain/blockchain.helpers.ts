import type { BlockchainTransactionStatus } from "./blockchain.types";
import { EVENT_TYPE_LABELS } from "./blockchain.mock";

export function getEventTypeLabel(eventType: string): string {
  return EVENT_TYPE_LABELS[eventType] ?? eventType;
}

export function getTransactionStatusColor(status: BlockchainTransactionStatus): string {
  const colors: Record<BlockchainTransactionStatus, string> = {
    PENDING: "text-warning bg-warning/20",
    SUCCESS: "text-success bg-success/20",
    FAILED: "text-destructive bg-destructive/20",
  };
  return colors[status];
}

export function getTransactionStatusLabel(status: BlockchainTransactionStatus): string {
  const labels: Record<BlockchainTransactionStatus, string> = {
    PENDING: "Pendente",
    SUCCESS: "Confirmado",
    FAILED: "Falhou",
  };
  return labels[status];
}
