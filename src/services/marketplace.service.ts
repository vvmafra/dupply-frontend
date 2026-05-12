import { sleep } from "@/lib/utils";
import { MOCK_RECEIVABLES } from "@/data/receivables.mock";
import type { Receivable } from "@/domain/receivables/receivable.types";

export async function fetchMarketplaceOpportunities(): Promise<Receivable[]> {
  await sleep(400);
  return MOCK_RECEIVABLES.filter((r) => r.status === "LISTED" || r.status === "FUNDED");
}

export async function fetchOpportunityById(id: string): Promise<Receivable | null> {
  await sleep(300);
  return MOCK_RECEIVABLES.find((r) => r.id === id) ?? null;
}
