import type { ReceivableStatus, RiskLevel } from "./receivable.types";
import { RECEIVABLE_STATUS_LABELS, RISK_LABELS } from "./receivable.constants";

export function getStatusLabel(status: ReceivableStatus): string {
  return RECEIVABLE_STATUS_LABELS[status];
}

export function getStatusColor(status: ReceivableStatus): string {
  const colors: Record<ReceivableStatus, string> = {
    DRAFT: "text-muted-foreground bg-muted border-border",
    UNDER_REVIEW: "text-warning-foreground bg-warning/15 border-warning/30",
    APPROVED: "text-success-foreground bg-success/15 border-success/30",
    LISTED: "text-info-foreground bg-info/15 border-info/30",
    FUNDED: "text-primary bg-primary/10 border-primary/30",
    SETTLED: "text-success-foreground bg-success/20 border-success/40",
    DEFAULTED: "text-destructive-foreground bg-destructive/15 border-destructive/30",
  };
  return colors[status];
}

export function getRiskLabel(risk: RiskLevel): string {
  return RISK_LABELS[risk];
}

export function getRiskColor(risk: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    LOW: "text-success-foreground bg-success/15 border-success/30",
    MEDIUM: "text-warning-foreground bg-warning/15 border-warning/30",
    HIGH: "text-destructive-foreground bg-destructive/15 border-destructive/30",
  };
  return colors[risk];
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-success-foreground bg-success/15 border-success/30";
  if (score >= 60) return "text-warning-foreground bg-warning/15 border-warning/30";
  return "text-destructive-foreground bg-destructive/15 border-destructive/30";
}

export function getRiskFromScore(score: number): RiskLevel {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  return "HIGH";
}
