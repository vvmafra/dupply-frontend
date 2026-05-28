# Task 5.0: Add representative role field to wizard UI

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Add the `representativeRole` input ("Cargo / função") to the legal representative step so the wizard collects the backend-required `legalRepresentativeMetaData.role` field. Corresponds to techspec Component design §6.

Depends on: 2.0

## Requirements

- FR-13: Legal representative step must include `role` field aligned with backend metadata

## Subtasks

- [ ] 5.1 Read `RepresentativeStepFields.tsx` and surrounding wizard step layout
- [ ] 5.2 Add `representativeRole` FormField with label "Cargo / função" and PT placeholder
- [ ] 5.3 Wire field to react-hook-form using existing step field patterns
- [ ] 5.4 Verify component renders correctly (manual browser check)
- [ ] 5.5 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §6**.

Follow existing FormField / Input patterns in `RepresentativeStepFields.tsx`. Field name must match schema: `representativeRole`. Display validation error from Zod schema ("Informe o cargo do representante").

No API wiring in this task — wizard orchestration is Task 6.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Representative step shows "Cargo / função" input bound to `representativeRole`
- [ ] Field validation error displays when empty on step submit
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `src/components/auth/seller-registration/RepresentativeStepFields.tsx` ← modify
- `src/domain/seller/seller-registration.schema.ts` ← read
