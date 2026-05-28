# Task 4.0: Wire 401 handler to silent refresh

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Update `api-client.ts` so authenticated requests that receive 401 attempt one silent refresh via `refreshAccessToken()` before clearing session and invoking the unauthorized handler. `AuthContext` already registers `onUnauthorized` → `logout({ reason: "expired" })` with optional toast (migration Phase E).

Depends on: 3

## Requirements

- FR-9: Attempt silent refresh when access token expired during in-flight API calls
- FR-22: After refresh fails, clear session, log user out, redirect to login; show optional "Sessão expirada" toast via existing `AuthContext` handler
- FR-24: Retry original request once with new Bearer token after successful refresh
- Avoid circular imports: `api-client` must not import `auth.service` directly — use a registered handler pattern (mirror `setUnauthorizedHandler`)

## Subtasks

- [ ] 4.1 Read `api-client.ts` 401 block and `AuthContext.tsx` unauthorized handler wiring
- [ ] 4.2 Add `setRefreshAccessTokenHandler` (or equivalent) to `api-client.ts`
- [ ] 4.3 Register handler from `auth.service.ts` at module init (after Task 3 export)
- [ ] 4.4 On 401 + `auth: true`: call refresh handler → retry request once → on failure clear + `onUnauthorized`
- [ ] 4.5 Verify component renders correctly (manual browser check in HTTP mode)
- [ ] 4.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §3 API client (401 flow)** and **integration-spec.md → 401 on authenticated request**.

Target flow:

```ts
if (response.status === 401 && auth) {
  const refreshed = await onRefreshAccessToken?.();
  if (refreshed) {
    // retry original request once with new token from getAccessToken()
  }
  clearAuthStorage();
  onUnauthorized?.();
  throw new ApiError("Unauthorized", 401, parsed);
}
```

Register from auth service (no circular import):

```ts
// auth.service.ts — after refreshAccessToken is defined
import { setRefreshAccessTokenHandler } from "@/lib/api-client";
setRefreshAccessTokenHandler(async () => {
  const session = await refreshAccessToken();
  return session !== null;
});
```

Refresh handler should return `boolean` (success/failure). Do not show toast from api-client — `AuthContext` handles expired logout toast.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Authenticated API call with expired access token refreshes and succeeds (manual HTTP test)
- [ ] Refresh failure triggers session clear + expired logout path (toast optional per FR-22)
- [ ] Auth routes (`auth: false`) do not trigger refresh-on-401 loop
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-auth-login-persistence/prd.md` ← read first
- `tasks/prd-auth-login-persistence/techspec.md` ← read first
- `tasks/prd-auth-login-persistence/integration-spec.md` ← read first
- `src/lib/api-client.ts` ← modify
- `src/services/auth.service.ts` ← modify (register handler)
- `src/contexts/AuthContext.tsx` ← read (no changes expected)
