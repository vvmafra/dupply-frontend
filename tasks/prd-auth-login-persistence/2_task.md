# Task 2.0: Add credentials support to the API client

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Extend `ApiRequestOptions` in `src/lib/api-client.ts` with an optional `credentials` field and pass it through to `fetch()`. Auth routes require `credentials: "include"` so the browser stores and sends the HttpOnly `dupply_rt` refresh cookie (migration Phase B).

Depends on: none

## Requirements

- FR-23: Auth-related network calls to `/v1/auth/*` must support `credentials: "include"`
- Add `credentials?: RequestCredentials` to `ApiRequestOptions` (FR-24 infrastructure)
- Pass `credentials` to the underlying `fetch()` call; when omitted, browser default applies
- Do not change default behavior for existing non-auth callers

## Subtasks

- [ ] 2.1 Read `src/lib/api-client.ts` and integration-spec.md → Auth & error handling → Credentials table
- [ ] 2.2 Add `credentials` to `ApiRequestOptions` and destructure in `apiRequest`
- [ ] 2.3 Pass `credentials: options.credentials` to `fetch()` (undefined when not set)
- [ ] 2.4 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §3 API client**.

```ts
export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
  credentials?: RequestCredentials; // NEW
};

const response = await fetch(url, {
  method,
  headers,
  body: body !== undefined ? JSON.stringify(body) : undefined,
  credentials: options.credentials, // NEW — pass through
  signal: controller.signal,
});
```

Do **not** set a global default of `"include"` — only auth service calls will opt in (Task 3).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `ApiRequestOptions` exports optional `credentials` field
- [ ] Existing `apiRequest` callers compile without changes
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-auth-login-persistence/prd.md` ← read first
- `tasks/prd-auth-login-persistence/techspec.md` ← read first
- `tasks/prd-auth-login-persistence/integration-spec.md` ← read first
- `src/lib/api-client.ts` ← modify
