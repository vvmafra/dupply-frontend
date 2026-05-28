# Task 2.0: Add Zod schema, mappers, and seller receivable access gate

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Add pure boundary mappers between form values, DTOs, and domain models; Zod validation for draft and submit (excluding document TODO fields); and the seller access gate renamed from duplicata. Corresponds to techspec Component design §4–5, §9 and integration-spec DTO → Domain mapping.

Depends on: 1.0

## Requirements

- FR-12: `canSellerRegisterReceivables()` gates on active seller profile (backend enforces `seller_not_active` on create)
- FR-18: Form fields map to backend `receivableMetaData` English keys; PT form enums → EN API enums
- FR-19: Create/update bodies include top-level payer fields + nested metadata per OpenAPI schema
- FR-20: Mappers use reais numbers at API boundary (backend v2 contract)
- FR-22: Validation in `receivable.schema.ts` (Zod), not inline in form component
- FR-23: Document upload booleans excluded from required submit rules

## Subtasks

- [ ] 2.1 Read `NewDuplicataForm.tsx` validation and `seller-registration.mapper.ts` for `parseReais` pattern
- [ ] 2.2 Create `src/domain/receivable/receivable.schema.ts` with draft and submit schemas
- [ ] 2.3 Create `src/domain/receivable/receivable.mapper.ts` with row ↔ domain and form ↔ DTO mappers
- [ ] 2.4 Create `src/domain/seller/seller-receivable-access.ts` replacing duplicata gate
- [ ] 2.5 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → DTO → Domain mapping**, **Monetary convention**, and **techspec.md → Component design §4–5, §9**.

**Schema** (`receivable.schema.ts`):

- `receivableDraftSchema` and `receivableSubmitSchema` — same required fields; document booleans optional / excluded
- CNPJ refine: 14 digits after `digitsOnly`
- `antifraudDeclarationsAccepted: z.literal(true)` on submit

**Mappers** (`receivable.mapper.ts`):

| Function | Responsibility |
|----------|----------------|
| `mapReceivableRowToListItem` | Parse `receivableMetaData` JSON string → list item |
| `mapReceivableRowToDetail` | Full detail with all metadata fields |
| `mapFormToCreateBody` | PT form → `CreateReceivableRequestDTO` |
| `mapFormToUpdateBody` | PT form → `UpdateReceivableRequestDTO` |
| `deriveDiscountPercent` | Compute discount % from face + proposed for seller offer wizard |

Handle `receivableMetaData: null` for empty drafts. Exclude document upload booleans from payloads (Module 6 deferred).

**Seller gate** (`seller-receivable-access.ts`):

```ts
export function canSellerRegisterReceivables(seller: SellerCompany): boolean {
  return seller.validationStatus === "APPROVED" && seller.kycStatus === "APPROVED";
}
```

Do not wire pages yet — mappers and gate only.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] All mapper functions from techspec §5 exist and handle null metadata
- [ ] Zod schemas validate submit without document fields
- [ ] `canSellerRegisterReceivables` exported and ready for page imports
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `src/domain/receivable/receivable.schema.ts` ← create
- `src/domain/receivable/receivable.mapper.ts` ← create
- `src/domain/seller/seller-receivable-access.ts` ← create
- `src/domain/receivable/receivable.types.ts` ← read (Task 1)
- `src/services/receivable.dto.ts` ← read (Task 1)
- `src/components/forms/NewDuplicataForm.tsx` ← read (validation to migrate)
- `src/domain/seller/seller-duplicata-access.ts` ← read (gate to replace)
