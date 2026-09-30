import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import { apiRequest } from "@/lib/api-client";
import { resolveApiMode } from "@/lib/env";
import { createMockCollection } from "@/lib/mock-store";
import { getCurrentProfileId } from "@/services/auth.service";
import { mapBackendSellerToCompany, type BackendSeller } from "@/services/mappers/backend-seller.mapper";
import type { SellerCompany } from "@/domain/seller/seller.types";

/**
 * `MOCK_SELLERS` is imported (and mutated in place) by several mock services.
 * This collection mirrors it to storage so validation / access changes made
 * during a demo survive F5. Call `hydrate()` before reading, `persist()` after writing.
 */
export const sellersCollection = createMockCollection("sellers", MOCK_SELLERS, (s) => s.id);

export async function fetchCurrentSeller(): Promise<SellerCompany> {
  if (resolveApiMode() === "http") {
    // The JWT carries the seller id as `profileId`; the backend has no `/sellers/me`.
    const sellerId = getCurrentProfileId();
    if (!sellerId) throw new Error("Sessão sem perfil de cedente.");
    const seller = await apiRequest<BackendSeller>(`/v1/sellers/${sellerId}`);
    return mapBackendSellerToCompany(seller);
  }

  await sleep(300);
  sellersCollection.hydrate();
  return { ...MOCK_SELLERS[0] };
}

export async function updateSellerValidationStatus(
  sellerId: string,
  updates: Partial<SellerCompany>
): Promise<void> {
  if (resolveApiMode() === "http") {
    // KYC is simulated in the UI; the backend's seller status is driven by the admin review.
    return;
  }

  await sleep(400);
  sellersCollection.hydrate();
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    Object.assign(seller, updates);
    sellersCollection.persist();
  }
}

export async function approveAnalystDuplicatasAccess(sellerId: string): Promise<void> {
  if (resolveApiMode() === "http") {
    // Backend: an `active` seller can already submit receivables — nothing to flip.
    return;
  }

  await sleep(350);
  sellersCollection.hydrate();
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.analystDuplicatasAccess = "APPROVED";
    sellersCollection.persist();
  }
}
