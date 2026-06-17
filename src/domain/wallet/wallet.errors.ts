import { ApiError } from "@/lib/api-client";

export type WalletRegistrationErrorCode =
  | "missing_session"
  | "missing_seller_profile"
  | "http_only"
  | "wallet_not_found"
  | "seller_not_found"
  | "forbidden"
  | "seller_not_active"
  | "wallet_already_exists"
  | "validation_error"
  | "invalid_wallet_status"
  | "network"
  | "server_error"
  | "unknown";

export type WalletErrorBody = {
  error?:
    | "wallet_not_found"
    | "seller_not_found"
    | "forbidden"
    | "seller_not_active"
    | "wallet_already_exists"
    | "validation_error"
    | "invalid_wallet_status"
    | "unauthorized";
};

export class WalletRegistrationError extends Error {
  readonly code: WalletRegistrationErrorCode;

  constructor(code: WalletRegistrationErrorCode, message: string) {
    super(message);
    this.name = "WalletRegistrationError";
    this.code = code;
  }
}

const WALLET_ERROR_MESSAGES: Record<string, string> = {
  seller_not_active: "Seu cadastro ainda não foi aprovado.",
  forbidden: "Você não tem permissão para esta operação.",
  seller_not_found: "Cadastro não encontrado.",
  wallet_not_found: "Carteira não encontrada.",
  wallet_already_exists: "Esta carteira já está vinculada à sua conta.",
  validation_error: "Dados da carteira inválidos. Tente novamente.",
  invalid_wallet_status: "Status da carteira inválido para esta operação.",
  unauthorized: "Sua sessão expirou. Faça login novamente.",
};

const RETRY_REGISTRATION_MESSAGE =
  "Carteira criada na rede, mas não vinculada. Tente novamente.";

function mapBackendErrorCode(code: string | undefined): WalletRegistrationErrorCode {
  switch (code) {
    case "wallet_not_found":
      return "wallet_not_found";
    case "seller_not_found":
      return "seller_not_found";
    case "forbidden":
      return "forbidden";
    case "seller_not_active":
      return "seller_not_active";
    case "wallet_already_exists":
      return "wallet_already_exists";
    case "validation_error":
      return "validation_error";
    case "invalid_wallet_status":
      return "invalid_wallet_status";
    case "unauthorized":
      return "missing_session";
    default:
      return "unknown";
  }
}

export function mapWalletApiError(error: unknown): WalletRegistrationError {
  if (error instanceof WalletRegistrationError) return error;

  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return new WalletRegistrationError("server_error", RETRY_REGISTRATION_MESSAGE);
    }

    const body = error.body as WalletErrorBody | undefined;
    const backendCode = body?.error;
    const mappedCode = mapBackendErrorCode(backendCode);
    const message =
      (backendCode && WALLET_ERROR_MESSAGES[backendCode]) ??
      "Não foi possível concluir o cadastro da carteira. Tente novamente.";
    return new WalletRegistrationError(mappedCode, message);
  }

  return new WalletRegistrationError("network", "Não foi possível conectar. Tente novamente.");
}
