# Task 5.0: Wire seller form, list, new page, and dashboard previews

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Rename and wire all seller receivable pages and components to use `receivable.service.ts`: new form with separate Save vs Submit actions, list with offer response wizard, new page with access gate, and dashboard/validation preview counts. Corresponds to techspec Component design §10–12, §17 (seller subset).

Depends on: 3.0, 4.0

## Requirements

- FR-1: Rename seller pages/components from `Duplicata*` to `Receivable*`
- FR-6: **Salvar informações** → create or update draft (`status=created`); no submit transition
- FR-7: **Enviar para análise** → validate + `submitReceivableForReview`
- FR-8: Submit without prior draft → `createAndSubmitReceivable` (atomic endpoint)
- FR-9: Non-`created` receivables render read-only with `metadata_locked` messaging
- FR-10: Seller list via `fetchReceivables()` with PT status badges
- FR-11: Offer response wizard when `status === "offer"`
- FR-12: `NewReceivablePage` gates via `canSellerRegisterReceivables()`
- FR-22–FR-23: Form uses Zod schema; document uploads visible with TODO, excluded from validation

## Subtasks

- [ ] 5.1 Read `NewDuplicataForm.tsx`, `SellerDuplicatasPage.tsx`, `NewDuplicataPage.tsx`, seller preview components
- [ ] 5.2 Create `src/components/forms/NewReceivableForm.tsx` with Save and Submit handlers
- [ ] 5.3 Create `src/pages/seller/SellerReceivablesPage.tsx` and `NewReceivablePage.tsx`
- [ ] 5.4 Create `src/components/seller/SellerReceivablesPreview.tsx` and `SellerValidationReceivablesOverview.tsx`
- [ ] 5.5 Update `SellerDashboardPage.tsx` and `SellerValidationPage.tsx` to import receivable service
- [ ] 5.6 Verify seller flows in browser: draft save, submit, list, offer response
- [ ] 5.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §10–12, §17**, **Data flow (Save draft, Submit)**, and **integration-spec.md → Pages & components**.

**NewReceivableForm** — two primary actions:

```tsx
<Button type="button" onClick={handleSaveDraft} disabled={loading}>
  Salvar informações
</Button>
<Button type="button" onClick={handleSubmitForReview} disabled={loading}>
  Enviar para análise
</Button>
```

| Action | Flow |
|--------|------|
| Save draft | `receivableDraftSchema` → `draftId ? updateReceivableDraft : createReceivableDraft` → store id → toast "Informações salvas" |
| Submit (has draft) | `receivableSubmitSchema` → `submitReceivableForReview(draftId)` → navigate list |
| Submit (no draft) | `receivableSubmitSchema` → `createAndSubmitReceivable` → navigate list |

Edit lock: when loaded receivable `status !== "created"`, read-only detail + locked message.

Documents: keep `RegistrationUploadField` with TODO badge; exclude from Zod and API payload.

**SellerReceivablesPage:** `fetchReceivables()` on mount; `ReceivableStatusBadge`; row opens `SellerReceivableOfferWizardDialog` when `status === "offer"`; copy "Recebíveis" / "Nova recebível".

**Error handling:** catch `ReceivableError` → `toast.error(err.message)`.

Old duplicata pages may coexist until Task 7 routes migration — new pages should be functional when imported directly.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Save and Submit are separate actions with correct API calls
- [ ] Atomic submit works without prior draft id
- [ ] List shows backend rows with PT status badges
- [ ] Seller can accept/reject offer via wizard
- [ ] Inactive seller sees `seller_not_active` toast on create attempt
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `src/components/forms/NewReceivableForm.tsx` ← create
- `src/pages/seller/SellerReceivablesPage.tsx` ← create
- `src/pages/seller/NewReceivablePage.tsx` ← create
- `src/components/seller/SellerReceivablesPreview.tsx` ← create
- `src/components/seller/SellerValidationReceivablesOverview.tsx` ← create
- `src/pages/seller/SellerDashboardPage.tsx` ← modify
- `src/pages/seller/SellerValidationPage.tsx` ← modify
- `src/services/receivable.service.ts` ← read (Task 3)
- `src/components/seller/SellerReceivableOfferWizardDialog.tsx` ← read (Task 4)
- `src/components/forms/NewDuplicataForm.tsx` ← read (migrate from)
