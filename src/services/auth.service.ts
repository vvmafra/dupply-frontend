import { sleep } from "@/lib/utils";
import { apiRequest, ApiError } from "@/lib/api-client";
import { resolveApiMode } from "@/lib/env";
import {
  clearAuthStorage,
  getAccessToken,
  getAuthSnapshot,
  setAccessToken,
  setAuthSnapshot,
} from "@/lib/token-storage";
import type { AuthSession, PersistedAuthSnapshot, RestoredSession } from "@/domain/auth/auth-session.types";
import {
  assertLoginAllowed,
  PayerPersonaUnavailableError,
  ProfileNotAvailableError,
} from "@/domain/auth/auth-role.mapper";
import { buildSessionFromLogin, decodeJwtPayload, isTokenExpired } from "@/domain/auth/auth-jwt";
import { getAvailableProfiles, shouldAutoSelectProfile } from "@/domain/auth/auth-profiles";
import type { UserProfile } from "@/domain/auth/auth.types";

export type LoginErrorCode =
  | "invalid_credentials"
  | "account_inactive"
  | "validation_error"
  | "payer_unavailable"
  | "network"
  | "unknown";

export type LoginResult =
  | { ok: true; session: AuthSession; redirectHint: "selectProfile" | "dashboard" }
  | { ok: false; code: LoginErrorCode; message: string };

type LoginResponseDto = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
};

type ErrorBody = {
  error?: string;
  message?: string;
};

let restorePromise: Promise<RestoredSession | null> | null = null;

function buildSnapshot(
  session: AuthSession,
  selectedProfile: UserProfile | null = null,
): PersistedAuthSnapshot {
  return {
    userId: session.user.id,
    email: session.user.email,
    platformRole: session.user.platformRole,
    selectedProfile,
  };
}

function buildRedirectHint(session: AuthSession): "selectProfile" | "dashboard" {
  const profiles = getAvailableProfiles(session.user.platformRole);
  return shouldAutoSelectProfile(profiles) ? "dashboard" : "selectProfile";
}

function sessionFromSnapshot(snapshot: PersistedAuthSnapshot): AuthSession {
  return {
    user: {
      id: snapshot.userId,
      email: snapshot.email,
      name: snapshot.email.split("@")[0] ?? snapshot.email,
      platformRole: snapshot.platformRole,
    },
  };
}

async function mockLoginImpl(email: string, _password: string): Promise<LoginResult> {
  await sleep(800);

  if (!email.trim()) {
    return {
      ok: false,
      code: "validation_error",
      message: "Informe um e-mail válido",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const platformRole = normalizedEmail.startsWith("investor@")
    ? "investor"
    : normalizedEmail.startsWith("admin@")
      ? "admin"
      : normalizedEmail.startsWith("risk@") || normalizedEmail.startsWith("analyst@")
        ? "risk_analyst"
        : "seller";

  const session: AuthSession = {
    user: {
      // Single mock user id so portfolio seeds show for demo@ (profile switch)
      // and investor@ login alike.
      id: "user-demo",
      email: email.trim(),
      name: email.trim().split("@")[0] ?? email.trim(),
      platformRole,
    },
  };

  setAuthSnapshot(buildSnapshot(session));

  return {
    ok: true,
    session,
    redirectHint: "selectProfile",
  };
}

function mapHttpLoginError(error: unknown): LoginResult {
  if (error instanceof PayerPersonaUnavailableError) {
    return { ok: false, code: "payer_unavailable", message: error.message };
  }

  if (error instanceof ProfileNotAvailableError) {
    return { ok: false, code: "unknown", message: error.message };
  }

  if (error instanceof ApiError) {
    const body = error.body as ErrorBody | undefined;
    const errorCode = body?.error;

    if (error.status === 401 || errorCode === "invalid_credentials") {
      return {
        ok: false,
        code: "invalid_credentials",
        message: "E-mail ou senha incorretos",
      };
    }

    if (error.status === 403 || errorCode === "account_inactive") {
      return {
        ok: false,
        code: "account_inactive",
        message: "Sua conta está inativa. Entre em contato com o suporte.",
      };
    }

    if (error.status === 400 || errorCode === "validation_error") {
      return {
        ok: false,
        code: "validation_error",
        message: body?.message ?? error.message ?? "Dados de login inválidos",
      };
    }

    if (error.status === 503) {
      return {
        ok: false,
        code: "unknown",
        message: "Serviço temporariamente indisponível",
      };
    }

    if (error.status === 0) {
      return {
        ok: false,
        code: "network",
        message: "Não foi possível conectar. Tente novamente.",
      };
    }
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return {
      ok: false,
      code: "network",
      message: "Não foi possível conectar. Tente novamente.",
    };
  }

  if (error instanceof TypeError) {
    return {
      ok: false,
      code: "network",
      message: "Não foi possível conectar. Tente novamente.",
    };
  }

  return {
    ok: false,
    code: "unknown",
    message: "Não foi possível entrar. Tente novamente.",
  };
}

async function httpLoginImpl(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await apiRequest<LoginResponseDto>("/v1/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });

    const session = buildSessionFromLogin(email, response.accessToken, response.expiresInSeconds);
    assertLoginAllowed(session.user.platformRole);

    setAccessToken(response.accessToken);
    setAuthSnapshot(buildSnapshot(session));

    return {
      ok: true,
      session,
      redirectHint: buildRedirectHint(session),
    };
  } catch (error) {
    return mapHttpLoginError(error);
  }
}

async function restoreSessionImpl(): Promise<RestoredSession | null> {
  const mode = resolveApiMode();

  if (mode === "mock") {
    const snapshot = getAuthSnapshot();
    if (!snapshot) return null;

    return {
      session: sessionFromSnapshot(snapshot),
      selectedProfile: snapshot.selectedProfile,
    };
  }

  const token = getAccessToken();
  const snapshot = getAuthSnapshot();

  if (!token || !snapshot) {
    if (token || snapshot) {
      clearAuthStorage();
    }
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload || isTokenExpired(payload)) {
    clearAuthStorage();
    return null;
  }

  try {
    assertLoginAllowed(payload.role);
  } catch {
    clearAuthStorage();
    return null;
  }

  return {
    session: {
      user: {
        id: snapshot.userId,
        email: snapshot.email,
        name: snapshot.email.split("@")[0] ?? snapshot.email,
        platformRole: snapshot.platformRole,
      },
      accessToken: token,
      expiresAtMs: payload.exp ? payload.exp * 1000 : undefined,
    },
    selectedProfile: snapshot.selectedProfile,
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  if (resolveApiMode() === "mock") {
    return mockLoginImpl(email, password);
  }

  return httpLoginImpl(email, password);
}

export async function logout(): Promise<void> {
  clearAuthStorage();
  restorePromise = null;
}

export async function restoreSession(): Promise<RestoredSession | null> {
  if (!restorePromise) {
    restorePromise = restoreSessionImpl();
  }

  return restorePromise;
}

export async function persistSelectedProfile(profile: UserProfile): Promise<void> {
  const snapshot = getAuthSnapshot();
  if (!snapshot) return;

  setAuthSnapshot({
    ...snapshot,
    selectedProfile: profile,
  });
}
