# Integration Spec — Seller Smart Wallet

**Frontend services:** `src/services/wallet.service.ts` (new), `src/services/seller.service.ts` (extend)  
**Backend base paths:** `/v1/sellers/:id/wallet`, `/v1/sellers/:id`  
**SDK:** `smart-account-kit` (npm)  
**Status:** Confirmed — backend wallet module already implemented  
**Last updated:** 2026-06-01

---

## Overview

The seller smart wallet feature connects the browser-side `smart-account-kit` SDK to existing backend wallet persistence. The backend **never** creates, funds, or signs on-chain transactions — it only stores references returned by the frontend after SDK wallet deployment.

**Canonical flow:**

1. `GET /v1/sellers/:id` → read `walletId` (null = setup required when `status === "active"`).
2. SDK `createWallet()` → WebAuthn passkey + Soroban deploy on testnet + Friendbot funding.
3. `POST /v1/sellers/:id/wallet` → persist wallet + update `seller.walletId`.
4. Subsequent sessions: SDK `connectWallet({ credentialId })` using IndexedDB session + backend `GET /v1/sellers/:id/wallet` as needed.

HTTP mode (`VITE_USE_MOCKS=false`) is the only supported integration path for this feature. Mock wallet simulation is out of scope.

Reference: [prd.md](./prd.md), backend [wallet module PRD](../../../dupply-backend/tasks/prd-wallet-module/prd.md)

---

## Endpoint map

| # | Method | Path | Auth | Request body | Response body | Frontend function |
|---|--------|------|------|-------------|---------------|-------------------|
| 1 | GET | `/v1/sellers/:id` | Bearer | — | `SellerPublicViewDTO` (includes `walletId`) | `fetchCurrentSellerWithStatus()` (existing) |
| 2 | POST | `/v1/sellers/:id/wallet` | Bearer | `RegisterSellerWalletRequestDTO` | `WalletPublicViewDTO` (`201`) | `registerSellerWallet()` (new) |
| 3 | GET | `/v1/sellers/:id/wallet` | Bearer | — | `WalletPublicViewDTO` | `fetchSellerWallet()` (new) |

**Not used in this slice:**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/v1/wallets/:id` | Admin/seller read by wallet ID — future admin UI |
| PATCH | `/v1/wallets/:id/status` | Admin activate/deactivate — out of scope |

**Auth resolution:** seller ID from JWT claim `profileId`. `POST` and `GET` wallet routes require the authenticated seller to own `:id` (`actor.profileId === seller.id`).

---

## SDK → backend field mapping

After `createWallet()` succeeds:

| SDK field (`CreateWalletResult`) | Backend POST field | DB column | Notes |
|----------------------------------|-------------------|-----------|-------|
| `contractId` | `contractId` | `wallets.address` | Soroban `C...` address |
| `credentialId` | `credentialId` | `wallets.credential_id` | base64url passkey ID — do not log |
| `publicKey` (`Uint8Array`, 65-byte secp256r1) | `signerPublicKey` | `wallets.signer_public_key` | Frontend converts to **hex string** before POST |
| _(frontend env)_ | `network` | `wallets.network` | Always `"testnet"` in v1 |
| tx hash from submit result | `createdTxHash` (optional) | `wallets.created_tx_hash` | From SDK submission / `TransactionResult.hash` |

Backend sets automatically on insert:

- `type`: `"smart_account"`
- `parentType`: `"seller"`
- `status`: `"active"`
- `sellerId`: from route param
- Updates `sellers.walletId` in same transaction

---

## DTO definitions

Transport types live in `src/services/wallet.dto.ts` (create). Mirror backend `WalletPublicView` and route schemas from `dupply-backend/src/routes/v1/wallets.ts`.

```ts
export type WalletNetworkDTO = "testnet" | "mainnet";
export type WalletStatusDTO = "active" | "inactive";

export type RegisterSellerWalletRequestDTO = {
  contractId: string;
  credentialId: string;
  signerPublicKey: string; // hex-encoded secp256r1 public key
  network: WalletNetworkDTO; // "testnet" in v1
  createdTxHash?: string;
};

export type WalletPublicViewDTO = {
  id: string;
  status: WalletStatusDTO;
  network: WalletNetworkDTO;
  address: string; // same as contractId
  type: "smart_account";
  credentialId: string;
  signerPublicKey: string;
  createdTxHash: string | null;
  parentType: "seller";
  sellerId: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
};

export type WalletErrorBodyDTO = {
  error:
    | "wallet_not_found"
    | "seller_not_found"
    | "forbidden"
    | "seller_not_active"
    | "wallet_already_exists"
    | "validation_error"
    | "invalid_wallet_status"
    | "unauthorized";
};
```

**Seller profile signal (existing):**

```ts
// src/services/seller.dto.ts — already present
walletId: string | null; // null → wallet setup required when status === "active"
```

---

## Error mapping

| HTTP | Backend `error` | When | Portuguese message (suggested) |
|------|-----------------|------|--------------------------------|
| 403 | `seller_not_active` | Seller status ≠ `active` | "Seu cadastro ainda não foi aprovado." |
| 403 | `forbidden` | Wrong seller / actor | "Você não tem permissão para esta operação." |
| 404 | `seller_not_found` | Invalid seller ID | "Cadastro não encontrado." |
| 409 | `wallet_already_exists` | Active wallet already registered for network | "Esta carteira já está vinculada à sua conta." |
| 400 | `validation_error` | Invalid payload (address format, missing fields) | "Dados da carteira inválidos. Tente novamente." |
| 401 | `unauthorized` | Missing/invalid token | Handled by global auth layer |

For FR-13 recovery: on transient 5xx after successful SDK deploy, show retry-oriented copy — e.g. "Carteira criada na rede, mas não vinculada. Tente novamente."

---

## SDK configuration (environment)

Required Vite env vars (names finalized in Tech Spec):

| Variable | Purpose | v1 value |
|----------|---------|----------|
| `VITE_STELLAR_RPC_URL` | Soroban RPC | Testnet RPC URL |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | Network identity | `Test SDF Network ; September 2015` |
| `VITE_ACCOUNT_WASM_HASH` | Smart account WASM | From smart-account-kit demo defaults |
| `VITE_WEBAUTHN_VERIFIER_ADDRESS` | WebAuthn verifier contract | Testnet deployed address |
| `VITE_STELLAR_NETWORK` | Sent to backend POST | `testnet` |
| `VITE_WEBAUTHN_RP_ID` | WebAuthn relying party | `dupply-frontend.vercel.app` (prod); `localhost` for local dev |
| `VITE_WEBAUTHN_RP_NAME` | Display name in passkey prompt | `Dupply` |

**Deferred (mainnet / relayer — note only):**

- `VITE_RELAYER_URL` — fee sponsoring; not used in v1
- Mainnet passphrase, WASM hash, verifier — future env profile

**Friendbot (testnet funding):**

SDK `createWallet(..., { autoSubmit: true, autoFund: true, nativeTokenContract })` — no backend involvement. `nativeTokenContract` from env or smart-account-kit testnet defaults.

---

## Gating logic (integration contract)

```
IF seller.status !== "active" → no wallet flow
IF seller.status === "active" AND seller.walletId === null → redirect /seller/wallet-setup (block operational routes)
IF seller.status === "active" AND seller.walletId !== null → connectWallet on bootstrap; allow operational routes
```

Trigger sources:

- Session restore + seller refresh (`SellerProvider`)
- HTTP login completion (via shared seller refresh — not login form)
- Status poll detects `in_review` → `active` with `walletId === null`

---

## Partial-failure recovery contract

| State | Action |
|-------|--------|
| SDK deploy succeeded; POST failed (5xx/network) | Retry POST with same payload from SDK result / local credential state; do **not** call `createWallet()` again |
| SDK deploy pending in IndexedDB | Use `kit.credentials.getPending()` + `deploy()` or sync before retry POST — Tech Spec |
| POST 409 `wallet_already_exists` | Refresh seller profile; if `walletId` now set → proceed to dashboard; else escalate (Open Question) |
| SDK deploy failed | Show error; allow user to retry `createWallet()` |

---

## Security notes

- `secretEncrypted` never sent or received by frontend.
- `credentialId` is not a secret but must not be logged.
- `signerPublicKey` and `address` (`contractId`) are public on-chain data — safe in API responses.
- WebAuthn requires secure context; production `rpId` = `dupply-frontend.vercel.app`.

---

## Backend confirmation checklist

Backend wallet module already provides:

- [x] `wallets` table + `sellers.walletId` FK
- [x] `POST /v1/sellers/:id/wallet` with atomic seller update
- [x] `GET /v1/sellers/:id/wallet`
- [x] Domain validation: `smart_account` invariants, one active wallet per seller per network
- [x] Policies: seller must be `active`, own profile, `walletId === null` at registration

**No backend changes required for frontend MVP.**

---

## Manual validation checklist

- [ ] Active seller with `walletId: null` redirected to `/seller/wallet-setup`
- [ ] Passkey prompt appears; setup copy explains wallet + passkey responsibility
- [ ] Friendbot funding mentioned in UI; wallet receives testnet XLM
- [ ] POST succeeds; seller profile shows non-null `walletId`
- [ ] Second login: no setup page; SDK reconnects
- [ ] `in_review` → `active` while logged in triggers setup redirect
- [ ] Simulated POST failure after SDK success: retry works without duplicate deploy
- [ ] `npm run typecheck` passes
