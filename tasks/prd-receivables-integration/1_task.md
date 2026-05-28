# Task 1.0: Create receivable DTOs, domain types, errors, status labels, and anticipation helper

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Add the transport and domain foundation for receivable v2 integration: DTO types mirroring backend Zod schemas, backend-aligned domain types replacing `DuplicataTitulo` and legacy EN demo statuses, typed errors with Portuguese messages, status label map, and the discount → `proposedValue` helper. Corresponds to techspec Component design §1–2, §3, §6–7 and integration-spec migration Phase A.

Depends on: none

## Requirements

- FR-1: New module uses `receivable` / `receivables` naming — no `duplicata` in new files
- FR-2: Domain types align with backend v2 statuses (not legacy EN `DRAFT`, `FUNDED`, etc.)
- FR-17: Status label map covers in-scope backend statuses with Portuguese UI strings
- FR-24: `ReceivableError` class and error code → message map per integration-spec

## Subtasks

- [ ] 1.1 Read `integration-spec.md` DTO definitions and `seller-registration.service.ts` for adapter pattern reference
- [ ] 1.2 Create `src/services/receivable.dto.ts` with all request/response types
- [ ] 1.3 Create `src/domain/receivable/receivable.types.ts` with `ReceivableStatus`, `ReceivableListItem`, `ReceivableDetail`, form value types
- [ ] 1.4 Create `src/domain/receivable/receivable.errors.ts` with `ReceivableError` and Portuguese messages
- [ ] 1.5 Create `src/domain/receivable/receivable.status.ts` with `RECEIVABLE_STATUS_LABELS`
- [ ] 1.6 Create `src/domain/receivable/receivable-antecipacao.helpers.ts` with `calcProposedValueFromDiscount`
- [ ] 1.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → DTO definitions**, **Status labels**, **Auth & error handling**, and **techspec.md → Component design §1–3, §6–7**.

New files:

- `src/services/receivable.dto.ts` — `ReceivableMetaDataDTO`, `CreateReceivableRequestDTO`, `UpdateReceivableRequestDTO`, `RiskDecisionRequestDTO`, `SellerDecisionRequestDTO`, `ReceivableStatusDTO`, `ReceivableRowDTO`, `ReceivableErrorBodyDTO`
- `src/domain/receivable/receivable.types.ts` — backend-aligned `ReceivableStatus`, `ReceivableType`, `ReceivableListItem`, `ReceivableDetail`
- `src/domain/receivable/receivable.errors.ts` — `ReceivableErrorCode`, `ReceivableError`, `RECEIVABLE_ERROR_MESSAGES`
- `src/domain/receivable/receivable.status.ts` — `RECEIVABLE_STATUS_LABELS` per FR-17 table (include badge-only statuses: `payer_rejected`, `confirmed`, `payer_settled`, `overdue`)
- `src/domain/receivable/receivable-antecipacao.helpers.ts`:

```ts
export function calcProposedValueFromDiscount(
  faceValueReais: number,
  discountPercent: number,
): number {
  return faceValueReais * (1 - discountPercent / 100);
}
```

**Money:** API transport uses reais `number` (backend v2). Domain types store face/proposed values as reais — not centavos strings.

No HTTP calls or React components in this task — types and pure helpers only.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] All DTO types from integration-spec exist in `receivable.dto.ts`
- [ ] Domain types cover list, detail, and form models with backend v2 statuses
- [ ] Error messages match integration-spec error table
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `src/services/receivable.dto.ts` ← create
- `src/domain/receivable/receivable.types.ts` ← create
- `src/domain/receivable/receivable.errors.ts` ← create
- `src/domain/receivable/receivable.status.ts` ← create
- `src/domain/receivable/receivable-antecipacao.helpers.ts` ← create
- `src/services/seller-registration.service.ts` ← read (adapter pattern)
- `src/domain/duplicata/*` ← read (fields to migrate, do not import in new files)
