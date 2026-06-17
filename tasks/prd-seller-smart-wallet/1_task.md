# Task 1.0: Add smart-account-kit dependency, env config, and wallet setup route

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Install the `smart-account-kit` npm package and centralize all Stellar/WebAuthn environment variables in a dedicated config module. Add the `/seller/wallet-setup` route constant and document required env vars in `.env.example`. Corresponds to techspec §1 (Environment and SDK config) and §9 (routes).

Depends on: none

## Requirements

- FR-9: WebAuthn `rpId` must come from env — `localhost` for local dev, `dupply-frontend.vercel.app` for production
- FR-21: Stellar/SDK configuration (RPC URL, network passphrase, WASM hash, WebAuthn verifier, network, rpId) must come from environment variables — not hardcoded in components
- FR-22: Document in `.env.example` that mainnet support and relayer integration are deferred to a future iteration

## Subtasks

- [ ] 1.1 Read `src/lib/env.ts` and an existing config module (e.g. `src/lib/routes.ts`) to match conventions
- [ ] 1.2 Add `"smart-account-kit"` to `package.json` and run install
- [ ] 1.3 Create `src/lib/smart-account.config.ts` with `smartAccountEnv` and `assertSmartAccountEnvConfigured()`
- [ ] 1.4 Add all Stellar/WebAuthn vars to `.env.example` with testnet defaults and rpId origin note
- [ ] 1.5 Add `walletSetup: "/seller/wallet-setup"` to `src/lib/routes.ts`
- [ ] 1.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §1 Environment and SDK config** and **integration-spec.md → SDK configuration (environment)**.

```ts
export const smartAccountEnv = {
  rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL as string,
  networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE as string,
  accountWasmHash: import.meta.env.VITE_ACCOUNT_WASM_HASH as string,
  webauthnVerifierAddress: import.meta.env.VITE_WEBAUTHN_VERIFIER_ADDRESS as string,
  network: (import.meta.env.VITE_STELLAR_NETWORK ?? "testnet") as "testnet",
  nativeTokenContract: import.meta.env.VITE_STELLAR_NATIVE_TOKEN_CONTRACT as string | undefined,
  rpId: import.meta.env.VITE_WEBAUTHN_RP_ID as string,
  rpName: (import.meta.env.VITE_WEBAUTHN_RP_NAME ?? "Dupply") as string,
} as const;
```

Do not hardcode contract addresses, RPC URLs, or WASM hashes anywhere else. Do not add React components or contexts in this task.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `smart-account-kit` is listed in `package.json` dependencies
- [ ] `smartAccountEnv` exports all required vars; `assertSmartAccountEnvConfigured()` validates required fields
- [ ] `.env.example` documents all Stellar/WebAuthn vars with testnet defaults and rpId origin note
- [ ] `ROUTES.seller.walletSetup` is defined
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-smart-wallet/prd.md` ← read first
- `tasks/prd-seller-smart-wallet/techspec.md` ← read first
- `tasks/prd-seller-smart-wallet/integration-spec.md` ← read first
- `package.json` ← modify
- `.env.example` ← modify
- `src/lib/smart-account.config.ts` ← create
- `src/lib/routes.ts` ← modify
