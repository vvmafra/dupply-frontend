# Task 3.0: Complete auth service HTTP session lifecycle

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Finish the HTTP branch of `auth.service.ts`: add `credentials: "include"` on login, implement `refreshAccessToken()`, update `restoreSession()` to attempt silent refresh before clearing storage, and call `POST /v1/auth/logout` on manual logout. Corresponds to techspec Component design §4 and integration-spec migration Phases C–D.

Depends on: 1, 2

## Requirements

- FR-3: HTTP login calls `POST /v1/auth/login` with `credentials: "include"`
- FR-4: Persist access token + snapshot on success; never read/store refresh token in JS
- FR-5: Login failure must not mutate authenticated state (verify unchanged)
- FR-7: App startup restores persisted session via updated `restoreSession()`
- FR-9: When access token is expired, attempt `POST /v1/auth/refresh` with `credentials: "include"` before clearing
- FR-10: Silent restore failure clears storage and returns guest state (no toast)
- FR-11: Manual logout calls `POST /v1/auth/logout` best-effort, then clears local storage
- FR-20: Restored session preserves `selectedProfile` from snapshot
- FR-23: All `/v1/auth/*` calls use `credentials: "include"` and `auth: false`

## Subtasks

- [ ] 3.1 Read `integration-spec.md` adapter sections for `login`, `refreshAccessToken`, `restoreSession`, `logout`
- [ ] 3.2 Add `credentials: "include"` to `httpLoginImpl` login request
- [ ] 3.3 Implement internal `refreshAccessToken()` using snapshot email + refresh endpoint
- [ ] 3.4 Update HTTP branch of `restoreSessionImpl()` to refresh when token missing/expired
- [ ] 3.5 Update `logout()` with HTTP best-effort server call before `clearAuthStorage()`
- [ ] 3.6 Export `refreshAccessToken` (or register handler) for Task 4 — avoid circular imports with `api-client`
- [ ] 3.7 Verify mock mode unchanged (`VITE_USE_MOCKS=true`)
- [ ] 3.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → Adapter pattern** and **techspec.md → Component design §4**.

**Login** — add credentials (currently missing):

```ts
const response = await apiRequest<AuthTokenResponseDTO>("/v1/auth/login", {
  method: "POST",
  auth: false,
  credentials: "include",
  body: { email, password },
});
```

**refreshAccessToken()** — mock mode returns `null`; HTTP calls `/v1/auth/refresh`:

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
    return buildSessionFromLogin(snapshot.email, response.accessToken, response.expiresInSeconds);
  } catch {
    clearAuthStorage();
    return null;
  }
}
```

**restoreSession() HTTP branch** — replace immediate clear on expired token:

```ts
if (!session) {
  session = await refreshAccessToken();
  if (!session) return null;
}
```

**logout()**:

```ts
if (resolveApiMode() === "http") {
  try {
    await apiRequest<void>("/v1/auth/logout", { method: "POST", auth: false, credentials: "include" });
  } catch { /* best-effort */ }
}
clearAuthStorage();
restorePromise = null;
```

Use `mapTokenResponseToSession` helper from integration-spec if it improves clarity. Re-run `assertLoginAllowed` after restore.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] HTTP login sends `credentials: "include"` (cookie received when backend + CORS configured)
- [ ] Expired access token + valid refresh cookie restores session on F5 (manual HTTP test)
- [ ] Failed refresh on restore clears storage silently (no toast)
- [ ] HTTP logout calls server endpoint then clears local storage
- [ ] Mock mode login/restore/logout behavior unchanged
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-auth-login-persistence/prd.md` ← read first
- `tasks/prd-auth-login-persistence/techspec.md` ← read first
- `tasks/prd-auth-login-persistence/integration-spec.md` ← read first
- `src/services/auth.dto.ts` ← read (from Task 1)
- `src/services/auth.service.ts` ← modify
- `src/lib/api-client.ts` ← read (Task 2)
- `src/lib/token-storage.ts` ← read
