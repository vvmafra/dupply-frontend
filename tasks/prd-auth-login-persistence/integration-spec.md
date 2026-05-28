# Integration Spec — Auth & Session

**Frontend service:** `src/services/auth.service.ts`  
**Backend base path:** `/v1/auth`, `/v1/accounts`  
**Status:** Confirmed  
**Last updated:** 2026-05-26

---

## Overview

The auth domain handles human login, silent token refresh, logout, and optional account hydration. Today the frontend has a **partial HTTP adapter**: `login()` calls `POST /v1/auth/login` when `resolveApiMode() === "http"`, persists the access token and session snapshot in `sessionStorage`, and restores sessions on boot. Mock mode remains the default (`VITE_USE_MOCKS=true`).

When HTTP is fully enabled, the remaining gaps are: `credentials: "include"` on all `/v1/auth/*` calls (so the browser stores/sends the `dupply_rt` HttpOnly cookie), silent refresh via `POST /v1/auth/refresh`, server-side logout via `POST /v1/auth/logout`, and optional hydration via `GET /v1/accounts/me`. The refresh token must **never** be read or stored in JavaScript-accessible storage.

---

## Endpoint map

| # | Method | Path | Auth | Request body | Response body | Frontend function |
|---|--------|------|------|-------------|---------------|-------------------|
| 1 | POST | `/v1/auth/login` | None (cookie set) | `{ email, password }` | `{ accessToken, tokenType, expiresInSeconds }` + `Set-Cookie: dupply_rt` | `login()` |
| 2 | POST | `/v1/auth/refresh` | Cookie `dupply_rt` | — | `{ accessToken, tokenType, expiresInSeconds }` + rotated cookie | `refreshAccessToken()` (internal) |
| 3 | POST | `/v1/auth/logout` | Cookie `dupply_rt` | — | `204` (cookie cleared) | `logout()` |
| 4 | GET | `/v1/accounts/me` | Bearer | — | `AccountResponseDTO` | `hydrateUserFromApi()` (internal, optional) |

**Out of scope for this spec:** `POST /v1/auth/register` (seller onboarding feature uses a separate flow).

---

## DTO definitions

Define transport types in `src/services/auth.dto.ts` (extract from inline types currently in `auth.service.ts`).

```ts
// Request DTOs
export type LoginRequestDTO = {
  email: string;
  password: string;
};

// Response DTOs — shared by login and refresh
export type AuthTokenResponseDTO = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
};

// Error body (non-2xx on auth routes)
export type AuthErrorBodyDTO = {
  error: string;
  message?: string;
};

// Account hydration (GET /v1/accounts/me)
export type AccountResponseDTO = {
  id: string;
  email: string;
  role: "seller" | "payer" | "risk_analyst" | "risk_analyst_agent" | "admin";
  status: "active" | "inactive";
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};
```

**Placement:** `src/services/auth.dto.ts`.

---

## DTO → Domain mapping

Auth responses do not map directly to domain types — the service builds `AuthSession` from the JWT payload and form email.

```ts
// src/services/auth.service.ts
import { buildSessionFromLogin } from "@/domain/auth/auth-jwt";
import type { AuthTokenResponseDTO } from "./auth.dto";
import type { AuthSession } from "@/domain/auth/auth-session.types";

function mapTokenResponseToSession(
  email: string,
  dto: AuthTokenResponseDTO,
): AuthSession {
  return buildSessionFromLogin(email, dto.accessToken, dto.expiresInSeconds);
}
```

Account hydration maps to `SessionUser` fields:

```ts
import type { AccountResponseDTO } from "./auth.dto";
import type { SessionUser } from "@/domain/auth/auth-session.types";

function mapAccountDtoToSessionUser(dto: AccountResponseDTO): SessionUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.email.split("@")[0] ?? dto.email, // until name field exists on API
    platformRole: dto.role,
  };
}
```

**Role mapping (backend → frontend profiles):** handled in `domain/auth/auth-role.mapper.ts`, not in DTO mapping.

| Backend `role` | Frontend `UserProfile` |
|----------------|------------------------|
| `seller` | `seller` |
| `admin` | `admin` |
| `risk_analyst`, `risk_analyst_agent` | `riskAnalyst` |
| `payer` | blocked at login (`PayerPersonaUnavailableError`) |

---

## Adapter pattern (per function)

### `login(email, password)`

**Current mock:**
```ts
export async function login(email: string, password: string): Promise<LoginResult> {
  if (resolveApiMode() === "mock") return mockLoginImpl(email, password);
  return httpLoginImpl(email, password);
}
```

**With HTTP adapter (target — add `credentials: "include"`):**
```ts
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
    setAuthSnapshot(buildSnapshot(session));

    return { ok: true, session, redirectHint: buildRedirectHint(session) };
  } catch (error) {
    return mapHttpLoginError(error);
  }
}
```

On failure: **do not** mutate storage (FR-5).

---

### `refreshAccessToken()` (internal)

**Current:** not implemented — expired access token clears session on restore.

**With HTTP adapter:**
```ts
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
    const session = mapTokenResponseToSession(snapshot.email, response);
    return session;
  } catch {
    clearAuthStorage();
    return null;
  }
}
```

No request body. Browser attaches `dupply_rt` cookie automatically when `credentials: "include"`.

---

### `restoreSession()`

**Current mock:** reads `dupply_auth_snapshot` only.

**Current HTTP:** reads token + snapshot; if token expired → clears storage (no refresh attempt yet).

**Target HTTP:**
```ts
async function restoreSessionImpl(): Promise<RestoredSession | null> {
  if (resolveApiMode() === "mock") {
    const snapshot = getAuthSnapshot();
    if (!snapshot) return null;
    return { session: sessionFromSnapshot(snapshot), selectedProfile: snapshot.selectedProfile };
  }

  const snapshot = getAuthSnapshot();
  if (!snapshot) {
    clearAuthStorage();
    return null;
  }

  let token = getAccessToken();
  let session: AuthSession | null = null;

  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && !isTokenExpired(payload)) {
      session = buildSessionFromSnapshot(token, snapshot, payload);
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

  // Optional P3: session.user = await hydrateUserFromApi() ?? session.user;
  return { session, selectedProfile: snapshot.selectedProfile };
}
```

Silent restore failure → guest state, no toast (FR-10).

---

### `logout()`

**Current:** `clearAuthStorage()` only.

**With HTTP adapter:**
```ts
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
```

No Bearer header required — backend identifies session via cookie.

---

### `hydrateUserFromApi()` (optional, P3)

**Current:** not implemented — JWT decode + snapshot email used instead.

**With HTTP adapter:**
```ts
async function hydrateUserFromApi(): Promise<SessionUser | null> {
  if (resolveApiMode() === "mock") return null;

  try {
    const dto = await apiRequest<AccountResponseDTO>("/v1/accounts/me");
    return mapAccountDtoToSessionUser(dto);
  } catch {
    return null; // fallback to JWT decode
  }
}
```

Call after successful login or restore when endpoint is enabled (FR-25).

---

### `persistSelectedProfile(profile)`

**Current:** updates `dupply_auth_snapshot.selectedProfile` in sessionStorage.

No HTTP call in MVP — local snapshot only. Future `PATCH /users/me/profile` adapter may be added without changing the public signature.

---

## Auth & error handling

### Credentials

| Route pattern | `credentials` | `auth` (Bearer) |
|---------------|---------------|-----------------|
| `/v1/auth/*` | `"include"` | `false` |
| `/v1/accounts/me` | default | `true` |
| All other authenticated routes | default | `true` |

Extend `ApiRequestOptions` in `src/lib/api-client.ts`:

```ts
export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  credentials?: RequestCredentials;
};
```

Pass `credentials` to `fetch()`. Default remains browser default (`"same-origin"`).

### Access token

- Stored in `sessionStorage` key `dupply_access_token` via `setAccessToken()`.
- Attached automatically by `apiRequest` when `auth: true`.

### Refresh token

- HttpOnly cookie `dupply_rt`, `Path=/v1/auth`, `SameSite=Lax`, `Secure` in production.
- **Never** read, write, or send explicitly from JavaScript.
- Managed exclusively by the browser via `credentials: "include"`.

### Login error mapping

| HTTP status / `error` code | `LoginErrorCode` | User message (PT) |
|----------------------------|------------------|-------------------|
| 401 / `invalid_credentials` | `invalid_credentials` | "E-mail ou senha incorretos" |
| 403 / `account_inactive`, `account_deleted` | `account_inactive` | "Sua conta está inativa. Entre em contato com o suporte." |
| 400 / Zod validation | `validation_error` | body message or generic |
| 503 / `JWT_SECRET not configured` | `unknown` | "Serviço temporariamente indisponível" |
| Network / timeout / abort | `network` | "Não foi possível conectar. Tente novamente." |
| JWT role `payer` (post-decode) | `payer_unavailable` | "Este tipo de acesso ainda não está disponível na plataforma." |

Services return `LoginResult` — pages show `toast.error(result.message)`; they do not catch `ApiError` directly for login.

### 401 on authenticated request (FR-22)

1. Attempt silent refresh once via `refreshAccessToken()` (when implemented in `api-client` or delegated to auth service).
2. If refresh fails: `clearAuthStorage()` + invoke `onUnauthorized` handler registered by `AuthProvider`.
3. Handler calls `logout({ reason: "expired" })` — optional toast "Sessão expirada".
4. Guards redirect to login on next render.

```ts
// AuthContext — already wired
setUnauthorizedHandler(() => {
  logoutRef.current({ reason: "expired" });
});
```

---

## Migration plan

| Phase | Action | Risk |
|-------|--------|------|
| A | Create `auth.dto.ts` with DTO types — extract inline types from `auth.service.ts` | None |
| B | Add `credentials` option to `api-client.ts`; pass `"include"` on auth routes | Low |
| C | Implement `refreshAccessToken()` + update `restoreSession()` to attempt refresh before clearing | Medium |
| D | Implement HTTP `logout()` with best-effort server call | Low |
| E | Wire 401 handler to attempt refresh before session clear | Medium |
| F | Enable HTTP in `.env.local` (`VITE_USE_MOCKS=false`, `VITE_API_BASE_URL=http://localhost:8080`) — test manually | Medium |
| G | (Optional P3) Add `hydrateUserFromApi()` via `GET /v1/accounts/me` | Low |
| H | Confirm + close open items | Low |

---

## Pages & components consuming this service

| File | Functions used | Notes |
|------|----------------|-------|
| `src/components/auth/MockLoginForm.tsx` | `login()` | Form submit; calls `loginWithSession` on success |
| `src/contexts/AuthContext.tsx` | `restoreSession()`, `logout()`, `persistSelectedProfile()` | Bootstrap on mount; exposes state to UI |
| `src/pages/SelectProfilePage.tsx` | — (via `useAuth().setProfile`) | Profile persistence delegated to context → service |
| `src/components/layout/Header.tsx` | — (via `useAuth().logout`) | Manual logout trigger |
| `src/routes/guards.tsx` | — (via `useAuth()`) | Reads `isAuthenticated`, `isLoading`, `selectedProfile` |

Pages and components **must not** call `apiRequest`, `fetch`, or `sessionStorage` directly.

---

## Open items

- [x] Confirm auth endpoint paths (`/v1/auth/login`, `/refresh`, `/logout`)
- [x] Confirm login/refresh response DTO shape (`accessToken`, `tokenType`, `expiresInSeconds`)
- [x] Confirm error shape for auth errors (`{ error: string }`)
- [x] Confirm account DTO shape for `GET /v1/accounts/me`
- [x] Refresh token — HttpOnly cookie `dupply_rt`; frontend uses `credentials: "include"`, no JS storage
- [x] CORS — backend uses `credentials: true` + `CORS_ALLOWED_ORIGINS` (e.g. `http://localhost:5173`)
- [ ] Implement `credentials: "include"` in `api-client.ts` and auth service calls (T11)
- [ ] Implement silent refresh in `restoreSession()` (T11)
- [ ] Implement HTTP logout (T11)
- [ ] Optional: prefer `GET /v1/accounts/me` over JWT decode (T9 / P3)
- [ ] `PATCH /users/me/profile` — TBD; not blocking MVP
