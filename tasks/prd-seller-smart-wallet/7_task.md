# Task 7.0: Add reconnect banner, login navigation wiring, and final verification

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Add a dismissible reconnect banner on the seller dashboard when SDK wallet reconnect fails. Update login navigation to pass fresh `walletId` to the post-login destination helper (without adding gating logic to the login form). Run final typecheck and manual validation against the integration-spec checklist. Corresponds to techspec §8 (Reconnect failure UX) and §Impact analysis (login callers).

Depends on: 4.0, 5.0, 6.0

## Requirements

- FR-4: Login form navigates using refreshed seller state + `getPostLoginSellerDestination(status, walletId)` — no wallet gating inside login form
- FR-16: Reconnect failure shows dismissible non-blocking banner on dashboard with reconnect action; does not block route navigation in v1
- FR-15: Banner reconnect action calls `connectExistingWallet(credentialId)`
- All FRs: Final verification against integration-spec manual validation checklist

## Subtasks

- [ ] 7.1 Read `src/components/auth/MockLoginForm.tsx` — post-login navigation call sites
- [ ] 7.2 Update login navigation to await seller refresh and pass `walletId` to `getPostLoginSellerDestination()`
- [ ] 7.3 Create `src/components/seller/SellerWalletReconnectBanner.tsx` — dismissible Alert with reconnect CTA
- [ ] 7.4 Render banner in `src/pages/seller/SellerDashboardPage.tsx` when `connectionStatus === "error"` and `walletId !== null`
- [ ] 7.5 Verify reconnect banner and login redirect (manual browser check)
- [ ] 7.6 Run through integration-spec manual validation checklist
- [ ] 7.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §8 Reconnect failure UX**, **§Impact analysis**, and **integration-spec.md → Manual validation checklist**.

Banner copy (Portuguese):
- Message: "Não foi possível reconectar sua carteira. Tente novamente ou use sua passkey."
- Action: "Reconectar" → `connectExistingWallet(credentialId)`

Login form change — pass `walletId` only; do not duplicate gating:

```ts
const destination = getPostLoginSellerDestination(status, seller.walletId);
navigate(destination);
```

Future on-chain receivable actions must check `connectionStatus === "connected"` before signing — document only, no implementation in this slice.

### Manual validation checklist (from integration-spec)

- [ ] Active seller with `walletId: null` redirected to `/seller/wallet-setup`
- [ ] Passkey prompt appears; setup copy explains wallet + passkey responsibility
- [ ] Friendbot funding mentioned in UI
- [ ] POST succeeds; seller profile shows non-null `walletId`
- [ ] Second login: no setup page; SDK reconnects
- [ ] `in_review → active` while logged in triggers setup redirect
- [ ] Simulated POST failure after SDK success: retry works without duplicate deploy
- [ ] Reconnect failure shows dismissible banner; routes still accessible

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Login navigates active sellers without wallet to setup (via refreshed seller state, not login-form gating)
- [ ] Dismissible reconnect banner appears on dashboard when SDK reconnect fails
- [ ] Banner does not block navigation or sidebar
- [ ] All integration-spec manual checklist items verified
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-smart-wallet/prd.md` ← read first
- `tasks/prd-seller-smart-wallet/techspec.md` ← read first
- `tasks/prd-seller-smart-wallet/integration-spec.md` ← read first
- `src/components/seller/SellerWalletReconnectBanner.tsx` ← create
- `src/pages/seller/SellerDashboardPage.tsx` ← modify
- `src/components/auth/MockLoginForm.tsx` ← modify (pass walletId to post-login helper only)
- `src/domain/seller/seller-registration.routing.ts` ← read (from task 2)
- `src/contexts/WalletContext.tsx` ← read (from task 4)
