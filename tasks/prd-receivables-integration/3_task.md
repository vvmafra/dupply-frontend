# Task 3.0: Implement HTTP-only receivable service

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Replace the mock `duplicata.service.ts` with an HTTP-only `receivable.service.ts` that centralizes all receivable I/O via `apiRequest`, delegates DTO mapping to domain mappers, and maps API errors to `ReceivableError`. No mock branch — same pattern as `seller-registration.service.ts`. Corresponds to techspec Component design §8 and integration-spec Adapter pattern.

Depends on: 1.0, 2.0

## Requirements

- FR-4: HTTP-only service with DTO file, typed errors, Portuguese messages, Bearer auth via `apiRequest`
- FR-5: Service returns domain types — pages must not import DTOs
- FR-6–FR-8: Service exposes draft create/update and atomic submit functions
- FR-10–FR-11: List and seller-decision functions
- FR-13–FR-16: Fetch by id, risk offer/reprove, scoped list for analyst JWT
- FR-24: `mapReceivableApiError` maps `{ error: string }` body to `ReceivableError`

## Subtasks

- [ ] 3.1 Read `seller-registration.service.ts` and `integration-spec.md` endpoint map
- [ ] 3.2 Create `src/services/receivable.service.ts` with all HTTP functions
- [ ] 3.3 Implement `assertReceivableApiConfigured()` and `mapReceivableApiError()`
- [ ] 3.4 Wire risk offer helper: `submitRiskOffer(id, discountPercent)` computes `proposedValue` via `calcProposedValueFromDiscount`
- [ ] 3.5 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → Endpoint map**, **Adapter pattern**, **Auth & error handling**, and **techspec.md → Component design §8**.

| Function | Endpoint | Returns |
|----------|----------|---------|
| `fetchReceivables()` | GET `/v1/receivables` | `ReceivableListItem[]` |
| `fetchReceivableById(id)` | GET `/v1/receivables/:id` | `ReceivableDetail` |
| `createReceivableDraft(body)` | POST `/v1/receivables` | `string` (id) |
| `updateReceivableDraft(id, body)` | PATCH `/v1/receivables/:id` | `void` |
| `submitReceivableForReview(id)` | POST `/v1/receivables/:id/submit` | `void` |
| `createAndSubmitReceivable(body)` | POST `/v1/receivables/submit` | `{ id: string; status: "under_review" }` |
| `submitRiskOffer(id, discountPercent)` | POST `.../risk-decision` | `void` |
| `submitRiskReprove(id)` | POST `.../risk-decision` | `void` |
| `submitSellerDecision(id, decision)` | POST `.../seller-decision` | `void` |

```ts
function assertReceivableApiConfigured(): void {
  if (!env.apiBaseUrl) {
    throw new ReceivableError("network", RECEIVABLE_ERROR_MESSAGES.network);
  }
}
```

Every function: `assertReceivableApiConfigured()` → `apiRequest` → map response via domain mappers → catch and rethrow via `mapReceivableApiError`.

**Do not delete `duplicata.service.ts` yet** — pages still import it until Tasks 5–7. No `resolveApiMode()` branch.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] All 9 service functions exist and return domain types
- [ ] No mock imports, sleep, or demo data in `receivable.service.ts`
- [ ] Risk offer sends `{ decision: "offer", proposedValue }` in reais
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `src/services/receivable.service.ts` ← create
- `src/domain/receivable/receivable.mapper.ts` ← read (Task 2)
- `src/domain/receivable/receivable.errors.ts` ← read (Task 1)
- `src/services/seller-registration.service.ts` ← read (pattern)
- `src/services/duplicata.service.ts` ← read (functions to replace, do not delete yet)
