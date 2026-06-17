# Task 2.0: Add wallet domain helpers and extend seller types/routing

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create wallet domain helpers for gating logic, POST payload conversion, and Portuguese error mapping. Extend seller types and the profile mapper to surface `walletId`, and update post-login routing to consider wallet setup eligibility. Corresponds to techspec §3 (Domain helpers).

Depends on: 1.0

## Requirements

- FR-1: Wallet setup required only when seller status is `active` **and** `walletId === null`
- FR-2: Sellers with status `created`, `in_review`, or `inactive` must not enter wallet setup
- FR-3: Define which seller operational routes are blocked until wallet registration completes
- FR-4: Post-login destination helper must accept `walletId` — gating stays out of login form logic
- FR-14: Backend wallet error codes must map to Portuguese user messages (foundation in `wallet.errors.ts`)

## Subtasks

- [ ] 2.1 Read `src/domain/seller/seller.types.ts`, `seller-profile.mapper.ts`, and `seller-registration.routing.ts`
- [ ] 2.2 Create `src/domain/wallet/wallet-gating.ts` with `requiresWalletSetup()`, gated route list, and `isWalletGatedSellerPath()`
- [ ] 2.3 Create `src/domain/wallet/wallet-payload.ts` with `publicKeyToHex()` and `buildRegisterPayload()`
- [ ] 2.4 Create `src/domain/wallet/wallet.errors.ts` with `WalletRegistrationError` and `mapWalletApiError()` (integration-spec error table)
- [ ] 2.5 Add `walletId: string | null` to `SellerCompany` and map it in `seller-profile.mapper.ts`
- [ ] 2.6 Update `getPostLoginSellerDestination(status, walletId)` to redirect active sellers without wallet to setup route
- [ ] 2.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §3 Domain helpers** and **integration-spec.md → Error mapping**.

```ts
export function requiresWalletSetup(
  status: SellerLifecycleStatus | null,
  walletId: string | null,
): boolean {
  return status === "active" && walletId === null;
}
```

```ts
export function getPostLoginSellerDestination(
  status: SellerLifecycleStatus,
  walletId: string | null,
): string {
  // active + walletId null → ROUTES.seller.walletSetup
  // active + walletId set → ROUTES.seller.dashboard
}
```

Map all backend error codes from integration-spec (`wallet_already_exists`, `seller_not_active`, `forbidden`, `validation_error`, etc.) to Portuguese messages. Do not add HTTP calls or React code in this task.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `requiresWalletSetup()` returns true only for `active` + `walletId === null`
- [ ] `SELLER_WALLET_GATED_ROUTES` covers dashboard, validation, and receivables paths
- [ ] `buildRegisterPayload()` converts `publicKey` Uint8Array to hex and sets `network: "testnet"`
- [ ] `SellerCompany.walletId` is mapped from DTO
- [ ] `getPostLoginSellerDestination` accepts and uses `walletId`
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-smart-wallet/prd.md` ← read first
- `tasks/prd-seller-smart-wallet/techspec.md` ← read first
- `tasks/prd-seller-smart-wallet/integration-spec.md` ← read first
- `src/domain/wallet/wallet-gating.ts` ← create
- `src/domain/wallet/wallet-payload.ts` ← create
- `src/domain/wallet/wallet.errors.ts` ← create
- `src/domain/seller/seller.types.ts` ← modify
- `src/domain/seller/seller-profile.mapper.ts` ← modify
- `src/domain/seller/seller-registration.routing.ts` ← modify
