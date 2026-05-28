# Task 4.0: Refactor seller service into dual-mode mock/HTTP adapter

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Refactor `seller.service.ts` into mock and HTTP implementations gated by `resolveApiMode()`, following the same pattern as `auth.service.ts`. Extract existing mock logic into `*Mock()` helpers, wire HTTP calls to `GET/PATCH/POST` seller endpoints, map API errors to `SellerProfileError` with Portuguese messages, and expose explicit `updateSellerMetadata` and `submitSellerForReview` while keeping `updateSellerValidationStatus` as a mock-compatible shim. Corresponds to techspec Component design §5 and integration-spec adapter sections.

Depends on: 1, 2, 3

## Requirements

- FR-1: Mock mode preserves current behavior — simulated latency, in-memory mutations, no HTTP
- FR-2: HTTP `fetchCurrentSeller()` resolves seller ID via JWT `profileId` and calls `GET /v1/sellers/:id`
- FR-3: Missing session or seller profile throws `SellerProfileError` with PT message
- FR-7: Mock `updateSellerValidationStatus` behavior unchanged
- FR-8: HTTP `updateSellerMetadata()` calls `PATCH /v1/sellers/:id` with partial body
- FR-9: HTTP `submitSellerForReview()` calls `POST /v1/sellers/:id/submit` (204)
- FR-10, FR-11: Map backend error codes (`metadata_locked`, `incomplete_metadata`, etc.) to PT messages
- FR-14: All HTTP via shared `apiRequest`; no direct `fetch` in pages
- FR-15: `resolveApiMode()` gate on every public function; mock remains default

## Subtasks

- [ ] 4.1 Read `auth.service.ts` dual-mode pattern and `integration-spec.md` adapter sections
- [ ] 4.2 Extract `fetchCurrentSellerMock()` and `updateSellerValidationStatusMock()` from current mock logic
- [ ] 4.3 Implement `resolveSellerIdFromSession()` using `getAccessToken()` + `getSellerProfileIdFromToken()`
- [ ] 4.4 Implement `mapSellerApiError()` with `SELLER_ERROR_MESSAGES` from integration-spec
- [ ] 4.5 Wire HTTP `fetchCurrentSeller()`, `updateSellerMetadata()`, `submitSellerForReview()`
- [ ] 4.6 Update `updateSellerValidationStatus()` — mock path unchanged; HTTP delegates submit when `validationStatus === "UNDER_REVIEW"`
- [ ] 4.7 Verify mock mode regression manually (dashboard still shows `MOCK_SELLERS[0]`)
- [ ] 4.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → Adapter pattern** and **techspec.md → Component design §5**.

**Public API:**

```ts
export async function fetchCurrentSeller(): Promise<SellerCompany> {
  if (resolveApiMode() === "mock") return fetchCurrentSellerMock();
  try {
    const sellerId = resolveSellerIdFromSession();
    const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
    return mapSellerDtoToCompany(dto);
  } catch (error) {
    throw mapSellerApiError(error);
  }
}

export async function updateSellerMetadata(sellerId, patch): Promise<SellerCompany> { /* HTTP only */ }
export async function submitSellerForReview(sellerId): Promise<void> { /* mock delegates to mock shim */ }

export async function updateSellerValidationStatus(sellerId, updates): Promise<void> {
  if (resolveApiMode() === "mock") return updateSellerValidationStatusMock(sellerId, updates);
  if (updates.validationStatus === "UNDER_REVIEW") {
    await submitSellerForReview(sellerId);
    return;
  }
  throw new SellerProfileError("unknown", "Operação não suportada neste modo.");
}
```

**Session resolution:**

```ts
function resolveSellerIdFromSession(): string {
  const token = getAccessToken();
  if (!token) throw new SellerProfileError("missing_session", "Sua sessão expirou. Faça login novamente.");
  const profileId = getSellerProfileIdFromToken(token);
  if (!profileId) throw new SellerProfileError("missing_seller_profile", "Não foi possível identificar seu perfil de vendedor.");
  return profileId;
}
```

**Error mapping** — use `ApiError.body.error` codes from integration-spec PT table. `approveAnalystDuplicatasAccess()` stays mock-only (out of scope).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Mock mode: `fetchCurrentSeller` returns `MOCK_SELLERS[0]` with latency; no HTTP calls
- [ ] HTTP mode: `fetchCurrentSeller` uses Bearer token + `profileId` + mapper
- [ ] `updateSellerMetadata` and `submitSellerForReview` exported and HTTP-wired
- [ ] Known backend error codes map to correct Portuguese messages
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-profile-integration/prd.md` ← read first
- `tasks/prd-seller-profile-integration/techspec.md` ← read first
- `tasks/prd-seller-profile-integration/integration-spec.md` ← read first
- `src/services/seller.service.ts` ← modify
- `src/services/seller.dto.ts` ← read (Task 1)
- `src/services/auth.service.ts` ← read (pattern reference)
- `src/domain/seller/seller-profile.mapper.ts` ← read (Task 2)
- `src/domain/seller/seller-profile.errors.ts` ← read (Task 2)
- `src/domain/auth/auth-jwt.ts` ← read (Task 3)
- `src/lib/api-client.ts` ← read
