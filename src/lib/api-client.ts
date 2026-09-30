import { env } from "@/lib/env";
import { clearAuthStorage, getAccessToken } from "@/lib/token-storage";

export class ApiError extends Error {
  readonly status: number;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** `error` code from a backend error body (`{ error: "investment_below_minimum" }`), if any. */
export function getApiErrorCode(bodyOrError: unknown): string | undefined {
  const body = bodyOrError instanceof ApiError ? bodyOrError.body : bodyOrError;
  if (typeof body === "object" && body !== null && "error" in body) {
    const code = (body as { error: unknown }).error;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  /** Attach Bearer token (default true). */
  auth?: boolean;
};

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

/**
 * REST client — used when VITE_USE_MOCKS=false.
 * Services keep mock implementations until endpoints are ready.
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  if (!env.apiBaseUrl) {
    throw new ApiError("VITE_API_BASE_URL is not configured", 0);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.apiTimeoutMs);

  try {
    const response = await fetch(`${env.apiBaseUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as unknown) : undefined;

    if (response.status === 401) {
      if (auth) {
        clearAuthStorage();
        onUnauthorized?.();
      }
      throw new ApiError("Unauthorized", 401, parsed);
    }

    if (!response.ok) {
      // Backend errors are `{ error: "<code>" }`; a few carry `message` too.
      const message =
        typeof parsed === "object" && parsed !== null && "message" in parsed
          ? String((parsed as { message: unknown }).message)
          : getApiErrorCode(parsed) ?? response.statusText;
      throw new ApiError(message || `HTTP ${response.status}`, response.status, parsed);
    }

    return parsed as T;
  } finally {
    clearTimeout(timeout);
  }
}
