import { sleep, calculateEstimatedReturn } from "@/lib/utils";
import type { Investment } from "@/domain/investor/investment.types";

const MOCK_INVESTMENTS: Investment[] = [
  {
    id: "inv-001",
    receivableId: "rec-004",
    operationCode: "OPE-004",
    sellerName: "Agrovale Insumos LTDA",
    debtorName: "Atacado União SA",
    investedAmount: 80000,
    estimatedReturn: 4800,
    dueDate: "2025-08-18",
    status: "ACTIVE",
    simulatedAt: "2025-04-26T10:00:00Z",
    risk: "LOW",
    rate: 2.0,
  },
  {
    id: "inv-002",
    receivableId: "rec-002",
    operationCode: "OPE-002",
    sellerName: "LogMais Transportes LTDA",
    debtorName: "Construtora Horizonte LTDA",
    investedAmount: 35000,
    estimatedReturn: 2100,
    dueDate: "2025-05-09",
    status: "SETTLED",
    simulatedAt: "2025-03-16T09:00:00Z",
    risk: "MEDIUM",
    rate: 2.4,
  },
];

export async function fetchInvestorPositions(): Promise<Investment[]> {
  await sleep(400);
  return [...MOCK_INVESTMENTS];
}

export async function simulateInvestment(params: {
  receivableId: string;
  amount: number;
  rate: number;
  termInDays: number;
  sellerName: string;
  debtorName: string;
  dueDate: string;
  risk: Investment["risk"];
}): Promise<Investment> {
  await sleep(700);
  const estimatedReturn = calculateEstimatedReturn(params.amount, params.rate, params.termInDays);
  const investment: Investment = {
    id: `inv-${Date.now()}`,
    receivableId: params.receivableId,
    operationCode: `OPE-${params.receivableId.split("-")[1]}`,
    sellerName: params.sellerName,
    debtorName: params.debtorName,
    investedAmount: params.amount,
    estimatedReturn,
    dueDate: params.dueDate,
    status: "SIMULATED",
    simulatedAt: new Date().toISOString(),
    risk: params.risk,
    rate: params.rate,
  };
  MOCK_INVESTMENTS.push(investment);
  return investment;
}
