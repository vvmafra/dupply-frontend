# Tech Spec — Seller Session Status Sync

## Overview

This feature fixes **frontend-only stale seller lifecycle state** after session restore, login, and in-session admin approval. The backend already returns fresh `sellers.status` on every `GET /v1/sellers/:id`; the gap is that auth persistence omits seller status, restore only blocks `inactive` sellers, `AppShell` polls status in local state without propagating it, and seller pages snapshot profile data once on mount.

Implementation introduces a **shared `SellerContext`** (HTTP mode only) as the single source of truth for lifecycle status and mapped `SellerCompany` profile, extends session restore and login to revalidate the full seller lifecycle (`created`, `in_review`, `active`, `inactive`), honors account-level `inactive` from `GET /v1/accounts/me`, and wires polling in `AppShell` to update shared state so `in_review` → `active` transitions lift restrictions without hard refresh.

**In scope:** HTTP mode seller persona, existing endpoints only, manual verification + `npm run typecheck`.

**Out of scope:** Backend changes, JWT/snapshot status fields, WebSockets/SSE, mock-mode behavior changes, non-seller personas, automated E2E tests, P2 login UX polish beyond a minimal inline banner (see FR-21).

Reference: [prd.md](./prd.md)

---

## Architecture overview

Layers touched:

```
UI (pages/seller/*, components/layout/AppShell.tsx, components/auth/MockLoginForm.tsx, routes/guards.tsx)
  └── consumes SellerContext + AuthContext
Contexts (contexts/SellerContext.tsx — new)
  └── orchestrates refresh; no direct fetch in pages
Services (seller.service.ts, seller-registration.service.ts, auth.service.ts)
  └── adapter: resolveApiMode() → mock unchanged | apiRequest()
Domain (seller-registration.routing.ts, seller-profile.mapper.ts, seller-receivable-access.ts)
  └── routing helpers, capability gates — no React, no services
Lib (env.ts, api-client.ts, token-storage.ts, routes.ts)
```

Provider tree after implementation:

```
AuthProvider
  └── SellerProvider   ← new; no-op passthrough in mock mode
        └── App (router)
```

`SellerProvider` only activates when `resolveApiMode() === "http"` **and** `isAuthenticated && selectedProfile === "seller"`. Other personas see children unchanged with `useSeller()` returning a stable no-op/default context (see §2).

---

## Component design

### 1. `SellerContext` + `SellerProvider`

**File:** `src/contexts/SellerContext.tsx` (new)

**Purpose:** FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13 — shared refreshable seller lifecycle status and mapped profile.

**State shape:**

```ts
import type { SellerCompany } from "@/domain/seller/seller.types";
import type { SellerLifecycleStatus } from "@/domain/seller/seller-registration.routing";

export type SellerContextState = {
  lifecycleStatus: SellerLifecycleStatus | null;
  seller: SellerCompany | null;
  isLoading: boolean;
  fetchError: string | null;
};

export type SellerContextValue = SellerContextState & {
  refreshSeller: () => Promise<void>;
  /** Status-only refresh for polling; updates lifecycleStatus and re-fetches full profile on change. */
  refreshSellerStatus: () => Promise<SellerLifecycleStatus | null>;
};
```

**Implementation notes:**

- `refreshSeller()` calls existing `fetchCurrentSeller()` from `seller.service.ts`, then sets `seller` and `lifecycleStatus` by mapping `validationStatus` / backend status. Prefer deriving `lifecycleStatus` from the DTO inside the service layer to avoid duplicate GETs:

```ts
// src/services/seller.service.ts — add (HTTP only)
export async function fetchCurrentSellerWithStatus(): Promise<{
  seller: SellerCompany;
  status: SellerStatusDTO;
}> {
  const sellerId = resolveSellerIdFromSession();
  const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
  return { seller: mapSellerDtoToCompany(dto), status: dto.status };
}
```

- `refreshSellerStatus()` calls `fetchSellerBackendStatus()`; if status differs from `lifecycleStatus`, call `refreshSeller()` to sync profile-derived gates (FR-12, FR-13).
- Mock mode: provider renders children only; `useSeller()` returns `{ lifecycleStatus: null, seller: null, isLoading: false, fetchError: null, refreshSeller: async () => {}, refreshSellerStatus: async () => null }` without network I/O (FR-17).
- Export `useSeller()` with same throw-if-missing pattern as `useAuth()`.

**Bootstrap:** `SellerProvider` runs `refreshSeller()` when auth transitions to authenticated seller (FR-9). Does not block auth `isLoading` — auth restore handles gating first (§2).

---

### 2. `AuthContext` — full lifecycle revalidation on restore

**File:** `src/contexts/AuthContext.tsx`

**Current gap (FR-1, FR-3, FR-4):** Restore only checks `inactive`; on fetch failure it silently authenticates (FR-19 risk); no routing for `created`.

**After:**

```ts
// Pseudocode for restore branch (HTTP + platformRole === "seller")
const restored = await restoreSessionFromService();
if (!restored) { set isLoading false; return; }

if (resolveApiMode() === "http" && restored.session.user.platformRole === "seller") {
  let status: SellerLifecycleStatus;
  try {
    status = await fetchSellerBackendStatus();
  } catch {
    // FR-19 decision: allow restore, do NOT assume active
    setState({ isAuthenticated: true, isLoading: false, ...restored });
    // SellerProvider will retry refreshSeller on mount; optional toast:
    toast.error("Não foi possível validar seu cadastro. Tentando novamente...");
    return;
  }

  if (status === "inactive") {
    await logoutFromService();
    toast.error(INACTIVE_SELLER_REJECTION_MESSAGE);
    setState({ ...guestState, isLoading: false });
    return;
  }

  // created | in_review | active — keep session (FR-3, FR-4)
  setState({
    isAuthenticated: true,
    isLoading: false,
    user: restored.session.user,
    selectedProfile: restored.selectedProfile ?? "seller",
  });
  return;
}

setState({ isAuthenticated: true, isLoading: false, ... });
```

**Routing on restore for `created`:** Do not navigate inside `AuthContext`. Persist `selectedProfile: "seller"` when snapshot lacks profile. Add restore-time redirect in `GuestRoute` / app entry:

**File:** `src/routes/guards.tsx` — extend `ProtectedRoute` for seller profile:

```tsx
// When seller + HTTP + lifecycleStatus === "created" (from useSeller once loaded)
// OR immediate redirect via dedicated hook used at app shell level
```

Cleaner approach — **new hook** `src/hooks/useSellerLifecycleRedirect.ts`:

- Watches `useAuth()` + `useSeller().lifecycleStatus`
- When `lifecycleStatus === "created"` and current path is not `ROUTES.sellerRegistration`, `navigate(ROUTES.sellerRegistration, { replace: true })`
- Mount hook once in `AppShell` (seller-only) — FR-3

Alternatively run redirect in `SellerProvider` after first successful refresh. Prefer **SellerProvider** post-refresh redirect to keep guards thin.

**FR-16:** Remove duplicate `fetchSellerBackendStatus` from `AuthContext` after `SellerProvider` owns refresh — restore still needs status *before* authenticate; keep one call in restore, then `SellerProvider` calls `refreshSeller()` immediately on mount to populate full profile (no second status-only call if restore just fetched — pass initial status via React context default or module-level `lastKnownStatus` — simplest: accept duplicate GET on boot, ≤2 requests acceptable for MVP).

---

### 3. `auth.service.ts` — account inactive on restore

**File:** `src/services/auth.service.ts`

**Current gap (FR-5):** `hydrateUserFromApi()` maps only `SessionUser`, discards `AccountResponseDTO.status`.

**After:**

```ts
type HydratedAccount = {
  user: SessionUser;
  status: AccountResponseDTO["status"];
};

async function hydrateAccountFromApi(): Promise<HydratedAccount | null> {
  try {
    const dto = await apiRequest<AccountResponseDTO>("/v1/accounts/me");
    return { user: mapAccountDtoToSessionUser(dto), status: dto.status };
  } catch {
    return null; // FR-6 — failure does not break restore
  }
}
```

In `restoreSessionImpl()` and `httpLoginImpl()`:

```ts
const hydrated = await hydrateAccountFromApi();
if (hydrated) {
  session.user = hydrated.user;
  if (hydrated.status === "inactive") {
    clearAuthStorage();
    return null; // restore/login treats as no session
  }
}
```

**FR-20 / account inactive copy:** Reuse login message: `"Sua conta está inativa. Entre em contato com o suporte."` — surface via `toast.error` in `AuthContext` when restore returns null after hydration block (map a distinct `RestoreBlockedReason` from service or check storage cleared + show toast in context).

Login path already returns `account_inactive` from API errors; restore path now aligns (FR-5).

---

### 4. `MockLoginForm` — login via shared refresh

**File:** `src/components/auth/MockLoginForm.tsx`

**Current:** Calls `fetchSellerBackendStatus()` directly, then `loginWithSession` (FR-15 partial, FR-16 violated).

**After:**

```ts
import { useSeller } from "@/contexts/SellerContext";
import { getPostLoginSellerDestination } from "@/domain/seller/seller-registration.routing";

// After successful login result for seller + HTTP:
loginWithSession(result.session);
setProfile("seller");

const { refreshSeller } = useSeller(); // requires SellerProvider above router — wrap in main.tsx
await refreshSeller();

const status = /* from refreshSeller result or useSeller().lifecycleStatus */;
if (status === "inactive") { /* logout + toast — should not happen if refresh works */ }

const dest = getPostLoginSellerDestination(status!);
navigate(fromPath && status !== "created" ? fromPath : dest, { replace: true });
```

Use `getPostLoginSellerDestination()` for all statuses (FR-15) instead of inline `status === "created"` branch.

On `refreshSeller` failure: do not assume `active` — show toast, navigate to `ROUTES.seller.dashboard` with seller context in error/retry state (same as restore FR-19).

---

### 5. `AppShell` — polling updates shared state

**File:** `src/components/layout/AppShell.tsx`

**Current:** Local `useState` for `sellerStatus`; polling every `30_000` ms; no propagation to pages (FR-11 partial, FR-12/13 missing).

**After:**

```tsx
import { useSeller } from "@/contexts/SellerContext";

const SELLER_STATUS_POLL_MS = 30_000; // FR-14 — unchanged for MVP

export function AppShell({ children }: AppShellProps) {
  const { lifecycleStatus, refreshSellerStatus, isLoading: sellerLoading } = useSeller();

  useEffect(() => {
    if (lifecycleStatus !== "in_review") return;
    const id = globalThis.setInterval(() => void refreshSellerStatus(), SELLER_STATUS_POLL_MS);
    return () => globalThis.clearInterval(id);
  }, [lifecycleStatus, refreshSellerStatus]);

  const isUnderReview = lifecycleStatus === "in_review";
  // SellerUnderReviewOverlay unchanged
}
```

Remove local `sellerStatus` / `refreshSellerStatus` / `fetchSellerBackendStatus` import.

When `refreshSellerStatus` detects `in_review` → `active`, shared `seller` updates via `refreshSeller()` inside context (FR-12, FR-13) — overlay and `canSellerRegisterReceivables(seller)` update reactively.

---

### 6. Seller pages — consume `useSeller()` instead of mount fetch

**Files:**

| File | Change |
|------|--------|
| `src/pages/seller/SellerDashboardPage.tsx` | Replace `useEffect` + `fetchCurrentSeller` with `useSeller()` |
| `src/pages/seller/SellerValidationPage.tsx` | Same; after `updateSellerValidationStatus`, call `refreshSeller()` |
| `src/pages/seller/SellerReceivablesPage.tsx` | Same |
| `src/pages/seller/NewReceivablePage.tsx` | Same for `canSellerRegisterReceivables` gate (FR-10) |

**Pattern:**

```tsx
const { seller, isLoading, fetchError, refreshSeller } = useSeller();

useEffect(() => {
  if (!seller && !isLoading && !fetchError) void refreshSeller();
}, [seller, isLoading, fetchError, refreshSeller]);

if (isLoading && !seller) return <Skeleton />;
if (fetchError && !seller) return <RetryUI onRetry={() => void refreshSeller()} />;
```

All seller routes under `AppShell` + `ProtectedRoute profile="seller"` — FR-10 resolved: **all listed pages**, not gates-only.

---

### 7. `main.tsx` — provider wiring

**File:** `src/main.tsx`

```tsx
<AuthProvider>
  <SellerProvider>
    <App />
  </SellerProvider>
</AuthProvider>
```

FR-18: `SellerProvider` early-returns children when not HTTP seller — no impact on admin/analyst.

---

### 8. P2 — Login session-already-active UX (FR-21)

**Files:** `src/pages/LoginPage.tsx`, `src/components/auth/SessionActiveBanner.tsx` (new)

**Approach:** Inline `Alert` on login page when `GuestRoute` would redirect — because `GuestRoute` currently redirects immediately, split behavior:

**Option chosen:** New prop on `GuestRoute`: `allowAuthenticatedView?: boolean` for login route only.

```tsx
// App.tsx
<GuestRoute allowAuthenticatedView>
  <LoginPage />
</GuestRoute>
```

```tsx
// GuestRoute — when authenticated && allowAuthenticatedView, render children
// LoginPage shows SessionActiveBanner with:
// - "Você já está conectado como {email}"
// - Button "Continuar" → navigate(getProfileRedirect(selectedProfile))
// - Button "Sair e entrar novamente" → logout() then stay on login
```

Portuguese copy (FR-20). Minimal P2 scope — no dedicated interstitial route.

---

### 9. Domain helper — lifecycle from profile (optional)

**File:** `src/domain/seller/seller-lifecycle.ts` (new, optional)

If pages need status without full DTO:

```ts
export function lifecycleStatusFromCompany(seller: SellerCompany): SellerLifecycleStatus {
  if (seller.validationStatus === "APPROVED" && seller.analystDuplicatasAccess === "APPROVED")
    return "active";
  if (seller.validationStatus === "UNDER_REVIEW") return "in_review";
  if (seller.validationStatus === "REJECTED") return "inactive";
  return "created";
}
```

Prefer **`SellerStatusDTO` from API** as source of truth in context; use helper only for mock alignment if needed.

---

## Data flow

### Session restore (HTTP seller)

```
App mount
  → AuthProvider useEffect
      → restoreSession() (auth.service.ts)
          → JWT valid or POST /v1/auth/refresh
          → hydrateAccountFromApi()
              → status === "inactive" → clearAuthStorage, return null
          → return RestoredSession
      → fetchSellerBackendStatus()
          → inactive → logout + toast (FR-2)
          → created | in_review | active → setState authenticated (FR-3, FR-4)
          → fetch error → authenticate + error toast, no active assumption (FR-19)
  → SellerProvider mount
      → refreshSeller() → shared seller + lifecycleStatus (FR-7–9)
      → if created → navigate ROUTES.sellerRegistration
```

### Approval while logged in (`in_review` → `active`)

```
AppShell interval (30s)
  → refreshSellerStatus()
      → status changed to active
          → refreshSeller() in SellerContext
              → seller.validationStatus === "APPROVED"
              → isUnderReview false, overlay removed (FR-12)
              → canSellerRegisterReceivables true on NewReceivablePage (FR-13)
```

### Login (HTTP seller)

```
MockLoginForm submit
  → login() → hydrate account (inactive blocked at service)
  → loginWithSession + setProfile("seller")
  → refreshSeller() via SellerContext
  → getPostLoginSellerDestination(status) → navigate (FR-15, FR-16)
```

---

## Files changed

| File | Change type |
|------|-------------|
| `src/contexts/SellerContext.tsx` | Added |
| `src/contexts/AuthContext.tsx` | Modified — restore lifecycle + account inactive toast |
| `src/services/auth.service.ts` | Modified — hydrate account status, block inactive |
| `src/services/seller.service.ts` | Modified — optional `fetchCurrentSellerWithStatus` |
| `src/components/layout/AppShell.tsx` | Modified — use SellerContext polling |
| `src/components/auth/MockLoginForm.tsx` | Modified — shared refresh + routing helper |
| `src/components/auth/SessionActiveBanner.tsx` | Added (P2) |
| `src/pages/LoginPage.tsx` | Modified (P2) |
| `src/routes/guards.tsx` | Modified (P2) — `allowAuthenticatedView` |
| `src/App.tsx` | Modified — GuestRoute prop |
| `src/main.tsx` | Modified — SellerProvider |
| `src/pages/seller/SellerDashboardPage.tsx` | Modified |
| `src/pages/seller/SellerValidationPage.tsx` | Modified |
| `src/pages/seller/SellerReceivablesPage.tsx` | Modified |
| `src/pages/seller/NewReceivablePage.tsx` | Modified |
| `src/domain/seller/seller-lifecycle.ts` | Added (optional) |

No changes to `seller-registration.service.ts` public API beyond continued use of `fetchSellerBackendStatus`.

---

## Impact analysis

| Area | Impact |
|------|--------|
| **Auth/navigation** | Restore/login may redirect `created` sellers to registration; account `inactive` ends session on restore. Protected routes unchanged for non-sellers. |
| **Other personas** | `SellerProvider` is transparent (no-op) when `selectedProfile !== "seller"` or mock mode — FR-18. |
| **Service adapter** | All new HTTP paths go through existing `fetchCurrentSeller` / `fetchSellerBackendStatus` / `hydrateAccountFromApi`; mock paths untouched — FR-17. |
| **TypeScript** | New context types; no `any`; use `SellerLifecycleStatus` alias from domain. |
| **Performance** | At most 2 seller GETs on cold boot (restore status + profile refresh); polling unchanged at 30s. |
| **Registration wizard** | `SellerRegistrationPage` keeps `loadSellerRegistrationState` for form hydration — orthogonal to shared context; no conflict. |

---

## Functional requirements traceability

| FR | Addressed in |
|----|----------------|
| FR-1 | §2 AuthContext restore — status fetch before authenticate |
| FR-2 | §2 inactive → logout + `INACTIVE_SELLER_REJECTION_MESSAGE` |
| FR-3 | §2 SellerProvider redirect `created` → registration |
| FR-4 | §2 restore keeps session for `in_review` / `active` |
| FR-5 | §3 account `inactive` clears storage on restore/login hydrate |
| FR-6 | §3 hydrate failure → existing fallback |
| FR-7 | §1 SellerContext `lifecycleStatus` |
| FR-8 | §1 SellerContext `seller` (mapped profile) |
| FR-9 | §1 bootstrap on restore/login |
| FR-10 | §6 all seller pages use `useSeller()` |
| FR-11 | §5 polling via `refreshSellerStatus` |
| FR-12 | §5 overlay driven by shared `lifecycleStatus` |
| FR-13 | §1 `refreshSeller` on status change |
| FR-14 | §5 keep `30_000` ms (see Open questions) |
| FR-15 | §4 `getPostLoginSellerDestination` |
| FR-16 | §1/§4 single refresh path in context |
| FR-17 | §1 mock no-op provider |
| FR-18 | §7 provider gating by persona/mode |
| FR-19 | §2 allow restore on fetch failure, no `active` assumption |
| FR-20 | §3/§8 Portuguese existing messages |
| FR-21 | §8 P2 login banner (optional in MVP task split) |

---

## Test strategy

_(No automated test runner configured — manual verification steps.)_

### Manual — approval while logged in

| Step | Expected result |
|------|-----------------|
| Log in as seller with backend status `in_review` | Under-review overlay visible |
| Admin approves seller to `active` (backend) | Within ~30s overlay disappears, header normal |
| Open Nova recebível | Form enabled without hard refresh |

### Manual — return after approval (session restore)

| Step | Expected result |
|------|-----------------|
| Seller logged in during `in_review`, then close tab | Session in storage |
| Admin approves to `active` | — |
| Reopen app | Lands on seller dashboard, no overlay, receivable registration allowed |

### Manual — inactive seller on restore

| Step | Expected result |
|------|-----------------|
| Valid token, seller status `inactive` | Session cleared, Portuguese rejection toast |

### Manual — created on restore

| Step | Expected result |
|------|-----------------|
| Valid token, seller status `created` | Authenticated, redirected to `/register/seller` |

### Manual — account inactive on restore

| Step | Expected result |
|------|-----------------|
| Valid token, `GET /accounts/me` returns `status: inactive` | Session cleared, inactive account toast (login copy) |

### Manual — mock mode regression

| Step | Expected result |
|------|-----------------|
| `VITE_USE_MOCKS=true`, demo login | Behavior unchanged from before feature |

### Manual — non-seller personas

| Step | Expected result |
|------|-----------------|
| Admin / analyst login and navigation | No seller polling, no extra GETs |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| FR-19: Seller status fetch failure during restore | **Allow restore** with authenticated session; show recoverable error toast; `SellerProvider` retries `refreshSeller()` on mount; never default to `active`. Pages show loading/retry until status known. |
| Force `POST /v1/auth/refresh` on every restore? | **No for MVP.** Keep current token reuse; seller `GET` is the mandatory revalidation complement. Revisit if account claims drift. |
| FR-14: Polling interval while `in_review` | **Keep 30s** (`SELLER_STATUS_POLL_MS = 30_000`). Reducing to 10s is a one-line change if product requests faster feedback post-MVP. |
| FR-21: Login UX for active session | **P2:** Inline `SessionActiveBanner` on `LoginPage` with `GuestRoute allowAuthenticatedView` — not a separate route. Can ship in a follow-up task. |
| Replace all `fetchCurrentSeller` on seller routes? | **Yes** — all four seller pages listed in PRD. |
| Account `inactive` on restore — copy? | Reuse login string: `"Sua conta está inativa. Entre em contato com o suporte."` |
