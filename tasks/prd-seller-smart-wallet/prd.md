# Product Requirements Document — Seller Smart Wallet Onboarding

**Status:** Draft — follows Seller Session Status Sync and backend Seller Wallet Module; introduces frontend `smart-account-kit` integration for passkey-secured Stellar smart accounts

## Overview

Approved sellers (`status = active`) need a self-custodied Stellar smart account to participate in on-chain receivable operations. The backend already persists wallet references (`contractId`, `credentialId`, `signerPublicKey`) via `POST /v1/sellers/:id/wallet` and exposes `seller.walletId` on the seller profile. The frontend does not yet integrate the `smart-account-kit` SDK or enforce wallet creation after approval.

This feature adds blocking smart-wallet onboarding for active sellers who have not yet registered a wallet (`walletId == null`). On first eligible session — including when lifecycle status transitions from `in_review` to `active` while already logged in — the seller is redirected to a dedicated setup page, guided through WebAuthn passkey registration, wallet deployment on Stellar testnet (with Friendbot funding), and backend registration. Subsequent sessions reconnect via the SDK without creating a new wallet.

Wallet gating is centralized in seller session bootstrap and route guards — not in the login form component. HTTP mode is the canonical integration path; mock-mode shortcuts are out of scope for this feature.

## Goals

- Enable every approved seller to create a passkey-secured Stellar smart account on first eligible login without managing private keys manually.
- Block access to operational seller routes until wallet registration completes successfully (blocking gate).
- Persist wallet references in the backend atomically after on-chain creation via existing wallet endpoints.
- Reconnect sellers to their existing wallet on subsequent sessions using stored SDK credentials.
- Provide clear Portuguese UX explaining wallet creation, passkey responsibility, and testnet Friendbot funding during the setup flow.
- Detect wallet need when seller status becomes `active` during an in-session approval transition.

**Success metrics:**

- Every seller with `status = active` and `walletId == null` is redirected to wallet setup before accessing seller operational routes.
- After successful setup, `seller.walletId` is non-null in the backend and the seller reaches the dashboard without manual refresh.
- Sellers with an existing wallet reconnect via passkey (or silent SDK session restore) on subsequent visits without creating a duplicate wallet.
- Partial failures (on-chain success, backend registration failure) can be retried without leaving the seller permanently stuck.
- `npm run typecheck` passes with zero errors after implementation.

## User Stories

- As an **approved seller logging in for the first time**, I want to be guided to create my secure wallet with my device's biometrics so that I can use the platform without handling blockchain keys.
- As an **approved seller**, I want clear explanation during passkey registration that a wallet is being created and that I am responsible for keeping my passkey to access it so that I understand the security model.
- As an **approved seller**, I want my testnet wallet funded automatically so that I can proceed without acquiring XLM manually.
- As an **approved seller returning later**, I want my wallet session restored so that I do not repeat wallet creation.
- As an **approved seller whose status just changed to active while I am logged in**, I want to be prompted for wallet setup immediately so that I am not blocked by a stale session state.
- As a **seller who completed on-chain wallet creation but whose backend registration failed**, I want to retry registration so that my wallet is linked without creating a duplicate on-chain account.

**Main flow — first eligible session (login or restore):**

1. Seller authenticates; seller lifecycle status is `active`.
2. Frontend loads seller profile; `walletId == null`.
3. Seller is redirected to `/seller/wallet-setup` (blocking gate on all other seller operational routes).
4. Setup page explains: a digital wallet is being created, secured by passkey (biometrics/PIN), and the seller is responsible for managing that passkey to access the wallet.
5. Seller initiates creation; browser prompts WebAuthn passkey registration.
6. SDK deploys Soroban smart account on **testnet** with `autoFund: true` (Friendbot); UI shows that testnet XLM funding is automatic via Friendbot.
7. Frontend sends `{ contractId, credentialId, signerPublicKey, network: "testnet", createdTxHash? }` to `POST /v1/sellers/:id/wallet`.
8. Backend persists wallet and sets `seller.walletId`.
9. Seller is redirected to seller dashboard; operational routes become accessible.

**Main flow — subsequent sessions:**

1. Seller authenticates; `walletId != null`.
2. Frontend initializes SDK and calls `connectWallet({ credentialId })` (or silent restore from IndexedDB session).
3. Seller may be prompted for passkey if session expired.
4. Seller proceeds to seller area without wallet setup page.

**Main flow — approval while logged in (`in_review` → `active`):**

1. Seller is authenticated with status `in_review`; under-review restrictions visible.
2. Admin approves seller; backend status becomes `active`.
3. Existing seller status polling detects transition; shared seller state refreshes.
4. Frontend detects `active` + `walletId == null` → redirect to `/seller/wallet-setup`.
5. Wallet creation flow proceeds as in main flow above.

**Recovery flow — on-chain success, backend failure:**

1. SDK returns `{ contractId, credentialId, publicKey, createdTxHash }` but `POST /v1/sellers/:id/wallet` fails.
2. Setup page shows recoverable error in Portuguese with retry action.
3. Retry re-submits registration payload without calling `createWallet()` again when local SDK state indicates deployment already completed.
4. On success, seller proceeds to dashboard.

## Core Features

1. **Blocking wallet setup gate**
   - What it does: When seller is `active` and `walletId == null`, redirect to dedicated setup page and block other seller operational routes until registration completes.
   - Why it matters: Ensures every operational seller has a registered on-chain identity before using receivable features.

2. **Passkey-secured wallet creation via smart-account-kit**
   - What it does: Initialize SDK with environment config; call `createWallet()` with WebAuthn; deploy smart account on testnet with Friendbot auto-funding.
   - Why it matters: Delivers self-custody without exposing private keys to backend or browser storage beyond passkey credentials.

3. **Backend wallet registration**
   - What it does: After SDK success, register wallet via existing `POST /v1/sellers/:id/wallet` with converted payload fields.
   - Why it matters: Links on-chain contract to seller record for platform operations.

4. **Wallet session reconnect**
   - What it does: On sessions where `walletId != null`, connect SDK wallet silently or via passkey prompt; no duplicate creation.
   - Why it matters: Seamless return visits without redundant on-chain deployments.

5. **Lifecycle-triggered setup**
   - What it does: When seller status transitions to `active` during an active session and `walletId == null`, trigger the same blocking setup redirect.
   - Why it matters: Covers approval-while-logged-in without requiring re-login.

6. **Educational setup UX**
   - What it does: Portuguese copy during setup explaining wallet creation, passkey custody responsibility, and testnet Friendbot funding.
   - Why it matters: Sets correct expectations for non-technical sellers.

7. **Partial-failure recovery**
   - What it does: Allow retry of backend registration when on-chain wallet already exists locally in SDK storage.
   - Why it matters: Prevents sellers stuck after transient API errors.

## Functional Requirements

### Eligibility and gating

1. FR-1: Wallet setup must be required only when seller lifecycle status is `active` **and** `walletId == null`.
2. FR-2: Sellers with status `created`, `in_review`, or `inactive` must not enter wallet setup.
3. FR-3: When FR-1 applies, the seller must be redirected to `/seller/wallet-setup` before accessing seller operational routes (dashboard, validation, receivables).
4. FR-4: Wallet gating logic must be centralized in seller session bootstrap and route guards — not in the login form component.
5. FR-5: When seller status transitions from `in_review` to `active` during an authenticated session and `walletId == null`, the system must redirect to wallet setup without requiring re-login.

### Wallet creation (testnet)

6. FR-6: Wallet creation must use Stellar **testnet** only in this version; `network` sent to backend must be `"testnet"`.
7. FR-7: Wallet creation must use `smart-account-kit` `createWallet()` with `autoSubmit: true` and `autoFund: true` (Friendbot) on testnet.
8. FR-8: The setup UI must inform the seller that testnet XLM funding is automatic via Friendbot before or during the creation step.
9. FR-9: WebAuthn `rpId` must be configured for production as `dupply-frontend.vercel.app`; local development must use an explicitly documented `rpId` override (Tech Spec).
10. FR-10: The setup UI must explain during passkey registration that (a) a digital wallet is being created and (b) the seller is responsible for managing their passkey to access that wallet.

### Backend registration

11. FR-11: After successful SDK wallet creation, the frontend must call `POST /v1/sellers/:id/wallet` with `contractId`, `credentialId`, `signerPublicKey` (hex-encoded from SDK `publicKey`), `network: "testnet"`, and optional `createdTxHash`.
12. FR-12: On successful registration (`201`), shared seller state must refresh so `walletId` is non-null before leaving setup.
13. FR-13: On registration failure after on-chain success, the setup page must show a recoverable Portuguese error and offer retry without creating a duplicate on-chain wallet when SDK local state indicates deployment already completed.
14. FR-14: Backend error codes (`wallet_already_exists`, `seller_not_active`, `forbidden`, etc.) must surface as Portuguese user messages.

### Subsequent sessions

15. FR-15: When `walletId != null`, the frontend must connect the SDK wallet on seller session bootstrap (`connectWallet` with stored credential or silent session restore).
16. FR-16: Wallet reconnect failure must not block seller navigation to non-on-chain pages in v1, but on-chain operations (future) must require connected wallet — document behavior in Tech Spec.
17. FR-17: The frontend must never call `createWallet()` when `walletId != null`.

### Security and data handling

18. FR-18: No seller private key or `secretEncrypted` value may be stored, logged, or transmitted by the frontend.
19. FR-19: SDK credential storage must use IndexedDB adapter (`IndexedDBStorage`) by default.
20. FR-20: `credentialId` must not appear in application logs or error reports.

### Configuration

21. FR-21: Stellar/SDK configuration (RPC URL, network passphrase, WASM hash, WebAuthn verifier address, network, rpId) must come from environment variables — not hardcoded in components.
22. FR-22: PRD and setup UX must include an explicit note that mainnet support, mainnet funding strategy, and relayer integration are deferred to a future iteration.

## Personas & Scope

- **Personas affected:** `seller` only
- **Pages/routes touched:**
  - New: `/seller/wallet-setup` (dedicated blocking setup page)
  - Seller route guards (dashboard, validation, receivables)
  - Seller session bootstrap (`SellerProvider` / seller context)
- **Integration with backend:** yes — uses existing wallet module endpoints; see `integration-spec.md`
- **Depends on:**
  - Backend Seller Wallet Module (`POST/GET /v1/sellers/:id/wallet`, `sellers.walletId`)
  - Seller Session Status Sync (reliable `active` status and in-session transition detection)
  - Seller Profile Integration (`walletId` on `SellerPublicViewDTO`)
  - Auth Login Persistence (session restore, JWT `profileId`)

## Technical Constraints

- New external library required and justified: `smart-account-kit` (npm) for WebAuthn smart account lifecycle.
- Testnet only; mainnet deferred with documented migration note.
- HTTP mode is the canonical path; mock-mode wallet simulation is out of scope.
- Must pass `npm run typecheck` with zero errors.
- Must preserve existing auth, profile selection, seller lifecycle routing, and under-review UX except where wallet gate applies to `active` sellers.
- Must follow service adapter pattern for wallet HTTP calls.
- User-facing messages must remain in Portuguese.
- WebAuthn requires secure context (HTTPS or localhost); deployment domain constraints apply.
- Component, context, hook, env var, and SDK wrapper design belong in the Tech Spec — not this PRD.

## Out of Scope

- Mainnet deployment, mainnet auto-funding, and mainnet environment configuration (future iteration — note only in FR-22).
- Relayer / fee-sponsored (gasless) transactions.
- Multi-device passkey recovery or backup signer flows.
- On-chain receivable signing, token transfers, or `signAndSubmit` business operations (future receivables + wallet slice).
- Admin wallet management UI.
- Backend API or schema changes (existing wallet module is sufficient).
- Mock-mode wallet shortcuts or demo wallet bypass in production flows.
- Automated E2E tests — post-MVP; manual validation checklist + typecheck gate.
- Renaming legacy `MockLoginForm` component (may be addressed in Tech Spec as cleanup, not a product requirement).

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Exact Portuguese copy for wallet setup page, passkey responsibility disclaimer, and Friendbot funding notice | Product / Design | **Open** |
| Local dev `rpId` when not on `dupply-frontend.vercel.app` (e.g. `localhost` vs tunnel) | Engineering | **Open** — FR-9 |
| Should SDK `connectWallet` failure show a dismissible banner or blocking modal on dashboard? | Product | **Open** — FR-16 |
| Internal QA "wildcard" demo wallet or pre-seeded test seller — dev/staging only? | Engineering | **Open** — optional escape hatch, not production |
| Retry strategy when `wallet_already_exists` (409) but seller `walletId` still null (data inconsistency) | Engineering | **Open** — FR-13 edge case |
| Minimum browser support matrix for WebAuthn (Safari iOS, Chrome Android, desktop) | Product | **Open** |
