# Task 2.0: Align Zod schemas with backend metadata contract

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Update registration Zod schemas so step-level validation matches the backend contract before each API call. Add the required `representativeRole` field, digit transforms for masked inputs, monetary parsing, and a permissive documents schema for HTTP mode that never blocks submit. Corresponds to techspec Component design §3.

Depends on: 1.0

## Requirements

- FR-13: Legal representative step must include `representativeRole` (maps to `legalRepresentativeMetaData.role`)
- FR-14: Validate and normalize CNPJ (14 digits), CPF (11 digits), phone (≥10 digits), and CEP before PATCH
- FR-15: Monetary fields (`shareCapital`, `revenueLast12Months`) must parse BRL strings correctly
- FR-4: Documents step must not block submit in HTTP mode — optional checkboxes only

## Subtasks

- [ ] 2.1 Read existing `seller-registration.schema.ts` and wizard step validation usage
- [ ] 2.2 Add `representativeRole` to representative schema with PT error message
- [ ] 2.3 Add digit refinements for CNPJ, CPF, phone, and CEP fields across company and relations steps
- [ ] 2.4 Add `sellerRegistrationDocumentsSchemaHttp` — permissive, no blocking superRefine
- [ ] 2.5 Update `seller-registration.autofill.ts` mock data to include `representativeRole`
- [ ] 2.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §3** and **integration-spec.md → Form → PATCH normalization**.

Representative schema addition:

```ts
export const sellerRegistrationRepresentativeSchema = z.object({
  representativeName: z.string().trim().min(1, "Informe o nome do representante"),
  representativeCpf: z.string().trim().refine((v) => digitsOnly(v).length === 11, "Informe um CPF válido"),
  representativeEmail: z.string().trim().email("Informe um e-mail pessoal válido"),
  representativePhone: z.string().trim().refine((v) => digitsOnly(v).length >= 10, "Informe um telefone pessoal válido"),
  representativeRole: z.string().trim().min(1, "Informe o cargo do representante"),
});
```

Documents step (HTTP): replace blocking validation with optional checkboxes — documents never block submit. Reuse `digitsOnly` from Task 1 mapper or co-locate a shared import.

Field mapping reminders (UI label → backend):

| UI field | Backend field |
|----------|---------------|
| `taxId` | `cnpj` |
| `foundationDate` | `foundingDate` |
| `revenueLast12Months` | `annualRevenue` |
| `representativeName` | `fullName` |
| `clients[].averageShare` | `sharePercentage` |

Do not wire schemas into the wizard yet (Task 6).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] All five step schemas validate backend-aligned rules with Portuguese messages
- [ ] `representativeRole` is required in representative step schema
- [ ] HTTP documents schema is permissive and does not block submit
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `tasks/prd-seller-registration-integration/integration-spec.md` ← read first
- `src/domain/seller/seller-registration.schema.ts` ← modify
- `src/domain/seller/seller-registration.autofill.ts` ← modify
- `src/domain/seller/seller-registration.mapper.ts` ← read (digitsOnly, parseReais)
