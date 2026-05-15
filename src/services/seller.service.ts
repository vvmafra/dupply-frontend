import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import type { SellerCompany } from "@/domain/seller/seller.types";

export async function fetchCurrentSeller(): Promise<SellerCompany> {
  await sleep(300);
  return { ...MOCK_SELLERS[0] };
}

export async function updateSellerValidationStatus(
  sellerId: string,
  updates: Partial<SellerCompany>
): Promise<void> {
  await sleep(400);
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) Object.assign(seller, updates);
}

export async function approveAnalystDuplicatasAccess(sellerId: string): Promise<void> {
  await sleep(350);
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.analystDuplicatasAccess = "APPROVED";
  }
}
