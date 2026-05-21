import { env } from "@/lib/env";
import { clearAccessToken, getAccessToken } from "@/lib/token-storage";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  /** Attach Bearer token (default true). */
  auth?: boolean;
};

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

    if (response.status === 401) {
      clearAccessToken();
      throw new ApiError("Unauthorized", 401);
    }

    const text = await response.text();
    const parsed = text ? (JSON.parse(text) as unknown) : undefined;

    if (!response.ok) {
      const message =
        typeof parsed === "object" && parsed !== null && "message" in parsed
          ? String((parsed as { message: unknown }).message)
          : response.statusText;
      throw new ApiError(message || `HTTP ${response.status}`, response.status, parsed);
    }

    return parsed as T;
  } finally {
    clearTimeout(timeout);
  }
}
