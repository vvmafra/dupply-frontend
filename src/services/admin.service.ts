import { sleep } from "@/lib/utils";
import { MOCK_SELLERS } from "@/data/users.mock";
import { MOCK_RECEIVABLES } from "@/data/receivables.mock";
import { PLATFORM_METRICS } from "@/data/dashboard.mock";
import { apiRequest } from "@/lib/api-client";
import { describeApiError } from "@/lib/api-errors";
import { resolveApiMode } from "@/lib/env";
import { sellersCollection } from "@/services/seller.service";
import { fetchAllDuplicatas } from "@/services/duplicata.service";
import { mapBackendSellerToCompany, type BackendSeller } from "@/services/mappers/backend-seller.mapper";
import type { PlatformMetrics } from "@/domain/admin/admin.types";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import type { ReceivableStatus } from "@/domain/receivables/receivable.types";
import type { SellerCompany } from "@/domain/seller/seller.types";

/** Platform metrics derived from the live receivables + sellers (HTTP mode). */
function buildMetrics(duplicatas: DuplicataTitulo[], sellers: SellerCompany[]): PlatformMetrics {
  const byStage = (stages: string[]) =>
    duplicatas.filter((d) => stages.includes(d.statusRecebivel ?? "")).length;
  const sum = (items: DuplicataTitulo[], pick: (d: DuplicataTitulo) => number) =>
    items.reduce((total, d) => total + pick(d), 0);

  return {
    totalCompanies: sellers.filter((s) => s.validationStatus === "APPROVED").length,
    sellersInValidation: sellers.filter((s) => s.validationStatus === "UNDER_REVIEW").length,
    kycApproved: sellers.filter((s) => s.kycStatus === "APPROVED").length,
    documentsPending: sellers.filter((s) => s.validationStatus === "DOCUMENTS_PENDING").length,
    receivablesRegistered: duplicatas.length,
    receivablesUnderReview: byStage(["under_review", "offer"]),
    receivablesApproved: byStage(["confirmed", "funding"]),
    receivablesFunded: byStage(["funded", "processing", "completed"]),
    receivablesSettled: byStage(["payer_settled"]),
    receivablesDefaulted: byStage(["overdue"]),
    totalVolume: sum(duplicatas, (d) => d.valor),
    fundedVolume: sum(duplicatas, (d) => d.funded ?? 0),
  };
}

export async function fetchPlatformMetrics(): Promise<PlatformMetrics> {
  if (resolveApiMode() === "http") {
    const [duplicatas, sellers] = await Promise.all([fetchAllDuplicatas(), fetchAllSellers()]);
    return buildMetrics(duplicatas, sellers);
  }

  await sleep(300);
  return { ...PLATFORM_METRICS };
}

export async function fetchAllSellers(): Promise<SellerCompany[]> {
  if (resolveApiMode() === "http") {
    const sellers = await apiRequest<BackendSeller[]>("/v1/sellers");
    return sellers.map(mapBackendSellerToCompany);
  }

  await sleep(300);
  sellersCollection.hydrate();
  return [...MOCK_SELLERS];
}

/** Legacy admin receivables (mock dataset). In HTTP mode the admin page lists duplicatas instead. */
export async function fetchAllReceivables() {
  await sleep(300);
  return [...MOCK_RECEIVABLES];
}

export async function adminUpdateReceivableStatus(id: string, status: ReceivableStatus): Promise<void> {
  if (resolveApiMode() === "http") {
    throw new Error("Com o backend, use Abrir captação / Avançar etapa na tela da oferta.");
  }

  await sleep(400);
  const receivable = MOCK_RECEIVABLES.find((r) => r.id === id);
  if (receivable) {
    receivable.status = status;
  }
}

async function patchSellerStatus(sellerId: string, status: "active" | "inactive"): Promise<void> {
  try {
    await apiRequest(`/v1/sellers/${sellerId}/status`, { method: "PATCH", body: { status } });
  } catch (err) {
    throw new Error(describeApiError(err, "Não foi possível atualizar o cadastro do cedente."));
  }
}

export async function adminApproveValidation(sellerId: string): Promise<void> {
  if (resolveApiMode() === "http") {
    await patchSellerStatus(sellerId, "active");
    return;
  }

  await sleep(400);
  sellersCollection.hydrate();
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.validationStatus = "APPROVED";
    seller.kycStatus = "APPROVED";
    seller.documentsProgress = 100;
    if (seller.analystDuplicatasAccess === "PENDING") {
      seller.analystDuplicatasAccess = "UNDER_REVIEW";
    }
    sellersCollection.persist();
  }
}

export async function adminRejectValidation(sellerId: string): Promise<void> {
  if (resolveApiMode() === "http") {
    await patchSellerStatus(sellerId, "inactive");
    return;
  }

  await sleep(400);
  sellersCollection.hydrate();
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.validationStatus = "REJECTED";
    seller.analystDuplicatasAccess = "REJECTED";
    sellersCollection.persist();
  }
}
