import { sleep } from "@/lib/utils";
import { apiRequest, ApiError, setRefreshAccessTokenHandler } from "@/lib/api-client";
import { resolveApiMode } from "@/lib/env";
import {
  clearAuthStorage,
  getAccessToken,
  getAuthSnapshot,
  setAccessToken,
  setAuthSnapshot,
} from "@/lib/token-storage";
import {
  buildAuthSnapshot,
  mapTokenResponseToSession,
} from "./auth-session.persistence";
import type {
  AuthSession,
  PersistedAuthSnapshot,
  RestoredSession,
  SessionUser,
} from "@/domain/auth/auth-session.types";
import {
  assertLoginAllowed,
  PayerPersonaUnavailableError,
  ProfileNotAvailableError,
} from "@/domain/auth/auth-role.mapper";
import {
  decodeJwtPayload,
  isTokenExpired,
} from "@/domain/auth/auth-jwt";
import type { UserProfile } from "@/domain/auth/auth.types";
import type { AccountResponseDTO, AuthErrorBodyDTO, AuthTokenResponseDTO } from "./auth.dto";

type LoginErrorCode =
  | "invalid_credentials"
  | "account_inactive"
  | "validation_error"
  | "payer_unavailable"
  | "network"
  | "unknown";

type LoginResult =
  | { ok: true; session: AuthSession }
  | { ok: false; code: LoginErrorCode; message: string };

let restorePromise: Promise<RestoredSession | null> | null = null;
let restoreBlockReason: "account_inactive" | null = null;

export function takeRestoreBlockReason(): "account_inactive" | null {
  const reason = restoreBlockReason;
  restoreBlockReason = null;
  return reason;
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

function mapAccountDtoToSessionUser(dto: AccountResponseDTO): SessionUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.email.split("@")[0] ?? dto.email,
    platformRole: dto.role,
  };
}

type HydratedAccount = {
  user: SessionUser;
  status: AccountResponseDTO["status"];
};

async function hydrateAccountFromApi(): Promise<HydratedAccount | null> {
  if (resolveApiMode() === "mock") return null;

  try {
    const dto = await apiRequest<AccountResponseDTO>("/v1/accounts/me");
    return { user: mapAccountDtoToSessionUser(dto), status: dto.status };
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<AuthSession | null> {
  if (resolveApiMode() === "mock") return null;

  const snapshot = getAuthSnapshot();
  if (!snapshot) return null;

  try {
    const response = await apiRequest<AuthTokenResponseDTO>("/v1/auth/refresh", {
      method: "POST",
      auth: false,
      credentials: "include",
    });

    setAccessToken(response.accessToken);
    return mapTokenResponseToSession(snapshot.email, response);
  } catch {
    clearAuthStorage();
    return null;
  }
}

setRefreshAccessTokenHandler(async () => {
  const session = await refreshAccessToken();
  return session !== null;
});

async function mockLoginImpl(email: string, _password: string): Promise<LoginResult> {
  await sleep(800);

  if (!email.trim()) {
    return {
      ok: false,
      code: "validation_error",
      message: "Informe um e-mail válido",
    };
  }

  const session: AuthSession = {
    user: {
      id: "user-demo",
      email: email.trim(),
      name: email.trim().split("@")[0] ?? email.trim(),
      platformRole: "seller",
    },
  };

  setAuthSnapshot(buildAuthSnapshot(session));

  return {
    ok: true,
    session,
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
    const body = error.body as AuthErrorBodyDTO | undefined;
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
    const response = await apiRequest<AuthTokenResponseDTO>("/v1/auth/login", {
      method: "POST",
      auth: false,
      credentials: "include",
      body: { email, password },
    });

    const session = mapTokenResponseToSession(email, response);
    assertLoginAllowed(session.user.platformRole);

    setAccessToken(response.accessToken);

    const hydrated = await hydrateAccountFromApi();
    if (hydrated) {
      if (hydrated.status === "inactive") {
        clearAuthStorage();
        return {
          ok: false,
          code: "account_inactive",
          message: "Sua conta está inativa. Entre em contato com o suporte.",
        };
      }
      session.user = hydrated.user;
    }

    setAuthSnapshot(buildAuthSnapshot(session));

    return {
      ok: true,
      session,
    };
  } catch (error) {
    return mapHttpLoginError(error);
  }
}

async function restoreSessionImpl(): Promise<RestoredSession | null> {
  restoreBlockReason = null;
  const mode = resolveApiMode();

  if (mode === "mock") {
    const snapshot = getAuthSnapshot();
    if (!snapshot) return null;

    return {
      session: sessionFromSnapshot(snapshot),
      selectedProfile: snapshot.selectedProfile,
    };
  }

  const snapshot = getAuthSnapshot();
  if (!snapshot) {
    clearAuthStorage();
    return null;
  }

  const token = getAccessToken();
  let session: AuthSession | null = null;

  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && !isTokenExpired(payload)) {
      session = sessionFromSnapshot(snapshot);
    }
  }

  if (!session) {
    session = await refreshAccessToken();
    if (!session) return null;
  }

  try {
    assertLoginAllowed(session.user.platformRole);
  } catch {
    clearAuthStorage();
    return null;
  }

  const hydrated = await hydrateAccountFromApi();
  if (hydrated) {
    if (hydrated.status === "inactive") {
      restoreBlockReason = "account_inactive";
      clearAuthStorage();
      return null;
    }
    session.user = hydrated.user;
  }

  return {
    session,
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
  if (resolveApiMode() === "http") {
    try {
      await apiRequest<void>("/v1/auth/logout", {
        method: "POST",
        auth: false,
        credentials: "include",
      });
    } catch {
      // best-effort — always clear local state
    }
  }

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
