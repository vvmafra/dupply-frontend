export type InvestmentStatus = "ACTIVE" | "SETTLED" | "DEFAULTED" | "SIMULATED";

export interface Investment {
  id: string;
  receivableId: string;
  operationCode: string;
  sellerName: string;
  debtorName: string;
  investedAmount: number;
  estimatedReturn: number;
  dueDate: string;
  status: InvestmentStatus;
  simulatedAt: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  rate: number;
}

export interface InvestorSummary {
  totalInvested: number;
  estimatedReturn: number;
  availableOpportunities: number;
  activeOperations: number;
  settledOperations: number;
}
