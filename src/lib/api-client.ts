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

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  /** Attach Bearer token (default true). */
  auth?: boolean;
  /** Pass through to fetch (e.g. "include" for /v1/auth/* cookie flows). */
  credentials?: RequestCredentials;
};

type UnauthorizedHandler = () => void;
type RefreshAccessTokenHandler = () => Promise<boolean>;

let onUnauthorized: UnauthorizedHandler | null = null;
let onRefreshAccessToken: RefreshAccessTokenHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  onUnauthorized = handler;
}

export function setRefreshAccessTokenHandler(handler: RefreshAccessTokenHandler | null): void {
  onRefreshAccessToken = handler;
}

/**
 * REST client — used when VITE_USE_MOCKS=false.
 * Services keep mock implementations until endpoints are ready.
 */
function buildAuthHeaders(body: unknown | undefined, auth: boolean): Record<string, string> {
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

  return headers;
}

async function fetchApiResponse(
  url: string,
  method: HttpMethod,
  headers: Record<string, string>,
  body: unknown | undefined,
  credentials: RequestCredentials | undefined,
  signal: AbortSignal,
): Promise<{ response: Response; parsed: unknown }> {
  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials,
    signal,
  });

  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as unknown) : undefined;

  return { response, parsed };
}

function throwHttpError(status: number, statusText: string, parsed: unknown): never {
  const message =
    typeof parsed === "object" && parsed !== null && "message" in parsed
      ? String((parsed as { message: unknown }).message)
      : statusText;
  throw new ApiError(message || `HTTP ${status}`, status, parsed);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  if (!env.apiBaseUrl) {
    throw new ApiError("VITE_API_BASE_URL is not configured", 0);
  }

  const url = `${env.apiBaseUrl.replace(/\/$/, "")}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.apiTimeoutMs);

  try {
    let { response, parsed } = await fetchApiResponse(
      url,
      method,
      buildAuthHeaders(body, auth),
      body,
      options.credentials,
      controller.signal,
    );

    if (response.status === 401 && auth) {
      const refreshed = (await onRefreshAccessToken?.()) ?? false;

      if (refreshed) {
        ({ response, parsed } = await fetchApiResponse(
          url,
          method,
          buildAuthHeaders(body, auth),
          body,
          options.credentials,
          controller.signal,
        ));

        if (response.ok) {
          return parsed as T;
        }

        if (response.status !== 401) {
          throwHttpError(response.status, response.statusText, parsed);
        }
      }

      clearAuthStorage();
      onUnauthorized?.();
      throw new ApiError("Unauthorized", 401, parsed);
    }

    if (response.status === 401) {
      throw new ApiError("Unauthorized", 401, parsed);
    }

    if (!response.ok) {
      throwHttpError(response.status, response.statusText, parsed);
    }

    return parsed as T;
  } finally {
    clearTimeout(timeout);
  }
}
