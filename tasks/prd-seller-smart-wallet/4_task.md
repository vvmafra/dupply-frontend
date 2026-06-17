# Task 4.0: Implement WalletContext with SDK lifecycle and provider wiring

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create `WalletContext` wrapping the `smart-account-kit` SDK with IndexedDB credential storage. Implement wallet creation, backend registration, reconnect on bootstrap, and partial-failure recovery. Mount `WalletProvider` in `main.tsx` for HTTP seller sessions only. Corresponds to techspec §4 (WalletContext).

Depends on: 1.0, 2.0, 3.0

## Requirements

- FR-6: Wallet creation uses Stellar testnet only; `network: "testnet"` in POST payload
- FR-7: Use `createWallet()` with `autoSubmit: true` and `autoFund: true` (Friendbot)
- FR-11: After SDK success, call `registerSellerWallet()` with converted payload
- FR-12: Call `refreshSeller()` after successful registration so `walletId` is non-null before redirect
- FR-13: Expose `retryBackendRegistration()` — re-POST same payload without second `createWallet()`; sync pending deploy via `kit.credentials.getPending()` if needed
- FR-15: On bootstrap when `walletId !== null`, fetch wallet and call `connectWallet({ credentialId })`
- FR-17: Never call `createWallet()` when `walletId !== null`
- FR-18: No private key or `secretEncrypted` in state, logs, or network payloads
- FR-19: Use `IndexedDBStorage` as SDK credential adapter
- FR-20: Never log `credentialId`

## Subtasks

- [ ] 4.1 Read `.cursor/rules/55-smart-account-kit.mdc` for SDK initialization and flow constraints
- [ ] 4.2 Read `src/contexts/SellerContext.tsx` to understand `refreshSeller()` and seller state shape
- [ ] 4.3 Create `src/contexts/WalletContext.tsx` with kit singleton, connection status, and context value API
- [ ] 4.4 Implement `createAndRegisterWallet()` — SDK create → buildRegisterPayload → POST → refreshSeller
- [ ] 4.5 Implement bootstrap reconnect via `fetchSellerWallet()` + `connectWallet({ credentialId })`
- [ ] 4.6 Implement `retryBackendRegistration()` with pending deploy sync and 409 handling (refreshSeller first)
- [ ] 4.7 Nest `WalletProvider` inside `SellerProvider` in `src/main.tsx` (HTTP mode + active seller session gate)
- [ ] 4.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §4 WalletContext**, **integration-spec.md → Partial-failure recovery contract**, and **55-smart-account-kit.mdc**.

```ts
const kit = new SmartAccountKit({
  rpcUrl: smartAccountEnv.rpcUrl,
  networkPassphrase: smartAccountEnv.networkPassphrase,
  accountWasmHash: smartAccountEnv.accountWasmHash,
  webauthnVerifierAddress: smartAccountEnv.webauthnVerifierAddress,
  storage: new IndexedDBStorage(),
  rpId: smartAccountEnv.rpId,
  rpName: smartAccountEnv.rpName,
});
```

On `connectWallet` failure: set `connectionStatus: "error"` and `lastConnectError` — non-blocking for navigation (FR-16 banner handled in task 7). On `409 wallet_already_exists`: refresh seller; if `walletId` now set proceed; else show escalation copy.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `WalletProvider` mounts only in HTTP seller sessions (mock mode unaffected)
- [ ] `createAndRegisterWallet()` deploys on testnet with Friendbot and registers via POST
- [ ] `createWallet()` is never called when seller already has `walletId`
- [ ] Bootstrap reconnects existing wallet via `connectWallet`
- [ ] `retryBackendRegistration()` re-POSTs without duplicate deploy
- [ ] No `credentialId` or private key in logs or persisted frontend state
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-smart-wallet/prd.md` ← read first
- `tasks/prd-seller-smart-wallet/techspec.md` ← read first
- `tasks/prd-seller-smart-wallet/integration-spec.md` ← read first
- `.cursor/rules/55-smart-account-kit.mdc` ← read
- `src/contexts/WalletContext.tsx` ← create
- `src/main.tsx` ← modify
- `src/lib/smart-account.config.ts` ← read (from task 1)
- `src/domain/wallet/wallet-payload.ts` ← read (from task 2)
- `src/services/wallet.service.ts` ← read (from task 3)
- `src/contexts/SellerContext.tsx` ← read
