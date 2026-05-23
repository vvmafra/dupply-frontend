import type { PersistedAuthSnapshot } from "@/domain/auth/auth-session.types";

const TOKEN_KEY = "dupply_access_token";
const SNAPSHOT_KEY = "dupply_auth_snapshot";

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getAuthSnapshot(): PersistedAuthSnapshot | null {
  const raw = sessionStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PersistedAuthSnapshot;
  } catch {
    return null;
  }
}

export function setAuthSnapshot(snapshot: PersistedAuthSnapshot): void {
  sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function clearAuthSnapshot(): void {
  sessionStorage.removeItem(SNAPSHOT_KEY);
}

export function clearAuthStorage(): void {
  clearAccessToken();
  clearAuthSnapshot();
}
