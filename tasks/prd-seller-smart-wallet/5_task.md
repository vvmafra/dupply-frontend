# Task 5.0: Add seller session wallet gating and route guard

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Extend `SellerContext` to redirect active sellers without a wallet to `/seller/wallet-setup` after profile refresh — including when status transitions from `in_review` to `active` during an authenticated session. Add `SellerWalletRouteGuard` to block operational seller routes until wallet registration completes. Corresponds to techspec §5 (SellerContext) and §6 (SellerWalletRouteGuard).

Depends on: 2.0, 4.0

## Requirements

- FR-1: Redirect to wallet setup when `status === "active"` and `walletId === null`
- FR-2: No wallet setup redirect for `created`, `in_review`, or `inactive` sellers
- FR-3: Block access to seller operational routes (dashboard, validation, receivables) until wallet registered
- FR-4: Wallet gating centralized in `SellerContext` + route guard — not in login form
- FR-5: When status transitions `in_review → active` with `walletId === null`, redirect to wallet setup without re-login

## Subtasks

- [ ] 5.1 Read `src/contexts/SellerContext.tsx` — existing lifecycle redirect logic after `refreshSeller()`
- [ ] 5.2 Extend seller state to expose `walletId` from mapped profile
- [ ] 5.3 Add wallet setup redirect in `refreshSeller()` when `requiresWalletSetup(status, walletId)`
- [ ] 5.4 Ensure `refreshSellerStatus()` poll path triggers same redirect on approval transition (FR-5)
- [ ] 5.5 Create `src/routes/SellerWalletRouteGuard.tsx` blocking gated paths
- [ ] 5.6 Wrap seller operational routes in `App.tsx` with `SellerWalletRouteGuard` (do not wrap `/seller/wallet-setup`)
- [ ] 5.7 Verify component renders correctly (manual browser check)
- [ ] 5.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §5 SellerContext**, **§6 SellerWalletRouteGuard**, **§9 Routes and App wiring**, and **integration-spec.md → Gating logic**.

```tsx
if (requiresWalletSetup(status, seller.walletId)) {
  navigate(ROUTES.seller.walletSetup, { replace: true });
}
```

```tsx
if (
  requiresWalletSetup(lifecycleStatus, walletId) &&
  isWalletGatedSellerPath(location.pathname)
) {
  return <Navigate to={ROUTES.seller.walletSetup} replace />;
}
```

Do **not** add wallet checks to `MockLoginForm` (FR-4). Setup page route wiring is added in task 6.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Active seller with `walletId: null` is redirected to `/seller/wallet-setup` after refresh
- [ ] Manual navigation to `/seller` or receivables routes redirects back to wallet setup
- [ ] `in_review` seller sees no wallet setup redirect (under-review UX unchanged)
- [ ] Status poll `in_review → active` with null `walletId` triggers setup redirect
- [ ] No wallet gating logic added to login form component
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-smart-wallet/prd.md` ← read first
- `tasks/prd-seller-smart-wallet/techspec.md` ← read first
- `src/contexts/SellerContext.tsx` ← modify
- `src/routes/SellerWalletRouteGuard.tsx` ← create
- `src/domain/wallet/wallet-gating.ts` ← read (from task 2)
- `src/App.tsx` ← modify (guard wrapping only)
- `src/lib/routes.ts` ← read (from task 1)
