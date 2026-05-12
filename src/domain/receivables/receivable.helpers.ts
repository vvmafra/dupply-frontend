import type { ReceivableStatus, RiskLevel } from "./receivable.types";
import { RECEIVABLE_STATUS_LABELS, RISK_LABELS } from "./receivable.constants";

export function getStatusLabel(status: ReceivableStatus): string {
  return RECEIVABLE_STATUS_LABELS[status];
}

export function getStatusColor(status: ReceivableStatus): string {
  const colors: Record<ReceivableStatus, string> = {
    DRAFT: "text-muted-foreground bg-muted border-border",
    UNDER_REVIEW: "text-warning bg-warning/20 border-warning/40",
    APPROVED: "text-success bg-success/20 border-success/40",
    LISTED: "text-info bg-info/20 border-info/40",
    FUNDED: "text-primary bg-primary/15 border-primary/35",
    SETTLED: "text-success bg-success/25 border-success/45",
    DEFAULTED: "text-destructive bg-destructive/20 border-destructive/40",
  };
  return colors[status];
}

export function getRiskLabel(risk: RiskLevel): string {
  return RISK_LABELS[risk];
}

export function getRiskColor(risk: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    LOW: "text-success bg-success/20 border-success/40",
    MEDIUM: "text-warning bg-warning/20 border-warning/40",
    HIGH: "text-destructive bg-destructive/20 border-destructive/40",
  };
  return colors[risk];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-success bg-success/20 border-success/40";
  if (score >= 60) return "text-warning bg-warning/20 border-warning/40";
  return "text-destructive bg-destructive/20 border-destructive/40";
}

export function getRiskFromScore(score: number): RiskLevel {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  return "HIGH";
}
