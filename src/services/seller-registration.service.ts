import { apiRequest, ApiError } from "@/lib/api-client";
import { env } from "@/lib/env";
import { getAccessToken } from "@/lib/token-storage";
import { getSellerProfileIdFromToken } from "@/domain/auth/auth-jwt";
import type { AuthSession } from "@/domain/auth/auth-session.types";
import {
  mapFormToCompanyPatch,
  mapFormToRelationsPatch,
  mapFormToRepresentativePatch,
  mapSellerDtoToRegistrationForm,
  resolveRegistrationWizardStepIndex,
} from "@/domain/seller/seller-registration.mapper";
import { SellerRegistrationBlockedError } from "@/domain/seller/seller-registration.routing";
import { SellerProfileError } from "@/domain/seller/seller-profile.errors";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type {
  SellerRegistrationAccessValues,
  SellerRegistrationFormValues,
} from "@/domain/seller/seller-registration.schema";
import {
  mapTokenResponseToSession,
  persistAuthSession,
} from "./auth-session.persistence";
import type { RegisterErrorBodyDTO, RegisterSellerResponseDTO } from "./seller-registration.dto";
import type { SellerPublicViewDTO, SellerStatusDTO, UpdateSellerMetadataRequestDTO } from "./seller.dto";
import {
  mapSellerApiError,
  submitSellerForReview,
  updateSellerMetadata,
} from "./seller.service";

export class SellerRegistrationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SellerRegistrationError";
    this.code = code;
  }
}

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  email_already_exists: "Este e-mail já está cadastrado.",
  validation_error: "Verifique os dados informados e tente novamente.",
  network: "Não foi possível conectar. Tente novamente.",
};

type MetadataStepId = "company" | "representative" | "relations";

function assertRegistrationApiConfigured(): void {
  if (!env.apiBaseUrl) {
    throw new SellerRegistrationError("network", REGISTER_ERROR_MESSAGES.network);
  }
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

function mapRegisterError(error: unknown): SellerRegistrationError {
  if (error instanceof SellerRegistrationError) return error;

  if (error instanceof ApiError) {
    const body = error.body as RegisterErrorBodyDTO | undefined;
    const code = body?.error ?? "unknown";

    if (code === "validation_error") {
      return new SellerRegistrationError(
        code,
        body?.message ?? REGISTER_ERROR_MESSAGES.validation_error,
      );
    }

    const message = REGISTER_ERROR_MESSAGES[code] ?? REGISTER_ERROR_MESSAGES.validation_error;
    return new SellerRegistrationError(code, message);
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new SellerRegistrationError("network", REGISTER_ERROR_MESSAGES.network);
  }

  if (error instanceof TypeError) {
    return new SellerRegistrationError("network", REGISTER_ERROR_MESSAGES.network);
  }

  return new SellerRegistrationError(
    "unknown",
    "Não foi possível concluir o cadastro. Tente novamente.",
  );
}

function mapStepToPatch(
  stepId: MetadataStepId,
  values: SellerRegistrationFormValues,
): UpdateSellerMetadataRequestDTO {
  switch (stepId) {
    case "company":
      return mapFormToCompanyPatch(values);
    case "representative":
      return mapFormToRepresentativePatch(values);
    case "relations":
      return mapFormToRelationsPatch(values);
  }
}

async function fetchSellerPublicView(sellerId: string): Promise<SellerPublicViewDTO> {
  try {
    return await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
  } catch (error) {
    throw mapSellerApiError(error);
  }
}

export async function registerSellerAccess(
  payload: SellerRegistrationAccessValues,
): Promise<{ sellerId: string; session: AuthSession }> {
  assertRegistrationApiConfigured();

  try {
    const response = await apiRequest<RegisterSellerResponseDTO>("/v1/auth/register", {
      method: "POST",
      auth: false,
      credentials: "include",
      body: {
        email: payload.email.trim(),
        password: payload.password,
        name: payload.responsibleName.trim(),
        role: "seller",
      },
    });

    const session = mapTokenResponseToSession(payload.email.trim(), response);
    persistAuthSession(response.accessToken, session);

    return { sellerId: response.sellerId, session };
  } catch (error) {
    throw mapRegisterError(error);
  }
}

export async function saveSellerRegistrationStep(
  stepId: MetadataStepId,
  sellerId: string,
  values: SellerRegistrationFormValues,
): Promise<SellerCompany> {
  assertRegistrationApiConfigured();

  const patch = mapStepToPatch(stepId, values);
  return updateSellerMetadata(sellerId, patch);
}

export async function finishSellerRegistration(sellerId: string): Promise<void> {
  assertRegistrationApiConfigured();
  await submitSellerForReview(sellerId);
}

export async function loadSellerRegistrationState(): Promise<{
  status: SellerStatusDTO;
  sellerId: string;
  formValues: SellerRegistrationFormValues;
  stepIndex: number;
}> {
  assertRegistrationApiConfigured();

  const sellerId = resolveSellerIdFromSession();
  const dto = await fetchSellerPublicView(sellerId);

  if (dto.status === "inactive") {
    throw new SellerRegistrationBlockedError();
  }

  return {
    status: dto.status,
    sellerId,
    formValues: mapSellerDtoToRegistrationForm(dto),
    stepIndex: resolveRegistrationWizardStepIndex(dto),
  };
}

export async function fetchSellerBackendStatus(): Promise<SellerStatusDTO> {
  assertRegistrationApiConfigured();

  const sellerId = resolveSellerIdFromSession();
  const dto = await fetchSellerPublicView(sellerId);
  return dto.status;
}

export function mapRegistrationError(error: unknown): string {
  if (error instanceof SellerRegistrationError) return error.message;
  if (error instanceof SellerProfileError) return error.message;
  if (error instanceof SellerRegistrationBlockedError) return error.message;
  return "Não foi possível concluir o cadastro. Tente novamente.";
}