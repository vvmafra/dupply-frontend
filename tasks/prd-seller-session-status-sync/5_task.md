# Task 5.0: Migrate seller pages to useSeller() for capability gates

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Replace per-page `useEffect` + `fetchCurrentSeller()` on mount with `useSeller()` so dashboard, validation, receivables list, and new receivable pages reflect the latest backend lifecycle status without hard refresh. After validation updates on `SellerValidationPage`, call `refreshSeller()`. Corresponds to techspec §6 (seller pages).

Depends on: 2.0

## Requirements

- FR-10: Seller pages that loaded profile once on mount must consume shared seller state or trigger shared refresh
- FR-13: `canSellerRegisterReceivables(seller)` on `NewReceivablePage` reacts when shared `seller` updates to `active`
- All four PRD-listed seller routes migrated (not gates-only)

## Subtasks

- [ ] 5.1 Read each seller page's current `fetchCurrentSeller` / loading / error pattern
- [ ] 5.2 Update `SellerDashboardPage.tsx` to use `useSeller()`
- [ ] 5.3 Update `SellerValidationPage.tsx` — `refreshSeller()` after `updateSellerValidationStatus`
- [ ] 5.4 Update `SellerReceivablesPage.tsx` to use `useSeller()`
- [ ] 5.5 Update `NewReceivablePage.tsx` — gate from shared `seller`
- [ ] 5.6 Verify receivable registration enables after in-session approval (manual browser check)
- [ ] 5.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §6 Seller pages**.

Shared pattern:

```tsx
const { seller, isLoading, fetchError, refreshSeller } = useSeller();

useEffect(() => {
  if (!seller && !isLoading && !fetchError) void refreshSeller();
}, [seller, isLoading, fetchError, refreshSeller]);

if (isLoading && !seller) return <Skeleton />;
if (fetchError && !seller) return <RetryUI onRetry={() => void refreshSeller()} />;
```

| File | Change |
|------|--------|
| `SellerDashboardPage.tsx` | Replace mount fetch with `useSeller()` |
| `SellerValidationPage.tsx` | Same + `refreshSeller()` after validation PATCH |
| `SellerReceivablesPage.tsx` | Same |
| `NewReceivablePage.tsx` | `canSellerRegisterReceivables(seller)` from context |

Do not change `SellerRegistrationPage` wizard hydration (`loadSellerRegistrationState`) — orthogonal per techspec impact analysis.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] All four seller pages use `useSeller()` instead of isolated mount fetch
- [ ] New receivable gate updates when shared seller becomes `active` without hard refresh
- [ ] Validation page refreshes shared profile after status update
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-session-status-sync/prd.md` ← read first
- `tasks/prd-seller-session-status-sync/techspec.md` ← read first
- `src/pages/seller/SellerDashboardPage.tsx` ← modify
- `src/pages/seller/SellerValidationPage.tsx` ← modify
- `src/pages/seller/SellerReceivablesPage.tsx` ← modify
- `src/pages/seller/NewReceivablePage.tsx` ← modify
- `src/contexts/SellerContext.tsx` ← read
- `src/domain/seller/seller-receivable-access.ts` ← read (if exists)
