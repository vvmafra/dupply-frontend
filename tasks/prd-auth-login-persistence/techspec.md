# Tech Spec — Auth Login & Session Persistence

## Overview

This spec implements functional login against the Dupply backend (or mock adapter), session persistence across page reloads, silent token refresh via the HttpOnly `dupply_rt` cookie, consistent route guards, and profile selection aligned with backend roles. Mock mode (`VITE_USE_MOCKS=true`) remains the default with no regression to the current demo flow.

**In scope:** service-layer auth I/O, token/snapshot storage, `AuthContext` bootstrap, guards, login/profile UI wiring, global 401 handling.

**Out of scope:** OAuth/SSO, wallet auth, HTTP integration for duplicatas/seller flows, multi-tab refresh coordination, automated tests, backend changes, server-side profile sync (`PATCH`).

**Implementation status (2026-05-26):** Domain layer, token snapshot, login (mock + partial HTTP), context bootstrap, guards, login/profile UI, and 401 handler are **done**. Remaining work: `credentials: "include"` on auth routes, `refreshAccessToken()`, HTTP logout, refresh-on-restore, optional `GET /v1/accounts/me` hydration (see [integration-spec.md](./integration-spec.md)).

Reference: [prd.md](./prd.md) · [integration-spec.md](./integration-spec.md)

---

## Architecture overview

```
UI (pages/ + components/auth/)
  └── consumes AuthContext + auth.service.login()
Services (services/auth.service.ts + auth.dto.ts)
  └── resolveApiMode() → mock impl | apiRequest() with credentials on /v1/auth/*
Domain (domain/auth/*)
  └── types, Zod schema, JWT decode, role mappers, profile helpers — no React, no I/O
Lib (lib/)
  └── api-client (Bearer + credentials + 401 handler)
  └── token-storage (access token + auth snapshot in sessionStorage)
  └── env (resolveApiMode), routes (ROUTES constants)
Context (contexts/AuthContext.tsx)
  └── AuthState single source of truth; bootstrap via restoreSession()
Guards (routes/guards.tsx)
  └── ProtectedRoute, GuestRoute, SemiProtectedRoute
```

**Layer boundaries:**

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| Pages / components | `useAuth()`, `login()` from service, `ROUTES`, navigate | `fetch`, `apiRequest`, `sessionStorage` |
| AuthContext | State, bootstrap, delegate I/O to service | HTTP, JWT decode, role mapping |
| auth.service | Mock/HTTP orchestration, storage R/W, error mapping | JSX, hooks, navigate |
| domain/auth | Pure types, validation, mappers | React, api-client, storage |

---

## Component design

### 1. Domain layer (`src/domain/auth/`)

**Files:** `auth-session.types.ts`, `auth.types.ts`, `auth-login.schema.ts`, `auth-role.mapper.ts`, `auth-jwt.ts`, `auth-profiles.ts`, `auth.helpers.ts`

**Status:** Implemented.

Provides `AuthSession`, `PersistedAuthSnapshot`, `SessionUser`, Zod login validation (PT messages), JWT decode/expiry, platform role → profile mapping, and profile auto-select helpers.

**FR coverage:** FR-1 (schema), FR-17/FR-18/FR-19 (profiles), FR-21 (payer block), FR-25 (JWT fallback).

```ts
// auth-login.schema.ts — FR-1
export const authLoginSchema = z.object({
  email: z.string().trim().min(1, "Informe um e-mail válido").email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
});
```

```ts
// auth-role.mapper.ts — FR-21
export function assertLoginAllowed(role: string): void {
  if (role === "payer") throw new PayerPersonaUnavailableError();
  mapPlatformRoleToProfiles(role);
}
```

---

### 2. Token storage (`src/lib/token-storage.ts`)

**Status:** Implemented.

| Key | Content |
|-----|---------|
| `dupply_access_token` | JWT access token |
| `dupply_auth_snapshot` | JSON `PersistedAuthSnapshot` |

`clearAuthStorage()` clears both — used on logout, failed refresh, and 401.

**FR coverage:** FR-4, FR-10, FR-11, FR-20.

---

### 3. API client (`src/lib/api-client.ts`)

**Status:** Partial — 401 handler wired; **`credentials` option pending**.

**Changes required:**

```ts
export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  credentials?: RequestCredentials; // NEW
};

// In fetch call:
const response = await fetch(url, {
  method,
  headers,
  body: body !== undefined ? JSON.stringify(body) : undefined,
  credentials: options.credentials, // NEW — pass through
  signal: controller.signal,
});
```

**401 flow (target — FR-9, FR-22):**

```ts
if (response.status === 401 && auth) {
  const refreshed = await trySilentRefresh(); // delegates to auth.service.refreshAccessToken()
  if (refreshed) {
    // retry original request once with new token
  }
  clearAuthStorage();
  onUnauthorized?.();
  throw new ApiError("Unauthorized", 401, parsed);
}
```

Alternative (simpler MVP): keep 401 → clear + handler; rely on `restoreSession()` refresh at boot only. Full in-flight refresh can follow in a later iteration if needed.

**FR coverage:** FR-23, FR-24, FR-22.

---

### 4. Auth service (`src/services/auth.service.ts` + `auth.dto.ts`)

**Status:** Partial — login mock/HTTP done; refresh and HTTP logout pending.

**Create `src/services/auth.dto.ts`:** extract `AuthTokenResponseDTO`, `AccountResponseDTO`, `AuthErrorBodyDTO` from inline types.

**`login()` — done, needs `credentials: "include"`:**

```ts
const response = await apiRequest<AuthTokenResponseDTO>("/v1/auth/login", {
  method: "POST",
  auth: false,
  credentials: "include", // ADD — FR-3, FR-23
  body: { email, password },
});
```

**`refreshAccessToken()` — to implement (FR-9):**

```ts
async function refreshAccessToken(): Promise<AuthSession | null> {
  const snapshot = getAuthSnapshot();
  if (!snapshot) return null;

  try {
    const response = await apiRequest<AuthTokenResponseDTO>("/v1/auth/refresh", {
      method: "POST",
      auth: false,
      credentials: "include",
    });
    setAccessToken(response.accessToken);
    return buildSessionFromLogin(snapshot.email, response.accessToken, response.expiresInSeconds);
  } catch {
    clearAuthStorage();
    return null;
  }
}
```

**`restoreSession()` — update HTTP branch (FR-7, FR-9, FR-10):**

Current behavior clears session when access token is expired. Target: call `refreshAccessToken()` before clearing.

```ts
// Replace expired-token clear with:
if (!payload || isTokenExpired(payload)) {
  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    clearAuthStorage();
    return null;
  }
  return { session: refreshed, selectedProfile: snapshot.selectedProfile };
}
```

**`logout()` — add HTTP branch (FR-11):**

```ts
export async function logout(): Promise<void> {
  if (resolveApiMode() === "http") {
    try {
      await apiRequest<void>("/v1/auth/logout", {
        method: "POST",
        auth: false,
        credentials: "include",
      });
    } catch { /* best-effort */ }
  }
  clearAuthStorage();
  restorePromise = null;
}
```

**`hydrateUserFromApi()` — optional P3 (FR-25):**

Internal helper; called after login/restore when enabled. Falls back to JWT decode + snapshot on failure.

**FR coverage:** FR-2–FR-6, FR-7, FR-9–FR-11, FR-20, FR-23–FR-25.

---

### 5. AuthContext (`src/contexts/AuthContext.tsx`)

**Status:** Implemented.

```tsx
const guestState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  selectedProfile: null,
};

// Mount: restoreSession() → set authenticated or isLoading: false
// loginWithSession(session, selectedProfile?) — called by login form after service success
// logout({ reason? }) — delegates to service + resets state; toast on "expired"
// setProfile(profile) — updates state + persistSelectedProfile()
```

401 handler registered via `setUnauthorizedHandler` — no navigate in provider; guards handle redirect.

**FR coverage:** FR-7, FR-8, FR-11, FR-22.

---

### 6. Route guards (`src/routes/guards.tsx`)

**Status:** Implemented.

```tsx
// ProtectedRoute — FR-12, FR-14, FR-15
if (isLoading) return <AuthBootstrapFallback />;
if (!isAuthenticated) return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
if (!selectedProfile) return <Navigate to={ROUTES.selectProfile} state={{ from: location }} replace />;
if (profile && selectedProfile !== profile) return <Navigate to={ROUTES.selectProfile} ... />;

// GuestRoute — FR-13
if (isAuthenticated) {
  const target = redirectTo ?? (selectedProfile ? getProfileRedirect(selectedProfile) : ROUTES.selectProfile);
  return <Navigate to={target} replace />;
}

// SemiProtectedRoute — profile selection (authenticated, profile optional)
```

**FR coverage:** FR-8, FR-12–FR-15.

---

### 7. Login form (`src/components/auth/MockLoginForm.tsx`)

**Status:** Implemented.

Flow:
1. Validate with `authLoginSchema` (FR-1).
2. Call `login()` from service (FR-2 mock / FR-3 HTTP).
3. On failure: `toast.error(result.message)` — no auth state mutation (FR-5, FR-6).
4. On success: `loginWithSession(session)`.
5. Auto-select profile when single option (FR-18); else navigate to `ROUTES.selectProfile`.
6. Preserve `location.state.from` for post-login return (FR-12).

**FR coverage:** FR-1–FR-6, FR-12, FR-18.

---

### 8. Select profile page (`src/pages/SelectProfilePage.tsx`)

**Status:** Implemented.

- Mock mode: three demo cards (`MOCK_DEMO_PROFILES`) — FR-19.
- HTTP mode: `getAvailableProfiles(user.platformRole)` — FR-17.
- Auto-skip single profile via `useEffect` — FR-18.
- `setProfile` persists to snapshot — FR-20.
- Deep-link return via `location.state.from` after selection.

**FR coverage:** FR-14, FR-17–FR-20.

---

### 9. App routing (`src/App.tsx`)

**Status:** Mostly done — guards use `ROUTES.*`; some legacy redirect paths remain as literals.

Guest/login/profile routes wrapped with `GuestRoute` / `SemiProtectedRoute` / `ProtectedRoute`. Persona dashboards use `ProtectedRoute profile="..."`.

**Remaining (FR-16):** migrate literal paths to `ROUTES` where missing:

| Literal | Target |
|---------|--------|
| `/confirmation/:id` | `ROUTES.confirmation(id)` (param route — acceptable pattern) |
| `/seller/receivables/*` | legacy redirects — keep or add to ROUTES |
| `/analyst/sellers/:sellerId` | add `ROUTES.analyst.sellers.detail(id)` |
| `/analyst/duplicatas/:id` | already has `ROUTES.analyst.duplicatas.detail(id)` — use it |
| `/admin/sellers/:sellerId` | add `ROUTES.admin.sellers.detail(id)` |

**FR coverage:** FR-16.

---

### 10. Auth bootstrap fallback (`src/components/auth/AuthBootstrapFallback.tsx`)

**Status:** Implemented — spinner shown while `isLoading === true` (FR-8).

---

### 11. Header logout (`src/components/layout/Header.tsx`)

**Status:** Implemented — calls `logout({ reason: "manual" })`.

After T11, this triggers server-side session invalidation.

**FR coverage:** FR-11.

---

## Data flow

```
User submits login form
  → authLoginSchema.safeParse (domain)
  → auth.service.login(email, password)
      → mock: sleep + snapshot (no HTTP)
      → http: POST /v1/auth/login (credentials: include)
          → setAccessToken + setAuthSnapshot
          → buildSessionFromLogin (JWT decode)
  → AuthContext.loginWithSession(session)
  → auto-select profile OR navigate to select-profile
  → setProfile → persistSelectedProfile (sessionStorage)

Page reload (F5)
  → AuthProvider mount → restoreSession()
      → mock: read snapshot
      → http: read token + snapshot
          → if expired → refreshAccessToken() [T11]
          → rebuild AuthSession
  → setState authenticated + selectedProfile from snapshot

Manual logout
  → AuthContext.logout({ reason: "manual" })
  → auth.service.logout()
      → POST /v1/auth/logout (best-effort) [T11]
      → clearAuthStorage()
  → guest state

API 401 (authenticated request)
  → api-client: try refresh [optional] → clearAuthStorage → onUnauthorized
  → AuthContext.logout({ reason: "expired" }) + toast
  → GuestRoute/ProtectedRoute redirect to login
```

---

## Files changed

| File | Change type | Status |
|------|-------------|--------|
| `src/domain/auth/auth-session.types.ts` | Added | Done |
| `src/domain/auth/auth-login.schema.ts` | Added | Done |
| `src/domain/auth/auth-role.mapper.ts` | Added | Done |
| `src/domain/auth/auth-jwt.ts` | Added | Done |
| `src/domain/auth/auth-profiles.ts` | Added | Done |
| `src/domain/auth/auth.types.ts` | Modified | Done |
| `src/lib/token-storage.ts` | Modified | Done |
| `src/lib/api-client.ts` | Modified | Partial — add `credentials`, optional refresh-on-401 |
| `src/lib/env.ts` | Existing | Done (resolveApiMode) |
| `src/services/auth.dto.ts` | Added | Pending |
| `src/services/auth.service.ts` | Modified | Partial — add refresh, HTTP logout, credentials |
| `src/contexts/AuthContext.tsx` | Modified | Done |
| `src/routes/guards.tsx` | Added | Done |
| `src/components/auth/AuthBootstrapFallback.tsx` | Added | Done |
| `src/components/auth/MockLoginForm.tsx` | Modified | Done |
| `src/pages/LoginPage.tsx` | Modified | Done |
| `src/pages/SelectProfilePage.tsx` | Modified | Done |
| `src/App.tsx` | Modified | Mostly done — literal path cleanup optional |
| `src/lib/routes.ts` | Modified | Optional — add missing detail routes |

---

## Impact analysis

- **Auth/navigation:** Guards now wait for `isLoading` before redirecting — eliminates login flash. Deep-link `state.from` preserved through login and profile selection. Remaining T11 work enables session survival when access token expires but refresh cookie is valid.
- **Other personas:** Cross-cutting — seller, admin, and risk analyst all use the same auth infrastructure. HTTP mode filters profiles by role; mock mode unchanged.
- **Service adapter:** `resolveApiMode()` gate is correct. Mock remains default. HTTP requires `VITE_API_BASE_URL` + backend CORS with credentials.
- **TypeScript:** No `any` introduced. DTO types in `auth.dto.ts` keep transport separate from domain. `npm run typecheck` must pass with zero errors.

---

## Functional requirements traceability

| FR | Requirement | Addressed in |
|----|-------------|--------------|
| FR-1 | Login validation PT | `auth-login.schema.ts`, `MockLoginForm` |
| FR-2 | Mock login unchanged | `mockLoginImpl` |
| FR-3 | HTTP login + cookie | `httpLoginImpl` + `credentials: "include"` (T11) |
| FR-4 | Persist token + snapshot; no refresh in JS | `token-storage`, login success path |
| FR-5 | Login failure no state mutation | `LoginResult` + form handler |
| FR-6 | Error mapping PT | `mapHttpLoginError` |
| FR-7 | Restore on boot | `AuthContext` useEffect + `restoreSession` |
| FR-8 | Loading state during restore | `isLoading`, `AuthBootstrapFallback` |
| FR-9 | Silent refresh on expired access | `refreshAccessToken` (T11) |
| FR-10 | Silent restore failure → guest | `restoreSession` catch/clear paths |
| FR-11 | HTTP logout best-effort | `logout()` (T11) |
| FR-12 | Protected redirect + return URL | `ProtectedRoute`, form/profile navigate |
| FR-13 | Authenticated away from login | `GuestRoute` |
| FR-14 | No profile → select profile | `ProtectedRoute` |
| FR-15 | Wrong profile → select profile | `ProtectedRoute` |
| FR-16 | ROUTES constants | `App.tsx`, guards, helpers — partial cleanup |
| FR-17 | HTTP profile filter by role | `SelectProfilePage`, `getAvailableProfiles` |
| FR-18 | Auto-select single profile | `MockLoginForm`, `SelectProfilePage` |
| FR-19 | Mock three cards | `MOCK_DEMO_PROFILES` |
| FR-20 | Profile persists reload | `persistSelectedProfile` |
| FR-21 | Payer blocked at login | `assertLoginAllowed` |
| FR-22 | 401 after failed refresh → logout | `api-client` + `AuthContext` handler |
| FR-23 | Auth routes credentials include | `api-client` + auth service (T11) |
| FR-24 | Bearer on authenticated calls | `api-client` default `auth: true` |
| FR-25 | accounts/me hydration optional | `hydrateUserFromApi` (P3) |

---

## Test strategy

_(No automated test runner — manual verification + typecheck gate.)_

### Manual — Mock mode (default)

| Step | Expected result |
|------|-----------------|
| `VITE_USE_MOCKS=true`, open `/login` | Demo credentials pre-filled |
| Submit login | Three profile cards shown |
| Select seller → F5 | Still authenticated with seller profile |
| Logout → F5 | Guest state |

### Manual — HTTP mode

| Step | Expected result |
|------|-----------------|
| `.env.local`: `VITE_USE_MOCKS=false`, `VITE_API_BASE_URL=http://localhost:8080` | Dev server restarted |
| Login `seller@dupply.dev.local` | Login OK, auto-select seller or single card |
| Login `risk@dupply.dev.local` | Only risk analyst card |
| Login payer account | PT error — persona unavailable |
| Wrong password | "E-mail ou senha incorretos" — no auth state change |
| Login → F5 | Session + profile restored |
| Wait for access expiry (or force expired JWT in storage) → F5 | Silent refresh restores session (after T11) |
| Logout | Server cookie cleared; F5 stays guest |
| Visit `/seller/duplicatas` logged out → login → select profile | Return to original URL |

### Manual — Guards & loading

| Step | Expected result |
|------|-----------------|
| Reload with valid session | Brief spinner, no flash redirect to login |
| Expired session + no cookie | Silent guest, no error toast |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| Deep-link return after auto-selected profile? | **Yes** — `MockLoginForm` and `SelectProfilePage` both honor `location.state.from` after profile is resolved |
| `PATCH /users/me/profile` needed in P0.2? | **No for MVP** — local snapshot persistence is sufficient; adapter can be added later without changing public API |
| Session-expired toast on every 401? | **Only on 401 handler path** — `logout({ reason: "expired" })` shows toast; silent restore failure does not |
| Prefer `GET /v1/accounts/me` in MVP? | **Defer to P3 (T9)** — JWT decode + snapshot email acceptable for MVP; endpoint documented and ready |
