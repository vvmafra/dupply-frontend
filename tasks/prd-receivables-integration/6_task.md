# Task 6.0: Wire analyst list, detail, and dashboard counts

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Rename and wire analyst receivable pages: list all receivables for analyst JWT, detail with parsed metadata and risk decision actions (offer via wizard, reprove), and dashboard pending counts. Remove "Marcar como pendente" (no backend transition). Corresponds to techspec Component design §13–14, §17 (analyst subset).

Depends on: 3.0, 4.0

## Requirements

- FR-1: Rename analyst pages from `Duplicata*` to `Receivable*`
- FR-13: Analyst list via `fetchReceivables()` — all non-deleted rows
- FR-14: Detail via `fetchReceivableById`; display parsed metadata, seller id (name from metadata until API-3)
- FR-15: **Oferta** when `status === "under_review"` → `submitRiskOffer(id, discountPercent)`
- FR-16: **Reprovar** → `submitRiskReprove(id)` without `proposedValue`
- FR-25: Score sections render TODO empty state — no simulated values

## Subtasks

- [ ] 6.1 Read `AnalystDuplicatasPage.tsx`, `AnalystDuplicataDetailPage.tsx`, `AnalystDashboardPage.tsx`
- [ ] 6.2 Create `src/pages/analyst/AnalystReceivablesPage.tsx`
- [ ] 6.3 Create `src/pages/analyst/AnalystReceivableDetailPage.tsx`
- [ ] 6.4 Update `AnalystDashboardPage.tsx` to count `under_review` receivables
- [ ] 6.5 Verify analyst flows in browser: list, detail, offer, reprove
- [ ] 6.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §13–14, §17**, **Data flow (Analyst offer)**, and **integration-spec.md → Pages & components**.

**AnalystReceivablesPage:**

- `fetchReceivables()` on mount — no sellerId filter (backend scopes by JWT)
- Link rows to `ROUTES.analyst.receivables.detail(id)` (route wired in Task 7; use path constant or temporary import)
- Show seller id or parsed metadata payer/seller fields

**AnalystReceivableDetailPage:**

- `fetchReceivableById(id)` on mount
- Sections: seller info, payer info, fiscal, proof (from parsed metadata)
- Actions when `status === "under_review"`:
  - **Oferta** → open `AnalystReceivableOfferWizardDialog` → `submitRiskOffer(id, discountPercent)` → refetch → toast "Oferta enviada ao cedente"
  - **Reprovar** → confirm → `submitRiskReprove(id)` → refetch → toast "Recebível reprovada"
- **Remove** "Marcar como pendente" button
- Score props: `undefined` or TODO placeholder — no mock scores

**AnalystDashboardPage:** Import `fetchReceivables()`; count rows with `status === "under_review"`.

Error handling: `ReceivableError` → toast with PT message.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Analyst list shows all receivables from backend
- [ ] Detail displays parsed metadata sections
- [ ] Offer with discount % transitions to `offer` status
- [ ] Reprove transitions to `reproved` status
- [ ] No simulated scores displayed
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `src/pages/analyst/AnalystReceivablesPage.tsx` ← create
- `src/pages/analyst/AnalystReceivableDetailPage.tsx` ← create
- `src/pages/analyst/AnalystDashboardPage.tsx` ← modify
- `src/services/receivable.service.ts` ← read (Task 3)
- `src/components/analyst/AnalystReceivableOfferWizardDialog.tsx` ← read (Task 4)
- `src/pages/analyst/AnalystDuplicatasPage.tsx` ← read (migrate from)
- `src/pages/analyst/AnalystDuplicataDetailPage.tsx` ← read (migrate from)
