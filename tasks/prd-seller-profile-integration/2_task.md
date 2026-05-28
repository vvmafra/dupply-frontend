# Task 2.0: Add domain mapper, metadata completeness, and seller profile errors

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create pure domain modules that map `SellerPublicViewDTO` to the existing `SellerCompany` type and expose typed errors with Portuguese messages for seller profile operations. Derived UI fields (`validationStatus`, `kycStatus`, `analystDuplicatasAccess`, `documentsProgress`, `onboardingStep`) are computed from backend status and metadata completeness — not persisted fiction in HTTP mode. Corresponds to techspec Component design §3 and §4.

Depends on: 1

## Requirements

- FR-4: Implement `mapSellerDtoToCompany()` returning `SellerCompany` without pages importing DTOs
- FR-5: `deriveValidationFields()` maps backend lifecycle status to frontend validation/onboarding semantics
- FR-6: When backend status is `active`, mapped `analystDuplicatasAccess` is `APPROVED` so `canSellerRegisterDuplicatas()` works unchanged
- FR-12: Monetary DTO fields pass through as reais `number` values in the domain mapper
- FR-3, FR-10, FR-11: Define `SellerProfileError` with codes and PT messages for session/profile/API failures

## Subtasks

- [ ] 2.1 Read `integration-spec.md` field mapping and status tables; read `seller.types.ts` and `canSellerRegisterDuplicatas`
- [ ] 2.2 Create `src/domain/seller/seller-profile.mapper.ts` with `mapSellerDtoToCompany`, `computeMetadataCompleteness`, `deriveValidationFields`
- [ ] 2.3 Create `src/domain/seller/seller-profile.errors.ts` with `SellerProfileErrorCode` and `SellerProfileError` class
- [ ] 2.4 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → DTO → Domain mapping** and **techspec.md → Component design §3, §4**.

**Status mapping (confirmed):**

| Backend `status` | Metadata | `validationStatus` | `kycStatus` | `analystDuplicatasAccess` |
|------------------|----------|-------------------|-------------|---------------------------|
| `created` | empty | `NOT_STARTED` | `PENDING` | `PENDING` |
| `created` | partial | `DOCUMENTS_PENDING` | `PENDING` | `PENDING` |
| `created` | complete | `KYC_PENDING` | `PENDING` | `PENDING` |
| `in_review` | any | `UNDER_REVIEW` | `APPROVED` | `UNDER_REVIEW` |
| `active` | any | `APPROVED` | `APPROVED` | `APPROVED` |
| `inactive` | any | `REJECTED` | `REJECTED` | `REJECTED` |

**Metadata completeness** — align required-field rules with backend `assertCompleteSellerMetadata`:
- Company: `legalName`, `cnpj`, `foundingDate`, `shareCapital`, `annualRevenue`, `corporateEmail`, `phone`, `businessDescription`, full `address`
- Legal representative: `fullName`, `cpf`, `email`, `phone`, `role`
- Business relations: at least one client and one supplier with `legalName` + `cnpj`

Compute `documentsProgress` (0–100) and `onboardingStep` (1–4) from completeness.

**Error type** — no I/O in domain layer; service layer will construct `SellerProfileError` with PT messages from integration-spec error table:

```ts
export type SellerProfileErrorCode =
  | "missing_session"
  | "missing_seller_profile"
  | "seller_not_found"
  | "forbidden"
  | "metadata_locked"
  | "incomplete_metadata"
  | "invalid_status_for_submit"
  | "invalid_status_transition"
  | "validation_error"
  | "network"
  | "unknown";

export class SellerProfileError extends Error { /* code + message */ }
```

Domain mapper may import DTO types from `@/services/seller.dto` (same pattern as auth integration). No React, no api-client.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `mapSellerDtoToCompany()` produces correct derived fields for all five backend statuses
- [ ] `computeMetadataCompleteness()` returns `percent` and `step` aligned with integration-spec rules
- [ ] `SellerProfileError` exported with all codes from techspec §4
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-profile-integration/prd.md` ← read first
- `tasks/prd-seller-profile-integration/techspec.md` ← read first
- `tasks/prd-seller-profile-integration/integration-spec.md` ← read first
- `src/services/seller.dto.ts` ← read (from Task 1)
- `src/domain/seller/seller-profile.mapper.ts` ← create
- `src/domain/seller/seller-profile.errors.ts` ← create
- `src/domain/seller/seller.types.ts` ← read
- `src/domain/seller/seller-duplicata-access.ts` ← read (`canSellerRegisterDuplicatas`)
