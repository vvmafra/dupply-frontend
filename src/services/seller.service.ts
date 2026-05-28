import { sleep } from "@/lib/utils";
import { apiRequest, ApiError } from "@/lib/api-client";
import { resolveApiMode } from "@/lib/env";
import { getAccessToken } from "@/lib/token-storage";
import { getSellerProfileIdFromToken } from "@/domain/auth/auth-jwt";
import { mapSellerDtoToCompany } from "@/domain/seller/seller-profile.mapper";
import {
  SellerProfileError,
  type SellerProfileErrorCode,
} from "@/domain/seller/seller-profile.errors";
import { MOCK_SELLERS } from "@/data/users.mock";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type {
  SellerErrorBodyDTO,
  SellerPublicViewDTO,
  SellerStatusDTO,
  UpdateSellerMetadataRequestDTO,
} from "./seller.dto";

const SELLER_ERROR_MESSAGES: Record<string, string> = {
  seller_not_found: "Não encontramos seu cadastro de vendedor.",
  forbidden: "Você não tem permissão para acessar este cadastro.",
  metadata_locked: "Seu cadastro não pode mais ser editado — ele já foi enviado para análise.",
  incomplete_metadata: "Complete todos os dados obrigatórios antes de enviar para análise.",
  invalid_status_for_submit: "Seu cadastro já foi enviado ou não está elegível para envio.",
  invalid_status_transition: "Esta operação não é permitida no status atual do cadastro.",
  validation_error: "Verifique os dados informados e tente novamente.",
  unauthorized: "Sua sessão expirou. Faça login novamente.",
};

async function fetchCurrentSellerMock(): Promise<SellerCompany> {
  await sleep(300);
  return { ...MOCK_SELLERS[0] };
}

async function updateSellerValidationStatusMock(
  sellerId: string,
  updates: Partial<SellerCompany>,
): Promise<void> {
  await sleep(400);
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) Object.assign(seller, updates);
}

function resolveSellerIdFromSession(): string {
  const token = getAccessToken();
  if (!token) {
    throw new SellerProfileError("missing_session", "Sua sessão expirou. Faça login novamente.");
  }

  const profileId = getSellerProfileIdFromToken(token);
  if (!profileId) {
    throw new SellerProfileError(
      "missing_seller_profile",
      "Não foi possível identificar seu perfil de vendedor.",
    );
  }

  return profileId;
}

function mapBackendErrorCode(code: string | undefined): SellerProfileErrorCode {
  switch (code) {
    case "seller_not_found":
      return "seller_not_found";
    case "forbidden":
      return "forbidden";
    case "metadata_locked":
      return "metadata_locked";
    case "incomplete_metadata":
      return "incomplete_metadata";
    case "invalid_status_for_submit":
      return "invalid_status_for_submit";
    case "invalid_status_transition":
      return "invalid_status_transition";
    case "validation_error":
      return "validation_error";
    case "unauthorized":
      return "missing_session";
    default:
      return "unknown";
  }
}

export function mapSellerApiError(error: unknown): SellerProfileError {
  if (error instanceof SellerProfileError) return error;

  if (error instanceof ApiError) {
    const body = error.body as SellerErrorBodyDTO | undefined;
    const backendCode = body?.error;
    const mappedCode = mapBackendErrorCode(backendCode);
    const message =
      (backendCode && SELLER_ERROR_MESSAGES[backendCode]) ??
      "Não foi possível atualizar seu cadastro. Tente novamente.";
    return new SellerProfileError(mappedCode, message);
  }

  return new SellerProfileError("network", "Não foi possível conectar. Tente novamente.");
}

export async function fetchCurrentSeller(): Promise<SellerCompany> {
  if (resolveApiMode() === "mock") return fetchCurrentSellerMock();

  try {
    const sellerId = resolveSellerIdFromSession();
    const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
    return mapSellerDtoToCompany(dto);
  } catch (error) {
    throw mapSellerApiError(error);
  }
}

export async function fetchCurrentSellerWithStatus(): Promise<{
  seller: SellerCompany;
  status: SellerStatusDTO;
}> {
  if (resolveApiMode() === "mock") {
    throw new SellerProfileError("unknown", "fetchCurrentSellerWithStatus is HTTP-only.");
  }

  try {
    const sellerId = resolveSellerIdFromSession();
    const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
    return { seller: mapSellerDtoToCompany(dto), status: dto.status };
  } catch (error) {
    throw mapSellerApiError(error);
  }
}

export async function updateSellerMetadata(
  sellerId: string,
  patch: UpdateSellerMetadataRequestDTO,
): Promise<SellerCompany> {
  if (resolveApiMode() === "mock") {
    throw new Error("updateSellerMetadata is HTTP-only; use updateSellerValidationStatus in mock mode");
  }

  try {
    const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`, {
      method: "PATCH",
      body: patch,
    });
    return mapSellerDtoToCompany(dto);
  } catch (error) {
    throw mapSellerApiError(error);
  }
}

export async function submitSellerForReview(sellerId: string): Promise<void> {
  if (resolveApiMode() === "mock") {
    await updateSellerValidationStatusMock(sellerId, {
      validationStatus: "UNDER_REVIEW",
      kycStatus: "APPROVED",
    });
    return;
  }

  try {
    await apiRequest<void>(`/v1/sellers/${sellerId}/submit`, { method: "POST" });
  } catch (error) {
    throw mapSellerApiError(error);
  }
}

export async function updateSellerValidationStatus(
  sellerId: string,
  updates: Partial<SellerCompany>,
): Promise<void> {
  if (resolveApiMode() === "mock") {
    return updateSellerValidationStatusMock(sellerId, updates);
  }

  if (updates.validationStatus === "UNDER_REVIEW") {
    await submitSellerForReview(sellerId);
    return;
  }

  throw new SellerProfileError("unknown", "Operação não suportada neste modo.");
}

export async function approveAnalystDuplicatasAccess(sellerId: string): Promise<void> {
  await sleep(350);
  const seller = MOCK_SELLERS.find((s) => s.id === sellerId);
  if (seller) {
    seller.analystDuplicatasAccess = "APPROVED";
  }
}
