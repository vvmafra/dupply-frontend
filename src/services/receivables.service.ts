import { sleep } from "@/lib/utils";
import { MOCK_RECEIVABLES } from "@/data/receivables.mock";
import type { Receivable, ReceivableStatus } from "@/domain/receivables/receivable.types";

export async function fetchReceivables(): Promise<Receivable[]> {
  await sleep(400);
  return [...MOCK_RECEIVABLES];
}

export async function fetchReceivableById(id: string): Promise<Receivable | null> {
  await sleep(300);
  return MOCK_RECEIVABLES.find((r) => r.id === id) ?? null;
}

export async function createReceivable(data: Partial<Receivable>): Promise<Receivable> {
  await sleep(600);
  const id = `rec-${Date.now()}`;
  const newReceivable: Receivable = {
    id,
    tradeNoteNumber: data.tradeNoteNumber ?? "",
    invoiceNumber: data.invoiceNumber ?? "",
    sellerName: data.sellerName ?? "Alpha Distribuidora LTDA",
    sellerTaxId: data.sellerTaxId ?? "12345678000195",
    debtorName: data.debtorName ?? "",
    debtorTaxId: data.debtorTaxId ?? "",
    grossAmount: data.grossAmount ?? 0,
    estimatedNetAmount: data.estimatedNetAmount ?? 0,
    availableAmount: data.availableAmount ?? 0,
    estimatedRate: data.estimatedRate ?? 2.0,
    issueDate: data.issueDate ?? new Date().toISOString().split("T")[0],
    dueDate: data.dueDate ?? "",
    termInDays: data.termInDays ?? 0,
    score: 0,
    risk: "MEDIUM",
    status: "UNDER_REVIEW",
    documents: data.documents ?? [],
    businessEvents: [
      { id: `ev-${id}-1`, label: "Recebível cadastrado", date: new Date().toISOString(), completed: true },
      { id: `ev-${id}-2`, label: "Documentos enviados", date: "", completed: false },
      { id: `ev-${id}-3`, label: "Análise iniciada", date: "", completed: false },
      { id: `ev-${id}-4`, label: "Score calculado", date: "", completed: false },
      { id: `ev-${id}-5`, label: "Aprovado para o fundo", date: "", completed: false },
      { id: `ev-${id}-6`, label: "Financiamento confirmado", date: "", completed: false },
      { id: `ev-${id}-7`, label: "Pagamento registrado", date: "", completed: false },
      { id: `ev-${id}-8`, label: "Operação liquidada", date: "", completed: false },
    ],
    internalTransactionIds: [],
    description: data.description ?? "",
    debtorEmail: data.debtorEmail ?? "",
    debtorConfirmed: false,
  };
  return newReceivable;
}

export async function updateReceivableStatus(id: string, status: ReceivableStatus): Promise<void> {
  await sleep(400);
  const receivable = MOCK_RECEIVABLES.find((r) => r.id === id);
  if (receivable) {
    receivable.status = status;
  }
}

export async function confirmDebtorAwareness(receivableId: string): Promise<void> {
  await sleep(500);
  const receivable = MOCK_RECEIVABLES.find((r) => r.id === receivableId);
  if (receivable) {
    receivable.debtorConfirmed = true;
  }
}
