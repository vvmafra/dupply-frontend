# Task 1.0: Create seller transport DTOs

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create `src/services/seller.dto.ts` with transport types mirroring the backend `SellerPublicView` contract. DTOs stay in the services layer per project conventions and are consumed by the domain mapper and HTTP adapter in later tasks. Corresponds to techspec Component design §2 and integration-spec migration Phase A.

Depends on: none

## Requirements

- FR-4: Define response/request types that the mapper will translate into `SellerCompany` — pages must not import these DTOs
- FR-8: Include `UpdateSellerMetadataRequestDTO` with partial metadata fields for PATCH
- FR-12: Monetary fields (`shareCapital`, `annualRevenue`) are `number` in reais with up to 2 decimal places
- FR-14: DTOs live in `src/services/`, not `src/domain/`

## Subtasks

- [ ] 1.1 Read `integration-spec.md` DTO definitions and existing `seller.service.ts` mock shapes
- [ ] 1.2 Create `src/services/seller.dto.ts` with all exported transport types
- [ ] 1.3 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → DTO definitions** and **techspec.md → Component design §2**.

Export at minimum:

```ts
export type SellerStatusDTO = "created" | "in_review" | "active" | "inactive";
export type CompanyAddressDTO = { /* zipCode, state, street, number, complement?, neighborhood, city */ };
export type CompanyMetaDataDTO = { /* legalName, cnpj, foundingDate, shareCapital, annualRevenue, ... */ };
export type LegalRepresentativeMetaDataDTO = { /* fullName, cpf, email, phone, role */ };
export type BusinessRelationDTO = { legalName: string; cnpj: string; sharePercentage?: number };
export type BusinessRelationsMetaDataDTO = { clients: BusinessRelationDTO[]; suppliers: BusinessRelationDTO[] };
export type SellerPublicViewDTO = { id, status, name, companyMetaData, legalRepresentativeMetaData, businessRelationsMetaData, accountId, walletId, createdAt, updatedAt };
export type UpdateSellerMetadataRequestDTO = { name?, companyMetaData?, legalRepresentativeMetaData?, businessRelationsMetaData? };
export type SellerErrorBodyDTO = { error: /* known codes */; message?: string };
```

No runtime changes in this task — types only. Do not wire DTOs into `seller.service.ts` yet (Task 4).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `seller.dto.ts` exists with all types from integration-spec exported
- [ ] No page or domain file imports DTOs yet (mapper wiring is Task 2)
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-profile-integration/prd.md` ← read first
- `tasks/prd-seller-profile-integration/techspec.md` ← read first
- `tasks/prd-seller-profile-integration/integration-spec.md` ← read first
- `src/services/seller.dto.ts` ← create
- `src/services/seller.service.ts` ← read (mock reference only)
- `src/domain/seller/seller.types.ts` ← read (domain target shape)
