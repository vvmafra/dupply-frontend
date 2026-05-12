import type { InvestmentStatus } from "./investment.types";

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
  ACTIVE: "Ativo",
  SETTLED: "Liquidado",
  DEFAULTED: "Inadimplente",
  SIMULATED: "Simulado",
};

export function getInvestmentStatusLabel(status: InvestmentStatus): string {
  return INVESTMENT_STATUS_LABELS[status];
}

export function getInvestmentStatusColor(status: InvestmentStatus): string {
  const colors: Record<InvestmentStatus, string> = {
    ACTIVE: "text-primary bg-primary/15",
    SETTLED: "text-success bg-success/20",
    DEFAULTED: "text-destructive bg-destructive/20",
    SIMULATED: "text-muted-foreground bg-muted",
  };
  return colors[status];
}
