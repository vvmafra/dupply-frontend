import { apiRequest } from "@/lib/api-client";
import { resolveApiMode } from "@/lib/env";
import { getAccessToken } from "@/lib/token-storage";
import { getSellerProfileIdFromToken } from "@/domain/auth/auth-jwt";
import {
  WalletRegistrationError,
  mapWalletApiError,
} from "@/domain/wallet/wallet.errors";
import type {
  RegisterSellerWalletRequestDTO,
  WalletPublicViewDTO,
} from "./wallet.dto";

function resolveSellerIdFromSession(): string {
  const token = getAccessToken();
  if (!token) {
    throw new WalletRegistrationError("missing_session", "Sua sessão expirou. Faça login novamente.");
  }

  const profileId = getSellerProfileIdFromToken(token);
  if (!profileId) {
    throw new WalletRegistrationError(
      "missing_seller_profile",
      "Não foi possível identificar seu perfil de vendedor.",
    );
  }

  return profileId;
}

export async function registerSellerWallet(
  payload: RegisterSellerWalletRequestDTO,
): Promise<WalletPublicViewDTO> {
  if (resolveApiMode() !== "http") {
    throw new WalletRegistrationError("http_only", "Cadastro de carteira requer conexão com o servidor.");
  }

  const sellerId = resolveSellerIdFromSession();
  try {
    return await apiRequest<WalletPublicViewDTO>(`/v1/sellers/${sellerId}/wallet`, {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    throw mapWalletApiError(error);
  }
}

export async function fetchSellerWallet(): Promise<WalletPublicViewDTO> {
  if (resolveApiMode() !== "http") {
    throw new WalletRegistrationError("http_only", "Consulta de carteira requer conexão com o servidor.");
  }

  const sellerId = resolveSellerIdFromSession();
  try {
    return await apiRequest<WalletPublicViewDTO>(`/v1/sellers/${sellerId}/wallet`);
  } catch (error) {
    throw mapWalletApiError(error);
  }
}
