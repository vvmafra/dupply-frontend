---
name: write-integration-spec
description: >-
  Write a frontend integration spec for a backend domain.
  Maps REST endpoints → DTOs → service adapters → consuming pages.
  Creates tasks/prd-{name}/integration-spec.md (PRD flow) or .specs/features/{domain}-integration.md (standalone).
  Use when: "write integration spec for X", "integration spec for X", "integrar X com o backend".
---

# write-integration-spec

## When to use

Triggered by: "write integration spec for X", "integration spec for X", "integrar X com o backend"

Use this skill **before implementing any service adapter** that will call the real backend.
It can run independently or be triggered from a PRD that notes "integration required".

## Output location

**Prefer the PRD task folder** when a PRD exists — keeps `prd.md`, `integration-spec.md`, and `techspec.md` together:

| Context | Output path |
|---------|-------------|
| PRD flow (`tasks/prd-{name}/prd.md` exists) | `tasks/prd-{name}/integration-spec.md` |
| Standalone (no PRD task folder) | `.specs/features/{domain}-integration.md` |

Resolve `{name}` from the PRD slug (e.g. `auth-login-persistence` → `tasks/prd-auth-login-persistence/integration-spec.md`).

---

## Steps

### 1. Gather context

#### Frontend side
1. Read `src/lib/api-client.ts` — understand `apiRequest<T>()`, `ApiError`, Bearer header.
2. Read `src/lib/env.ts` — `resolveApiMode()`, `env.useMocks`, `env.apiBaseUrl`.
3. Read `src/lib/token-storage.ts` — token persistence contract.
4. Read `src/services/{domain}.service.ts` (and related) — current mock signatures.
5. Read `src/domain/{domain}/` — existing types; these are the target of DTO mapping.
6. Read `.specs/features/api-integration/design.md` — adapter pattern, migration phases.

#### Backend side
7. Ask the user (or read from the backend repo if accessible) for:
   - **Endpoint list:** method, path, auth required, request body, response body.
   - **Auth scheme:** Bearer JWT for access token; refresh token in HttpOnly cookie `dupply_rt` (`Path=/v1/auth`). All `/v1/auth/*` requests require `credentials: "include"`.
   - **Error shapes:** `{ message, code?, ... }` structure for non-2xx.
   - **CORS:** allowed origins for dev/prod (note as open item if unknown).

If backend contracts are not available, mark each endpoint as `TBD` and create the spec with placeholders — **do not block on missing backend info**.

### 2. Create the integration spec

1. Check if `tasks/prd-{name}/prd.md` exists for the feature — if yes, write to `tasks/prd-{name}/integration-spec.md`.
2. Otherwise write to `.specs/features/{domain}-integration.md`.

Use `{domain}` in kebab-case matching the frontend service name (e.g. `duplicata`, `seller-registration`, `seller-review`).

### 3. Announce and suggest next step

Tell the user:
- What was created and where.
- Which service files need to be updated.
- That the next step is either `write-techspec` (if part of a PRD flow) or `create-tasks` (if the spec is standalone and scope is clear).

---

## Integration spec template

```markdown
# Integration Spec — {Domain Title}

**Frontend service:** `src/services/{domain}.service.ts`  
**Backend base path:** `/v1/{domain}` _(TBD if not confirmed)_  
**Status:** Draft | Confirmed | Implemented  
**Last updated:** {date}

---

## Overview

One paragraph. What does this domain do? What is the current state (mock-only)?
What changes when HTTP is enabled?

---

## Endpoint map

| # | Method | Path | Auth | Request body | Response body | Frontend function |
|---|--------|------|------|-------------|---------------|-------------------|
| 1 | POST | `/v1/{domain}/...` | Bearer | `{ ... }` | `{ ... }` | `create{Entity}()` |
| 2 | GET | `/v1/{domain}/...` | Bearer | — | `{ ... }[]` | `fetch{Entities}()` |
| 3 | PATCH | `/v1/{domain}/{id}/...` | Bearer | `{ ... }` | `{ ... }` | `update{Entity}()` |

_Mark `TBD` on any field not yet confirmed with the backend._

---

## DTO definitions

Define the TypeScript types for request/response bodies.
These are **transport types** — separate from domain types in `src/domain/`.

```ts
// Request DTOs
export type Create{Entity}RequestDTO = {
  field: string;
  // ...
};

// Response DTOs
export type {Entity}ResponseDTO = {
  id: string;
  // ...
  createdAt: string; // ISO 8601
};
```

**Placement:** `src/services/{domain}.dto.ts` (create if it doesn't exist).

---

## DTO → Domain mapping

Document how each response DTO maps to the existing domain type in `src/domain/`.

```ts
// src/services/{domain}.service.ts
function mapDTOToDomain(dto: {Entity}ResponseDTO): {DomainType} {
  return {
    id: dto.id,
    // ... field mapping
  };
}
```

If the DTO and domain type are identical, note "no mapping needed" and use the domain type directly.
If the DTO differs significantly, keep the mapping function in the service file.

---

## Adapter pattern (per function)

For each public service function, document the before/after:

### `fetch{Entities}()`

**Current mock:**
```ts
export async function fetch{Entities}(): Promise<{DomainType}[]> {
  await sleep(500);
  return {domain}s;
}
```

**With HTTP adapter:**
```ts
export async function fetch{Entities}(): Promise<{DomainType}[]> {
  if (resolveApiMode() === "mock") return fetch{Entities}Mock();
  const dtos = await apiRequest<{Entity}ResponseDTO[]>("/{domain}s");
  return dtos.map(mapDTOToDomain);
}
```

_(Repeat for each function in the service.)_

---

## Auth & error handling

- **Access token:** Bearer from `getAccessToken()` — handled automatically by `apiRequest` when `auth: true`.
- **Refresh token:** HttpOnly cookie `dupply_rt` — never read or stored in JS. Use `credentials: "include"` on all `/v1/auth/*` calls (login, refresh, logout, register).
- **401 on authenticated request:** try silent refresh via `POST /v1/auth/refresh` (cookie) before clearing session; then `clearAuthStorage()` + logout handler.
- **Other errors:** `ApiError` is thrown with `status` and `message`. Services should let it propagate; pages show a toast with the message.

```ts
// In page component (pattern)
try {
  const data = await fetch{Entities}();
  set{Entities}(data);
} catch (err) {
  if (err instanceof ApiError) {
    toast.error(err.message);
  }
}
```

---

## Migration plan

| Phase | Action | Risk |
|-------|--------|------|
| A | Create `{domain}.dto.ts` with DTO types — zero runtime change | None |
| B | Extract mock logic to `{entity}Mock()` functions in service | Low |
| C | Add HTTP adapter with `resolveApiMode()` gate — mock still default | Low |
| D | Enable HTTP in `.env.local` (`VITE_USE_MOCKS=false`) — test manually | Medium |
| E | Confirm + close open items | Low |

---

## Pages & components consuming this service

| File | Functions used | Notes |
|------|----------------|-------|
| `src/pages/{persona}/{Page}.tsx` | `fetch{Entities}()` | Renders list |
| `src/components/{persona}/{Component}.tsx` | `create{Entity}()` | Form submit |

---

## Open items

- [ ] Confirm endpoint paths with backend (`/v1/{domain}/...`)
- [ ] Confirm response DTO shape for `{Entity}`
- [ ] Confirm error shape for validation errors (400)
- [ ] CORS — allowed origin for `http://localhost:5173` (backend uses `CORS_ALLOWED_ORIGINS` + `credentials: true`)
- [x] Refresh token — HttpOnly cookie `dupply_rt`; frontend uses `credentials: "include"`, no JS storage
```

---

## Rules

- English only in the spec file.
- Never block on missing backend info — use `TBD` and create placeholders.
- DTO types go in `src/services/{domain}.dto.ts`, not in `src/domain/`.
- Domain types in `src/domain/` are never changed to match DTOs — mapping is always in the service layer.
- The adapter pattern must use `resolveApiMode()` from `src/lib/env.ts` — never bare `env.useMocks` boolean directly (for consistency and testability).
- One spec per bounded context — do not mix `duplicata` and `seller-registration` in the same file.
- This spec is a living document — update it as backend contracts are confirmed. Mark `Status: Confirmed` only when all TBDs are resolved.
- **When a PRD task folder exists, always write `integration-spec.md` there** — do not create a duplicate under `.specs/features/`.
