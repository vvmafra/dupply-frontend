/**
 * Centralized Vite env — mock-first until REST API is ready.
 *
 * Switch to HTTP: copy `.env.example` → `.env.local`, set
 * `VITE_USE_MOCKS=false` and `VITE_API_BASE_URL`. See
 * `.specs/features/api-integration/design.md` § Switch mock → HTTP.
 */
export const env = {
  /** Default true; set VITE_USE_MOCKS=false to enable HTTP services. */
  useMocks: import.meta.env.VITE_USE_MOCKS !== "false",
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "",
  apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30_000),
} as const;

export type ApiMode = "mock" | "http";

let missingBaseUrlWarned = false;

/** True when HTTP mode is fully configured (mocks off + base URL set). */
export function isApiConfigured(): boolean {
  return !env.useMocks && env.apiBaseUrl.length > 0;
}

/**
 * Runtime mode for service adapters.
 * Falls back to mock with a one-time console warning if mocks are off but URL is missing.
 */
export function resolveApiMode(): ApiMode {
  if (env.useMocks) return "mock";
  if (!env.apiBaseUrl) {
    if (!missingBaseUrlWarned) {
      console.warn(
        "[dupply] VITE_USE_MOCKS=false but VITE_API_BASE_URL is empty — using mocks.",
      );
      missingBaseUrlWarned = true;
    }
    return "mock";
  }
  return "http";
}
