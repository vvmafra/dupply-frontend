# Task 5.0: (Optional P3) Account hydration via GET /v1/accounts/me

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Implement optional internal helper `hydrateUserFromApi()` that fetches `GET /v1/accounts/me` and maps the response to `SessionUser`. Call after successful HTTP login and restore when enabled. JWT decode + snapshot email remains the fallback on failure (migration Phase G).

Depends on: 3

## Requirements

- FR-25: When hydration is used, display name and email come from API; JWT decode acceptable as fallback
- Map `AccountResponseDTO.role` via existing domain mappers (not in DTO mapper)
- `name` fallback: `email.split("@")[0]` until API exposes a name field
- Mock mode: helper returns `null` (no HTTP)
- Block `payer` role at login still handled by `assertLoginAllowed` — hydration does not bypass FR-21

## Subtasks

- [ ] 5.1 Read integration-spec.md → `hydrateUserFromApi()` and DTO → Domain mapping
- [ ] 5.2 Implement `mapAccountDtoToSessionUser()` and `hydrateUserFromApi()` in `auth.service.ts`
- [ ] 5.3 Call hydration after successful HTTP login and after successful HTTP restore (when token valid or refreshed)
- [ ] 5.4 Verify fallback: if `/v1/accounts/me` fails, session still works with JWT-derived user
- [ ] 5.5 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → hydrateUserFromApi()** and **DTO → Domain mapping**.

```ts
function mapAccountDtoToSessionUser(dto: AccountResponseDTO): SessionUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.email.split("@")[0] ?? dto.email,
    platformRole: dto.role,
  };
}

async function hydrateUserFromApi(): Promise<SessionUser | null> {
  if (resolveApiMode() === "mock") return null;
  try {
    const dto = await apiRequest<AccountResponseDTO>("/v1/accounts/me"); // auth: true default
    return mapAccountDtoToSessionUser(dto);
  } catch {
    return null;
  }
}
```

After login/restore success:

```ts
const hydrated = await hydrateUserFromApi();
if (hydrated) session.user = hydrated;
```

This task is **P3 / optional** — skip if MVP deadline requires JWT-only user data. Document decision in PR if deferred.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] HTTP login shows user email/id from `/v1/accounts/me` when endpoint succeeds
- [ ] Failed hydration does not break login or restore
- [ ] Mock mode unchanged
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-auth-login-persistence/prd.md` ← read first
- `tasks/prd-auth-login-persistence/techspec.md` ← read first
- `tasks/prd-auth-login-persistence/integration-spec.md` ← read first
- `src/services/auth.dto.ts` ← read
- `src/services/auth.service.ts` ← modify
- `src/domain/auth/auth-session.types.ts` ← read
