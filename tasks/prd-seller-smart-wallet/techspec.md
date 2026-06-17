# Tech Spec — Seller Smart Wallet Onboarding

## Overview

This spec implements blocking smart-wallet onboarding for **active sellers with `walletId === null`**: a dedicated setup page (`/seller/wallet-setup`), WebAuthn passkey registration and Soroban smart-account deployment via `smart-account-kit` on Stellar **testnet** (Friendbot auto-funding), backend registration through existing `POST /v1/sellers/:id/wallet`, and SDK reconnect on subsequent sessions.

**In scope:** HTTP mode only (`resolveApiMode() === "http"`), seller persona, centralized gating in `SellerContext` + route guard, partial-failure recovery (on-chain success, POST failure).

**Out of scope:** mock wallet simulation, mainnet/relayer, on-chain signing for receivables, admin wallet UI, backend changes, automated E2E tests. Mainnet migration is noted in setup UX copy only (FR-22).

Reference: [prd.md](./prd.md), [integration-spec.md](./integration-spec.md).

---

## Architecture overview

Layers touched and interaction:

```
UI (pages/seller/ + components/seller/)
  └── SellerWalletSetupPage, SellerWalletRouteGuard, optional reconnect banner
  └── consumes WalletContext + SellerContext + wallet.service

Contexts (contexts/)
  └── SellerContext — seller profile, lifecycleStatus, walletId, gating redirect
  └── WalletContext — SmartAccountKit singleton, connect/create, recovery state

Services (services/)
  └── wallet.service.ts — registerSellerWallet(), fetchSellerWallet() (HTTP-only)
  └── seller.service.ts — unchanged public API; walletId surfaced via mapper

Domain (domain/wallet/, domain/seller/)
  └── wallet-gating.ts — requiresWalletSetup(), isWalletOperationalRoute()
  └── wallet.errors.ts — WalletRegistrationError + PT messages
  └── wallet-payload.ts — publicKey Uint8Array → hex, buildRegisterPayload()
  └── seller.types.ts — add walletId to SellerCompany

Lib (lib/)
  └── smart-account.config.ts — Stellar/WebAuthn env vars (FR-21)
  └── routes.ts — ROUTES.seller.walletSetup
  └── env.ts — unchanged adapter gate
```

**Provider tree (main.tsx):**

```
AuthProvider
  └── SellerProvider
        └── WalletProvider   ← new; only active in HTTP seller sessions
              └── App
```

`WalletProvider` mounts only when `resolveApiMode() === "http"` and seller session is active (same gate as `SellerContextProvider`), so mock mode is unaffected.

---

## Component design

### 1. Environment and SDK config

**File:** `src/lib/smart-account.config.ts` (new)

Centralizes all Stellar/WebAuthn env vars (FR-21). Components and contexts must not hardcode RPC, WASM hash, or verifier addresses.

```ts
import { env as stellarEnv } from "@/lib/env"; // re-export stellar block only

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

export function assertSmartAccountEnvConfigured(): void {
  const required = [
    smartAccountEnv.rpcUrl,
    smartAccountEnv.networkPassphrase,
    smartAccountEnv.accountWasmHash,
    smartAccountEnv.webauthnVerifierAddress,
    smartAccountEnv.rpId,
  ];
  if (required.some((v) => !v)) {
    throw new Error("Smart account environment is not fully configured.");
  }
}
```

**Files:** `.env.example` — add all vars with testnet defaults and comments.

| Variable | v1 value |
|----------|----------|
| `VITE_STELLAR_RPC_URL` | Soroban testnet RPC |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |
| `VITE_ACCOUNT_WASM_HASH` | smart-account-kit testnet default |
| `VITE_WEBAUTHN_VERIFIER_ADDRESS` | testnet deployed verifier |
| `VITE_STELLAR_NETWORK` | `testnet` |
| `VITE_WEBAUTHN_RP_ID` | `localhost` (local dev); `dupply-frontend.vercel.app` (prod) |
| `VITE_WEBAUTHN_RP_NAME` | `Dupply` |
| `VITE_STELLAR_NATIVE_TOKEN_CONTRACT` | optional; SDK testnet default if omitted |

**FR-9 / FR-21:** Document in `.env.example` that `VITE_WEBAUTHN_RP_ID` must match the page origin (WebAuthn requirement). Production Vercel deploy sets `dupply-frontend.vercel.app`; local dev uses `localhost`.

---

### 2. Wallet DTOs and service

**File:** `src/services/wallet.dto.ts` (new)

Mirror backend types from integration-spec (unchanged).

**File:** `src/services/wallet.service.ts` (new)

HTTP-only — no mock branch (integration-spec: mock wallet out of scope).

```ts
import { apiRequest, ApiError } from "@/lib/api-client";
import { resolveApiMode } from "@/lib/env";
import { getAccessToken } from "@/lib/token-storage";
import { getSellerProfileIdFromToken } from "@/domain/auth/auth-jwt";
import {
  WalletRegistrationError,
  mapWalletApiError,
} from "@/domain/wallet/wallet.errors";
import type {
  RegisterSellerWalletRequestDTO,
  WalletPublicViewDTO,
} from "./wallet.dto";

function resolveSellerIdFromSession(): string {
  const token = getAccessToken();
  if (!token) throw new WalletRegistrationError("missing_session", "Sua sessão expirou. Faça login novamente.");
  const profileId = getSellerProfileIdFromToken(token);
  if (!profileId) throw new WalletRegistrationError("missing_seller_profile", "Não foi possível identificar seu perfil de vendedor.");
  return profileId;
}

export async function registerSellerWallet(
  payload: RegisterSellerWalletRequestDTO,
): Promise<WalletPublicViewDTO> {
  if (resolveApiMode() !== "http") {
    throw new WalletRegistrationError("http_only", "Cadastro de carteira requer conexão com o servidor.");
  }
  const sellerId = resolveSellerIdFromSession();
  try {
    return await apiRequest<WalletPublicViewDTO>(`/v1/sellers/${sellerId}/wallet`, {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    throw mapWalletApiError(error);
  }
}

export async function fetchSellerWallet(): Promise<WalletPublicViewDTO> {
  if (resolveApiMode() !== "http") {
    throw new WalletRegistrationError("http_only", "Consulta de carteira requer conexão com o servidor.");
  }
  const sellerId = resolveSellerIdFromSession();
  try {
    return await apiRequest<WalletPublicViewDTO>(`/v1/sellers/${sellerId}/wallet`);
  } catch (error) {
    throw mapWalletApiError(error);
  }
}
```

**FR-11, FR-14:** POST payload and Portuguese error mapping via `domain/wallet/wallet.errors.ts` (codes from integration-spec error table).

---

### 3. Domain helpers

**File:** `src/domain/wallet/wallet-gating.ts` (new)

Addresses **FR-1, FR-2, FR-3, FR-5**.

```ts
import type { SellerLifecycleStatus } from "@/domain/seller/seller-registration.routing";
import { ROUTES } from "@/lib/routes";

export function requiresWalletSetup(
  status: SellerLifecycleStatus | null,
  walletId: string | null,
): boolean {
  return status === "active" && walletId === null;
}

export const SELLER_WALLET_SETUP_ROUTE = ROUTES.seller.walletSetup;

/** Routes blocked until wallet is registered (FR-3). */
export const SELLER_WALLET_GATED_ROUTES: readonly string[] = [
  ROUTES.seller.dashboard,
  ROUTES.seller.validation,
  ROUTES.seller.receivables.list,
  ROUTES.seller.receivables.new,
];

export function isWalletGatedSellerPath(pathname: string): boolean {
  return SELLER_WALLET_GATED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
```

**File:** `src/domain/wallet/wallet-payload.ts` (new)

```ts
import { smartAccountEnv } from "@/lib/smart-account.config";
import type { RegisterSellerWalletRequestDTO } from "@/services/wallet.dto";

export function publicKeyToHex(publicKey: Uint8Array): string {
  return Array.from(publicKey, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildRegisterPayload(input: {
  contractId: string;
  credentialId: string;
  publicKey: Uint8Array;
  createdTxHash?: string;
}): RegisterSellerWalletRequestDTO {
  return {
    contractId: input.contractId,
    credentialId: input.credentialId,
    signerPublicKey: publicKeyToHex(input.publicKey),
    network: smartAccountEnv.network,
    createdTxHash: input.createdTxHash,
  };
}
```

**File:** `src/domain/seller/seller.types.ts` — add `walletId: string | null` to `SellerCompany`.

**File:** `src/domain/seller/seller-profile.mapper.ts` — map `walletId: dto.walletId` in `mapSellerDtoToCompany`.

**File:** `src/domain/seller/seller-registration.routing.ts` — update post-login destination:

```ts
export function getPostLoginSellerDestination(
  status: SellerLifecycleStatus,
  walletId: string | null,
): string {
  switch (status) {
    case "created":
      return ROUTES.sellerRegistration;
    case "in_review":
      return ROUTES.seller.dashboard;
    case "active":
      return requiresWalletSetup(status, walletId)
        ? ROUTES.seller.walletSetup
        : ROUTES.seller.dashboard;
    case "inactive":
      throw new SellerRegistrationBlockedError();
  }
}
```

Call sites (`MockLoginForm`, profile redirect) must pass `walletId` after seller refresh — not computed in the login form's own gating logic (**FR-4** preserved: gating stays in `SellerContext` + guard; login only navigates using refreshed seller state).

---

### 4. WalletContext (SDK lifecycle)

**File:** `src/contexts/WalletContext.tsx` (new)

Wraps `smart-account-kit` with `IndexedDBStorage` (**FR-19**). Never logs `credentialId` (**FR-20**).

```tsx
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { SmartAccountKit, IndexedDBStorage } from "smart-account-kit";
import { assertSmartAccountEnvConfigured, smartAccountEnv } from "@/lib/smart-account.config";
import { buildRegisterPayload } from "@/domain/wallet/wallet-payload";
import { registerSellerWallet } from "@/services/wallet.service";
import { fetchSellerWallet } from "@/services/wallet.service";
import { useSeller } from "@/contexts/SellerContext";

export type WalletConnectionStatus = "idle" | "connecting" | "connected" | "error";

export type WalletContextValue = {
  connectionStatus: WalletConnectionStatus;
  connectExistingWallet: (credentialId: string) => Promise<void>;
  createAndRegisterWallet: (appName: string, userEmail: string) => Promise<void>;
  retryBackendRegistration: () => Promise<void>;
  lastConnectError: string | null;
};

// kit singleton in useRef; createWallet only when walletId === null (FR-17)
// connectWallet when walletId !== null (FR-15)
```

**Bootstrap (FR-15, FR-17):**

1. On mount, if `seller.walletId !== null`, call `fetchSellerWallet()` for `credentialId`, then `kit.connectWallet({ credentialId })` (silent IndexedDB restore first).
2. Never call `createWallet()` when `walletId !== null`.
3. On `connectWallet` failure: set `connectionStatus: "error"` and `lastConnectError` — **non-blocking** for navigation (**FR-16**, see §7).

**Creation flow (FR-6, FR-7, FR-11):**

```ts
const result = await kit.createWallet(appName, userEmail, {
  autoSubmit: true,
  autoFund: true,
  nativeTokenContract: smartAccountEnv.nativeTokenContract, // SDK default if undefined
});
pendingRegistrationRef.current = buildRegisterPayload(result);
await registerSellerWallet(pendingRegistrationRef.current);
await refreshSeller(); // FR-12: walletId non-null before redirect
```

**Recovery (FR-13):**

- Keep `pendingRegistrationRef` after successful SDK deploy.
- On POST failure (5xx/network): expose `retryBackendRegistration()` — re-POST same payload, **no** second `createWallet()`.
- If IndexedDB shows pending deploy: `await kit.credentials.getPending()` then `kit.deploy()` / `syncAll()` before retry POST (per integration-spec partial-failure contract).
- On `409 wallet_already_exists`: `refreshSeller()`; if `walletId` now set → navigate to dashboard; else show escalation copy (support contact).

**Security (FR-18):** No private key or `secretEncrypted` in state, logs, or network payloads.

**Dependency:** add `"smart-account-kit"` to `package.json`.

---

### 5. SellerContext — wallet gating

**File:** `src/contexts/SellerContext.tsx` (modified)

Extend state with `walletId: string | null` (from DTO via mapper). After `refreshSeller()`:

```tsx
if (status === "created") {
  navigate(ROUTES.sellerRegistration, { replace: true });
  return status;
}

if (requiresWalletSetup(status, seller.walletId)) {
  navigate(ROUTES.seller.walletSetup, { replace: true });
}

return status;
```

When `refreshSellerStatus()` detects `in_review → active` with `walletId === null`, `refreshSeller()` runs and triggers the same redirect (**FR-5**).

**FR-1, FR-2:** `requiresWalletSetup` is false for `created`, `in_review`, `inactive` — no wallet-setup redirect.

Do **not** add wallet checks to `MockLoginForm` (**FR-4**).

---

### 6. SellerWalletRouteGuard

**File:** `src/routes/SellerWalletRouteGuard.tsx` (new)

Wraps seller operational routes in `App.tsx` (dashboard, validation, receivables). Blocks access when `requiresWalletSetup(lifecycleStatus, walletId)` and current path is wallet-gated (**FR-3**).

```tsx
export function SellerWalletRouteGuard({ children }: { children: React.ReactNode }) {
  const { lifecycleStatus, seller, isLoading } = useSeller();
  const location = useLocation();

  if (isLoading) return <AuthBootstrapFallback />;

  const walletId = seller?.walletId ?? null;
  if (
    requiresWalletSetup(lifecycleStatus, walletId) &&
    isWalletGatedSellerPath(location.pathname)
  ) {
    return <Navigate to={ROUTES.seller.walletSetup} replace />;
  }

  return children;
}
```

`/seller/wallet-setup` is **not** wrapped by this guard (seller can stay on setup page). If seller already has `walletId`, setup page redirects to dashboard.

---

### 7. Seller wallet setup page and UX

**File:** `src/pages/seller/SellerWalletSetupPage.tsx` (new)

**File:** `src/components/seller/SellerWalletSetupPanel.tsx` (new)

Public-ish layout: use `AppShell` with minimal chrome, or `PublicShell` if product prefers no sidebar during setup — default **AppShell without sidebar items** (logout only), consistent with under-review overlay pattern.

**UX copy (Portuguese placeholders — FR-8, FR-10, FR-22):**

| Section | Content |
|---------|---------|
| Intro | Carteira digital Stellar (testnet) será criada para receber operações on-chain. |
| Passkey | Acesso protegido por passkey (biometria/PIN). **Você é responsável** por manter essa passkey — perda pode impedir acesso à carteira. |
| Friendbot | No testnet, saldo XLM é creditado automaticamente via Friendbot. |
| Mainnet note | Suporte a rede principal e financiamento em produção serão disponibilizados em versão futura. |

**States:** idle → creating (WebAuthn prompt) → registering (POST) → success redirect → error with retry (FR-13).

Primary CTA: "Criar minha carteira" → `createAndRegisterWallet("Dupply", seller.email)`.

On success: `navigate(ROUTES.seller.dashboard, { replace: true })`.

---

### 8. Reconnect failure UX (FR-16)

**File:** `src/components/seller/SellerWalletReconnectBanner.tsx` (new)

When `WalletContext.connectionStatus === "error"` and `walletId !== null`:

- Show **dismissible** `Alert` banner at top of seller dashboard (and optionally other operational pages).
- Copy: "Não foi possível reconectar sua carteira. Tente novamente ou use sua passkey."
- Action: "Reconectar" → `connectExistingWallet(credentialId)`.
- Does **not** block route navigation or sidebar in v1.
- Future on-chain receivable actions must check `connectionStatus === "connected"` before signing (document only; no implementation in this slice).

---

### 9. Routes and App wiring

**File:** `src/lib/routes.ts` — add:

```ts
walletSetup: "/seller/wallet-setup",
```

**File:** `src/App.tsx` — new route:

```tsx
<Route
  path={ROUTES.seller.walletSetup}
  element={
    <ProtectedRoute profile="seller">
      <AppShell>
        <SellerWalletSetupPage />
      </AppShell>
    </ProtectedRoute>
  }
/>
```

Wrap existing seller operational routes:

```tsx
<ProtectedRoute profile="seller">
  <SellerWalletRouteGuard>
    <AppShell>...</AppShell>
  </SellerWalletRouteGuard>
</ProtectedRoute>
```

**File:** `src/main.tsx` — nest `WalletProvider` inside `SellerProvider`.

---

## Functional requirements traceability

| FR | Implementation |
|----|----------------|
| FR-1 | `requiresWalletSetup()` |
| FR-2 | Gating false unless `status === "active"` |
| FR-3 | `SellerWalletRouteGuard` + `SellerContext` redirect |
| FR-4 | No wallet logic in `MockLoginForm` |
| FR-5 | `refreshSellerStatus` → `refreshSeller` → redirect |
| FR-6 | `smartAccountEnv.network === "testnet"` in POST payload |
| FR-7 | `createWallet({ autoSubmit: true, autoFund: true })` |
| FR-8 | Setup page Friendbot copy |
| FR-9 | `VITE_WEBAUTHN_RP_ID` env; documented in `.env.example` |
| FR-10 | Setup page passkey responsibility copy |
| FR-11 | `buildRegisterPayload` + `registerSellerWallet()` |
| FR-12 | `refreshSeller()` after 201 before navigate |
| FR-13 | `retryBackendRegistration()` + pending deploy sync |
| FR-14 | `wallet.errors.ts` Portuguese messages |
| FR-15 | `WalletContext.connectExistingWallet` on bootstrap |
| FR-16 | Dismissible `SellerWalletReconnectBanner` |
| FR-17 | Guard in `WalletContext` — no `createWallet` if `walletId` set |
| FR-18 | No secret fields in frontend |
| FR-19 | `IndexedDBStorage` in kit config |
| FR-20 | Never log `credentialId` |
| FR-21 | `smart-account.config.ts` + `.env.example` |
| FR-22 | Mainnet deferred note in setup UX |

---

## Data flow

### First eligible session — wallet creation

```
Session restore / login → SellerContext.refreshSeller()
  → fetchCurrentSellerWithStatus() → walletId null, status active
  → navigate(/seller/wallet-setup)

User clicks "Criar minha carteira"
  → SellerWalletSetupPanel handler
      → WalletContext.createAndRegisterWallet()
          → SmartAccountKit.createWallet() [WebAuthn + deploy + Friendbot]
          → buildRegisterPayload(result)
          → registerSellerWallet() → POST /v1/sellers/:id/wallet
          → SellerContext.refreshSeller() → walletId populated
      → navigate(ROUTES.seller.dashboard)
```

### Subsequent session — reconnect

```
SellerContext.refreshSeller() → walletId !== null
SellerWalletRouteGuard → allows operational routes

WalletProvider bootstrap
  → fetchSellerWallet() → credentialId
  → kit.connectWallet({ credentialId })
  → connectionStatus: connected | error (banner if error)
```

### Recovery — deploy ok, POST failed

```
createWallet succeeds → pendingRegistrationRef stored
POST fails (5xx)
  → Setup page error: "Carteira criada na rede, mas não vinculada. Tente novamente."
User clicks "Tentar novamente"
  → retryBackendRegistration() [optional kit.credentials sync]
  → registerSellerWallet(same payload) — no createWallet()
  → refreshSeller → dashboard
```

---

## Files changed

| File | Change type |
|------|-------------|
| `package.json` | Modified — add `smart-account-kit` |
| `.env.example` | Modified — Stellar/WebAuthn vars |
| `src/lib/smart-account.config.ts` | Added |
| `src/lib/routes.ts` | Modified — `walletSetup` route |
| `src/services/wallet.dto.ts` | Added |
| `src/services/wallet.service.ts` | Added |
| `src/domain/wallet/wallet-gating.ts` | Added |
| `src/domain/wallet/wallet-payload.ts` | Added |
| `src/domain/wallet/wallet.errors.ts` | Added |
| `src/domain/seller/seller.types.ts` | Modified — `walletId` |
| `src/domain/seller/seller-profile.mapper.ts` | Modified — map `walletId` |
| `src/domain/seller/seller-registration.routing.ts` | Modified — post-login destination |
| `src/contexts/WalletContext.tsx` | Added |
| `src/contexts/SellerContext.tsx` | Modified — wallet gating redirect |
| `src/routes/SellerWalletRouteGuard.tsx` | Added |
| `src/pages/seller/SellerWalletSetupPage.tsx` | Added |
| `src/components/seller/SellerWalletSetupPanel.tsx` | Added |
| `src/components/seller/SellerWalletReconnectBanner.tsx` | Added |
| `src/pages/seller/SellerDashboardPage.tsx` | Modified — render reconnect banner |
| `src/App.tsx` | Modified — routes + guard wrapping |
| `src/main.tsx` | Modified — `WalletProvider` |
| `src/components/auth/MockLoginForm.tsx` | Modified — pass `walletId` to post-login helper only |

---

## Impact analysis

- **Auth/navigation:** Post-login seller destination considers `walletId` for `active` sellers. `ProtectedRoute` unchanged. Wallet gating applies only in HTTP seller sessions; mock mode unchanged.
- **Other personas:** No impact on admin or analyst routes.
- **Service adapter:** `wallet.service.ts` throws in mock mode (HTTP-only by design). Seller wallet flow is inactive when `resolveApiMode() === "mock"`.
- **TypeScript:** New types from SDK may require minimal casts at kit boundaries; avoid `any`. Map SDK results through `wallet-payload.ts` before POST.
- **`getPostLoginSellerDestination` callers:** Must await seller refresh before navigating so `walletId` is available — aligns with FR-4 (not login-form gating, but login must use fresh seller data).

---

## Test strategy

_(No automated test runner configured — manual verification.)_

### Manual — blocking gate (FR-1, FR-3)

| Step | Expected result |
|------|-----------------|
| Log in as active seller with `walletId: null` | Redirect to `/seller/wallet-setup` |
| Navigate manually to `/seller` or `/seller/receivables` | Redirect back to wallet setup |
| Log in as `in_review` seller | No wallet setup; under-review overlay unchanged |

### Manual — wallet creation (FR-6–FR-12)

| Step | Expected result |
|------|-----------------|
| Complete setup with passkey | WebAuthn prompt; testnet deploy; Friendbot funding |
| POST succeeds | Seller profile shows non-null `walletId`; redirect to dashboard |
| Second login | No setup page; SDK reconnects |

### Manual — lifecycle transition (FR-5)

| Step | Expected result |
|------|-----------------|
| Stay logged in while admin approves (`in_review` → `active`, `walletId` null) | Status poll triggers redirect to wallet setup |

### Manual — recovery (FR-13, FR-14)

| Step | Expected result |
|------|-----------------|
| Simulate POST failure after SDK success (devtools/network throttle) | Recoverable PT error; retry links wallet without second deploy |
| POST returns 409 then refresh shows `walletId` | Proceed to dashboard |

### Manual — reconnect (FR-15, FR-16, FR-17)

| Step | Expected result |
|------|-----------------|
| Return visit with existing wallet | No `createWallet`; silent or passkey reconnect |
| Force reconnect failure | Dismissible banner on dashboard; routes still accessible |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| Exact Portuguese copy for setup page | Placeholder copy in §7; Product/Design may refine strings without structural changes |
| Local dev `rpId` | `localhost` in `.env.local`; production `dupply-frontend.vercel.app` via Vercel env. Document in `.env.example` (FR-9) |
| `connectWallet` failure UX (FR-16) | Dismissible non-blocking banner on seller dashboard; reconnect action |
| QA wildcard demo wallet | Out of scope for production; optional dev-only backend seed — not implemented in this slice |
| `409 wallet_already_exists` with stale `walletId` | `refreshSeller()` first; if still null, show support escalation message |
| Minimum browser support for WebAuthn | Target latest Chrome/Edge/Safari (desktop + mobile); no explicit matrix in v1 — document "browser with passkey support required" in setup page footer |
| Mock mode wallet simulation | Explicitly out of scope; wallet services throw `http_only` in mock mode |
