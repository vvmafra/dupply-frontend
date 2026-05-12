import type { PlatformMetrics } from "@/domain/admin/admin.types";

export const PLATFORM_METRICS: PlatformMetrics = {
  totalCompanies: 5,
  sellersInValidation: 3,
  kycApproved: 3,
  documentsPending: 8,
  receivablesRegistered: 8,
  receivablesUnderReview: 1,
  receivablesApproved: 1,
  receivablesFunded: 1,
  receivablesSettled: 1,
  receivablesDefaulted: 1,
  totalVolume: 742300,
  fundedVolume: 252000,
};

export const MONTHLY_VOLUME_DATA = [
  { month: "Jan", volume: 45000, funded: 30000 },
  { month: "Fev", volume: 62000, funded: 45000 },
  { month: "Mar", volume: 78000, funded: 58000 },
  { month: "Abr", volume: 95000, funded: 72000 },
  { month: "Mai", volume: 125000, funded: 90000 },
];

export const STATUS_DISTRIBUTION = [
  { status: "Rascunho", count: 1, color: "var(--muted-foreground)" },
  { status: "Em análise", count: 1, color: "var(--warning)" },
  { status: "Aprovado", count: 1, color: "var(--success)" },
  { status: "Listado", count: 2, color: "var(--info)" },
  { status: "Financiado", count: 1, color: "var(--primary)" },
  { status: "Liquidado", count: 1, color: "var(--chart-3)" },
  { status: "Inadimplente", count: 1, color: "var(--destructive)" },
];

export const RISK_DISTRIBUTION = [
  { risk: "Baixo", count: 4, color: "var(--success)" },
  { risk: "Médio", count: 3, color: "var(--warning)" },
  { risk: "Alto", count: 1, color: "var(--destructive)" },
];
