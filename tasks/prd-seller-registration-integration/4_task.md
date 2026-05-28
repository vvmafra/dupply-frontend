# Task 4.0: Implement HTTP-only registration service

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Replace the mock `registerSeller()` in `seller-registration.service.ts` with HTTP-only orchestration functions: register access (step 1), per-step PATCH (steps 2–4), submit, state hydration, and backend status fetch. Delegates PATCH/GET/submit to Slice A `seller.service.ts`. No `resolveApiMode()` gate — registration I/O is always HTTP. Corresponds to techspec Component design §5 and §13.

Depends on: 1.0, 3.0

## Requirements

- FR-1: `registerSellerAccess()` calls `POST /v1/auth/register` with `credentials: "include"`
- FR-2: On successful register, persist access token and auth snapshot before returning
- FR-3: `saveSellerRegistrationStep()` delegates to `updateSellerMetadata()` with step-scoped PATCH body
- FR-5: `finishSellerRegistration()` delegates to `submitSellerForReview()`
- FR-16: Map register errors to Portuguese messages (`email_already_exists`, `validation_error`, network)
- FR-18: `loadSellerRegistrationState()` throws `SellerRegistrationBlockedError` when status is `inactive`
- FR-19: No mock path — HTTP-only; requires `VITE_API_BASE_URL`
- FR-20: Service layer only — no JSX
- FR-21: Reuse Slice A seller service and DTOs — do not duplicate PATCH/GET/submit logic

## Subtasks

- [ ] 4.1 Read `auth.service.ts` login session persistence and Slice A `seller.service.ts` adapters
- [ ] 4.2 Implement `SellerRegistrationError` and PT error message map for register endpoint
- [ ] 4.3 Implement `registerSellerAccess`, `saveSellerRegistrationStep`, `finishSellerRegistration`
- [ ] 4.4 Implement `loadSellerRegistrationState` and `fetchSellerBackendStatus`
- [ ] 4.5 Extract or reuse shared session persistence helpers (avoid circular imports with auth.service)
- [ ] 4.6 Remove mock `registerSeller()` / `sleep` implementation entirely
- [ ] 4.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → Adapter pattern** and **techspec.md → Component design §5**.

Key functions:

```ts
export async function registerSellerAccess(payload): Promise<{ sellerId: string; session: AuthSession }>
export async function saveSellerRegistrationStep(stepId, sellerId, values): Promise<SellerCompany>
export async function finishSellerRegistration(sellerId: string): Promise<void>
export async function loadSellerRegistrationState(): Promise<{ status, sellerId, formValues, stepIndex }>
export async function fetchSellerBackendStatus(): Promise<SellerStatusDTO>
```

Register flow mirrors `auth.service.ts` `httpLoginImpl`: `setAccessToken()` + `setAuthSnapshot()`. Resolve seller ID from JWT via existing `getSellerProfileIdFromToken()`.

Register error messages:

| Code | PT message |
|------|------------|
| `email_already_exists` | Este e-mail já está cadastrado. |
| `validation_error` | Verifique os dados informados e tente novamente. |
| network | Não foi possível conectar. Tente novamente. |

Seller route errors reuse `SellerProfileError` / `mapSellerApiError()` from `seller.service.ts`. Do not wire the wizard yet (Task 6).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Mock `registerSeller()` is fully removed — no `sleep` or mock gate
- [ ] All five service functions exist and delegate to Slice A where specified
- [ ] Register session persistence matches login pattern
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `tasks/prd-seller-registration-integration/integration-spec.md` ← read first
- `src/services/seller-registration.service.ts` ← modify
- `src/services/seller-registration.dto.ts` ← read
- `src/services/seller.service.ts` ← read (delegate PATCH/GET/submit)
- `src/services/auth.service.ts` ← read (session persistence pattern)
- `src/domain/seller/seller-registration.mapper.ts` ← read
- `src/domain/seller/seller-registration.routing.ts` ← read
- `src/services/auth-session.persistence.ts` ← create (optional)
