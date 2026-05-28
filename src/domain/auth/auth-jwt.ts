import type { AuthSession } from "./auth-session.types";

type JwtPayload = {
  sub: string;
  role: string;
  profileId?: string;
  exp?: number;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = decodeBase64Url(parts[1]!);
    const parsed = JSON.parse(decoded) as JwtPayload;

    if (!parsed.sub || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSellerProfileIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.role !== "seller" || !payload.profileId) return null;
  return payload.profileId;
}

export function isTokenExpired(payload: JwtPayload): boolean {
  if (payload.exp === undefined) return true;
  return payload.exp * 1000 <= Date.now();
}

export function buildSessionFromLogin(email: string, accessToken: string): AuthSession {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    throw new Error("Invalid token");
  }

  return {
    user: {
      id: payload.sub,
      email,
      name: email.split("@")[0] ?? email,
      platformRole: payload.role,
    },
  };
}
