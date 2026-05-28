# Task 1.0: Create registration DTOs and domain mapper

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Add transport types for `POST /v1/auth/register` and a pure domain mapper module that translates between wizard form values and Slice A seller DTOs. Also export metadata completeness helpers from `seller-profile.mapper.ts` so the step resolver reuses the same rules as submit validation. Corresponds to techspec Component design §1–2 and integration-spec migration Phase A.

Depends on: none

## Requirements

- FR-13: Form ↔ DTO mapping must align with `companyMetaData`, `legalRepresentativeMetaData`, and `businessRelationsMetaData` shapes
- FR-14: Normalize CNPJ, CPF, phone, and CEP to digits-only before PATCH
- FR-15: Parse monetary BRL strings to numbers in reais with up to 2 decimal places
- FR-21: Reuse `UpdateSellerMetadataRequestDTO` and `SellerPublicViewDTO` from Slice A — do not duplicate seller DTOs

## Subtasks

- [ ] 1.1 Read `integration-spec.md` DTO definitions and Slice A `seller.dto.ts` / `seller-profile.mapper.ts`
- [ ] 1.2 Create `src/services/seller-registration.dto.ts` with register request/response and error types
- [ ] 1.3 Create `src/domain/seller/seller-registration.mapper.ts` with form ↔ PATCH and DTO → form mappers
- [ ] 1.4 Export `isCompanyComplete`, `isLegalRepresentativeComplete`, and `isBusinessRelationsComplete` from `seller-profile.mapper.ts`
- [ ] 1.5 Implement `resolveRegistrationWizardStepIndex()` using exported completeness helpers
- [ ] 1.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → DTO definitions**, **DTO → Domain mapping**, and **techspec.md → Component design §1–2**.

New files:

- `src/services/seller-registration.dto.ts` — `RegisterSellerRequestDTO`, `RegisterSellerResponseDTO`, `RegisterErrorBodyDTO`
- `src/domain/seller/seller-registration.mapper.ts` — `digitsOnly`, `parseReais`, `formatReais`, `mapFormToCompanyPatch`, `mapFormToRepresentativePatch`, `mapFormToRelationsPatch`, `mapSellerDtoToRegistrationForm`, `resolveRegistrationWizardStepIndex`

Step resolver returns 1–4 (wizard steps 2–5):

```ts
export function resolveRegistrationWizardStepIndex(dto: SellerPublicViewDTO): number {
  if (!isCompanyComplete(dto.companyMetaData)) return 1;
  if (!isLegalRepresentativeComplete(dto.legalRepresentativeMetaData)) return 2;
  if (!isBusinessRelationsComplete(dto)) return 3;
  return 4; // documents placeholder — submit allowed without doc validation
}
```

Pad `clients` / `suppliers` arrays to length 5 with empty rows on hydration. Only send counterparties with both `legalName` and `cnpj` on PATCH. Add `representativeRole` to form values type if not already present.

No runtime wiring in this task — types and pure mappers only.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `seller-registration.dto.ts` and `seller-registration.mapper.ts` exist with all functions from integration-spec
- [ ] Completeness helpers are exported from `seller-profile.mapper.ts` without duplicating rules
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `tasks/prd-seller-registration-integration/integration-spec.md` ← read first
- `src/services/seller-registration.dto.ts` ← create
- `src/domain/seller/seller-registration.mapper.ts` ← create
- `src/domain/seller/seller-profile.mapper.ts` ← modify (export completeness helpers)
- `src/services/seller.dto.ts` ← read (Slice A reuse)
- `src/domain/seller/seller-registration.schema.ts` ← read (form value types)
