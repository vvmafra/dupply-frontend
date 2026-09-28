import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import { createMockCollection } from "@/lib/mock-store";
import type { SellerCompany } from "@/domain/seller/seller.types";

/**
 * `MOCK_SELLERS` is imported (and mutated in place) by several mock services.
 * This collection mirrors it to storage so validation / access changes made
 * during a demo survive F5. Call `hydrate()` before reading, `persist()` after writing.
 */
export const sellersCollection = createMockCollection("sellers", MOCK_SELLERS, (s) => s.id);

export async function fetchCurrentSeller(): Promise<SellerCompany> {
  await sleep(300);
  sellersCollection.hydrate();
  return { ...MOCK_SELLERS[0] };
}

export async function updateSellerValidationStatus(
  sellerId: string,
  updates: Partial<SellerCompany>
): Promise<void> {
  await sleep(400);
  sellersCollection.hydrate();
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    Object.assign(seller, updates);
    sellersCollection.persist();
  }
}

export async function approveAnalystDuplicatasAccess(sellerId: string): Promise<void> {
  await sleep(350);
  sellersCollection.hydrate();
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.analystDuplicatasAccess = "APPROVED";
    sellersCollection.persist();
  }
}
