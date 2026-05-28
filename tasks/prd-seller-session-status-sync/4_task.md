# Task 4.0: Wire AppShell polling and seller login via shared seller state

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Replace `AppShell` local seller status state with `useSeller()` polling so `in_review` → `active` transitions update shared context and lift the under-review overlay without hard refresh. Refactor `MockLoginForm` seller HTTP login to use `refreshSeller()` and `getPostLoginSellerDestination()` instead of duplicating status fetch logic. Corresponds to techspec §5 (`AppShell`) and §4 (`MockLoginForm`).

Depends on: 2.0, 3.0

## Requirements

- FR-11: While `in_review`, continue periodic backend status checks via shared `refreshSellerStatus`
- FR-12: Transition `in_review` → `active` removes overlay without navigation or hard refresh
- FR-13: Capability flags update when status becomes `active` (via shared `refreshSeller` in context)
- FR-14: Keep polling interval at `30_000` ms (`SELLER_STATUS_POLL_MS`)
- FR-15: HTTP seller login uses same lifecycle routing as restore for all statuses
- FR-16: Login and restore rely on shared refresh path — remove duplicate direct status handling in login form where possible

## Subtasks

- [ ] 4.1 Read `src/components/layout/AppShell.tsx` — local `sellerStatus` and polling
- [ ] 4.2 Replace with `useSeller().lifecycleStatus` and `refreshSellerStatus` interval when `in_review`
- [ ] 4.3 Remove local state and direct `fetchSellerBackendStatus` import from AppShell
- [ ] 4.4 Read `src/components/auth/MockLoginForm.tsx` — seller HTTP login branch
- [ ] 4.5 After `loginWithSession` + `setProfile("seller")`, `await refreshSeller()` then navigate via `getPostLoginSellerDestination`
- [ ] 4.6 On `refreshSeller` failure: toast + navigate dashboard without assuming `active`
- [ ] 4.7 Verify overlay lifts after simulated approval (manual browser check)
- [ ] 4.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §5 `AppShell`** and **§4 `MockLoginForm`**.

AppShell:

```tsx
const SELLER_STATUS_POLL_MS = 30_000;

const { lifecycleStatus, refreshSellerStatus } = useSeller();

useEffect(() => {
  if (lifecycleStatus !== "in_review") return;
  const id = globalThis.setInterval(() => void refreshSellerStatus(), SELLER_STATUS_POLL_MS);
  return () => globalThis.clearInterval(id);
}, [lifecycleStatus, refreshSellerStatus]);

const isUnderReview = lifecycleStatus === "in_review";
```

Login form (HTTP seller):

```ts
loginWithSession(result.session);
setProfile("seller");
await refreshSeller();
const status = /* useSeller().lifecycleStatus */;
const dest = getPostLoginSellerDestination(status!);
navigate(fromPath && status !== "created" ? fromPath : dest, { replace: true });
```

`SellerProvider` must wrap the router tree (task 2) so `useSeller()` works in `MockLoginForm`.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Under-review overlay driven by shared `lifecycleStatus`
- [ ] Polling at 30s updates shared state on status change
- [ ] Seller login navigates via `getPostLoginSellerDestination` for all statuses
- [ ] No duplicate status-fetch logic left in login form beyond restore bootstrapping
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-session-status-sync/prd.md` ← read first
- `tasks/prd-seller-session-status-sync/techspec.md` ← read first
- `src/components/layout/AppShell.tsx` ← modify
- `src/components/auth/MockLoginForm.tsx` ← modify
- `src/contexts/SellerContext.tsx` ← read
- `src/domain/seller/seller-registration.routing.ts` ← read
