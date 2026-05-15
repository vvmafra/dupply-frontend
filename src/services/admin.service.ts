import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import { MOCK_RECEIVABLES } from "@/data/receivables.mock";
import { PLATFORM_METRICS } from "@/data/dashboard.mock";
import type { PlatformMetrics } from "@/domain/admin/admin.types";
import type { ReceivableStatus } from "@/domain/receivables/receivable.types";

export async function fetchPlatformMetrics(): Promise<PlatformMetrics> {
  await sleep(300);
  return { ...PLATFORM_METRICS };
}

export async function fetchAllSellers() {
  await sleep(300);
  return [...MOCK_SELLERS];
}

export async function fetchAllReceivables() {
  await sleep(300);
  return [...MOCK_RECEIVABLES];
}

export async function adminUpdateReceivableStatus(id: string, status: ReceivableStatus): Promise<void> {
  await sleep(400);
  const receivable = MOCK_RECEIVABLES.find((r) => r.id === id);
  if (receivable) {
    receivable.status = status;
  }
}

export async function adminApproveValidation(sellerId: string): Promise<void> {
  await sleep(400);
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.validationStatus = "APPROVED";
    seller.kycStatus = "APPROVED";
    seller.documentsProgress = 100;
    if (seller.analystDuplicatasAccess === "PENDING") {
      seller.analystDuplicatasAccess = "UNDER_REVIEW";
    }
  }
}

export async function adminRejectValidation(sellerId: string): Promise<void> {
  await sleep(400);
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.validationStatus = "REJECTED";
    seller.analystDuplicatasAccess = "REJECTED";
  }
}
