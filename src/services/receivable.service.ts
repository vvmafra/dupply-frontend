import { apiRequest, ApiError } from "@/lib/api-client";
import { env } from "@/lib/env";
import { calcProposedValueFromDiscount } from "@/domain/receivable/receivable-antecipacao.helpers";
import {
  ReceivableError,
  RECEIVABLE_ERROR_MESSAGES,
  type ReceivableErrorCode,
} from "@/domain/receivable/receivable.errors";
import {
  mapFormToCreateBody,
  mapFormToUpdateBody,
  mapReceivableRowToDetail,
  mapReceivableRowToListItem,
} from "@/domain/receivable/receivable.mapper";
import type { ReceivableDraftValues } from "@/domain/receivable/receivable.schema";
import type {
  ReceivableDetail,
  ReceivableFormValues,
  ReceivableListItem,
} from "@/domain/receivable/receivable.types";
import type {
  CreateReceivableRequestDTO,
  ReceivableErrorBodyDTO,
  ReceivableRowDTO,
  UpdateReceivableRequestDTO,
} from "@/services/receivable.dto";

function assertReceivableApiConfigured(): void {
  if (!env.apiBaseUrl) {
    throw new ReceivableError("network", RECEIVABLE_ERROR_MESSAGES.network);
  }
}

function mapBackendErrorCode(code: string | undefined): ReceivableErrorCode {
  if (code && code in RECEIVABLE_ERROR_MESSAGES) {
    return code as ReceivableErrorCode;
  }

  return "unknown";
}

export function mapReceivableApiError(error: unknown): ReceivableError {
  if (error instanceof ReceivableError) return error;

  if (error instanceof ApiError) {
    const body = error.body as ReceivableErrorBodyDTO | undefined;
    const backendCode = body?.error;
    const mappedCode = mapBackendErrorCode(backendCode);
    const message =
      (backendCode && RECEIVABLE_ERROR_MESSAGES[backendCode]) ??
      "Não foi possível concluir a operação. Tente novamente.";
    return new ReceivableError(mappedCode, message);
  }

  return new ReceivableError("network", RECEIVABLE_ERROR_MESSAGES.network);
}

export async function fetchReceivables(): Promise<ReceivableListItem[]> {
  assertReceivableApiConfigured();

  try {
    const { receivables } = await apiRequest<{ receivables: ReceivableRowDTO[] }>(
      "/v1/receivables",
    );
    return receivables.map(mapReceivableRowToListItem);
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

export async function fetchReceivableById(id: string): Promise<ReceivableDetail> {
  assertReceivableApiConfigured();

  try {
    const { receivable } = await apiRequest<{ receivable: ReceivableRowDTO }>(
      `/v1/receivables/${id}`,
    );
    return mapReceivableRowToDetail(receivable);
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

type ReceivableFormInput = ReceivableFormValues | ReceivableDraftValues;

function isReceivableFormInput(
  body: CreateReceivableRequestDTO | ReceivableFormInput,
): body is ReceivableFormInput {
  return "faceValue" in body;
}

function isUpdateReceivableRequestDTO(
  body: UpdateReceivableRequestDTO | ReceivableFormInput,
): body is UpdateReceivableRequestDTO {
  return "receivableMetaData" in body || "value" in body;
}

export async function createReceivableDraft(
  body: CreateReceivableRequestDTO | ReceivableFormInput,
): Promise<string> {
  assertReceivableApiConfigured();

  const payload = isReceivableFormInput(body) ? mapFormToCreateBody(body) : body;

  try {
    const { id } = await apiRequest<{ id: string }>("/v1/receivables", {
      method: "POST",
      body: payload,
    });
    return id;
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

export async function updateReceivableDraft(
  id: string,
  body: UpdateReceivableRequestDTO | ReceivableFormInput,
): Promise<void> {
  assertReceivableApiConfigured();

  const payload = isUpdateReceivableRequestDTO(body)
    ? body
    : mapFormToUpdateBody(body);

  try {
    await apiRequest(`/v1/receivables/${id}`, {
      method: "PATCH",
      body: payload,
    });
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

export async function submitReceivableForReview(id: string): Promise<void> {
  assertReceivableApiConfigured();

  try {
    await apiRequest(`/v1/receivables/${id}/submit`, { method: "POST" });
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

export async function createAndSubmitReceivable(
  body: CreateReceivableRequestDTO | ReceivableFormInput,
): Promise<{ id: string; status: "under_review" }> {
  assertReceivableApiConfigured();

  const payload = isReceivableFormInput(body) ? mapFormToCreateBody(body) : body;

  try {
    return await apiRequest<{ id: string; status: "under_review" }>(
      "/v1/receivables/submit",
      { method: "POST", body: payload },
    );
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

export async function submitRiskOffer(id: string, discountPercent: number): Promise<void> {
  assertReceivableApiConfigured();

  try {
    const { receivable } = await apiRequest<{ receivable: ReceivableRowDTO }>(
      `/v1/receivables/${id}`,
    );
    const proposedValue = calcProposedValueFromDiscount(receivable.value, discountPercent);

    await apiRequest(`/v1/receivables/${id}/risk-decision`, {
      method: "POST",
      body: { decision: "offer", proposedValue },
    });
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

export async function submitRiskReprove(id: string): Promise<void> {
  assertReceivableApiConfigured();

  try {
    await apiRequest(`/v1/receivables/${id}/risk-decision`, {
      method: "POST",
      body: { decision: "reprove" },
    });
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}

export async function submitSellerDecision(
  id: string,
  decision: "accept" | "reject",
): Promise<void> {
  assertReceivableApiConfigured();

  try {
    await apiRequest(`/v1/receivables/${id}/seller-decision`, {
      method: "POST",
      body: { decision },
    });
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}
