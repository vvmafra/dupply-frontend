import { sleep } from "@/lib/utils";
import { MOCK_TRANSACTIONS } from "@/domain/blockchain/blockchain.mock";
import type { BlockchainTransaction } from "@/domain/blockchain/blockchain.types";

export async function fetchTransactions(): Promise<BlockchainTransaction[]> {
  await sleep(400);
  return [...MOCK_TRANSACTIONS];
}

export async function fetchTransactionById(id: string): Promise<BlockchainTransaction | null> {
  await sleep(300);
  return MOCK_TRANSACTIONS.find((t) => t.id === id) ?? null;
}
