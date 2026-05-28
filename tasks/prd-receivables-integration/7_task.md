# Task 7.0: Migrate routes, navigation, and delete legacy duplicata stack

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Switch application routing to canonical `/seller/receivables/*` and `/analyst/receivables/*` paths with redirects from legacy `/duplicatas/*`, update nav/shell links, and delete the mock duplicata stack once all seller/analyst flows use the new module. Leave admin/confirmation legacy EN receivable demo untouched. Corresponds to techspec Component design §18–19 and integration-spec migration Phases B–D.

Depends on: 5.0, 6.0

## Requirements

- FR-1: No `duplicata` naming remains in active seller/analyst module code
- FR-2: Seller/analyst paths have zero imports from deleted `domain/duplicata/*` or legacy EN demo types
- FR-3: `ConfirmationPage`, `AdminReceivablesPage`, `receivables.service.ts` (EN demo) unchanged
- FR-12: Replace all `canSellerRegisterDuplicatas` imports with `canSellerRegisterReceivables`

## Subtasks

- [ ] 7.1 Read `src/lib/routes.ts`, `src/App.tsx`, and nav/shell components for duplicata links
- [ ] 7.2 Add canonical receivable routes and `<Navigate>` redirects from `/duplicatas/*`
- [ ] 7.3 Update sidebar/nav links to receivable paths and labels
- [ ] 7.4 Delete legacy duplicata files (service, domain, mocks, components, old pages)
- [ ] 7.5 Grep seller/analyst paths — fix any remaining `duplicata` imports
- [ ] 7.6 Verify navigation and redirects in browser
- [ ] 7.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §18–19** and **integration-spec.md → Migration plan (Phases B–D)**.

**routes.ts:**

```ts
seller: {
  receivables: {
    list: "/seller/receivables",
    new: "/seller/receivables/new",
    detail: (id: string) => `/seller/receivables/${id}`,
  },
},
analyst: {
  receivables: {
    list: "/analyst/receivables",
    detail: (id: string) => `/analyst/receivables/${id}`,
  },
},
```

**App.tsx:** Register `SellerReceivablesPage`, `NewReceivablePage`, `AnalystReceivablesPage`, `AnalystReceivableDetailPage`. Add redirects:

```tsx
<Route path="/seller/duplicatas/*" element={<Navigate to="/seller/receivables" replace />} />
<Route path="/analyst/duplicatas/*" element={<Navigate to="/analyst/receivables" replace />} />
```

**Delete after migration:**

- `src/services/duplicata.service.ts`
- `src/domain/duplicata/*`
- `src/data/duplicatas.mock.ts`, `duplicata-demo.mock.ts`
- `src/components/duplicata/*`
- `src/domain/seller/seller-duplicata-access.ts`
- Old `*Duplicata*` pages/components once replacements are wired

**Keep (out of scope):**

- `src/domain/receivables/*`, `src/services/receivables.service.ts`
- `src/pages/admin/AdminReceivablesPage.tsx`, `ConfirmationPage`

Verification grep:

```bash
rg -l "duplicata" src/pages/seller src/pages/analyst src/components/seller src/components/analyst src/components/forms
```

Expected: zero matches after cleanup.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Canonical routes work for seller and analyst receivables
- [ ] Legacy `/duplicatas/*` URLs redirect correctly
- [ ] All duplicata mock files deleted; no broken imports in seller/analyst
- [ ] Admin and confirmation pages still build and run
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `src/lib/routes.ts` ← modify
- `src/App.tsx` ← modify
- Nav/shell components ← modify (links)
- `src/services/duplicata.service.ts` ← delete
- `src/domain/duplicata/*` ← delete
- `src/data/duplicatas.mock.ts` ← delete
- `src/data/duplicata-demo.mock.ts` ← delete
- `src/components/duplicata/*` ← delete
- Old `*Duplicata*` pages/components ← delete
