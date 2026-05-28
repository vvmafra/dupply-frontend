# Task 2.0: Add SellerContext, SellerProvider, and main.tsx wiring

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Introduce `SellerContext` as the single HTTP-mode source of truth for seller lifecycle status and mapped `SellerCompany` profile, with `refreshSeller()` and `refreshSellerStatus()` for bootstrap and polling. Wire `SellerProvider` under `AuthProvider` in `main.tsx`. On first successful refresh, redirect `created` sellers to the registration wizard. Corresponds to techspec §1 (`SellerContext`), §7 (`main.tsx`), and FR-3 redirect in SellerProvider.

Depends on: 1.0

## Requirements

- FR-7: Expose shared, refreshable seller lifecycle status distinct from auth snapshot
- FR-8: Include mapped seller profile sufficient for capability gates (e.g. receivable registration)
- FR-9: Initialize shared seller state when auth becomes authenticated seller (HTTP mode)
- FR-3: After refresh, if lifecycle status is `created`, navigate to registration wizard
- FR-17: Mock mode — provider passthrough; `useSeller()` returns stable no-op defaults, no network I/O
- FR-18: Non-seller personas — provider transparent; no extra GETs
- FR-13: When status changes, `refreshSellerStatus()` triggers full `refreshSeller()` to sync profile gates

## Subtasks

- [ ] 2.1 Read `src/contexts/AuthContext.tsx` for provider patterns (`useAuth` throw-if-missing)
- [ ] 2.2 Create `src/contexts/SellerContext.tsx` with state, `refreshSeller`, `refreshSellerStatus`
- [ ] 2.3 Bootstrap `refreshSeller()` when authenticated + `selectedProfile === "seller"` + HTTP mode
- [ ] 2.4 Post-refresh redirect to `ROUTES.sellerRegistration` when status is `created`
- [ ] 2.5 Wrap app in `main.tsx`: `AuthProvider` → `SellerProvider` → `App`
- [ ] 2.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §1 `SellerContext` + `SellerProvider`** and **§7 `main.tsx`**.

State shape:

```ts
export type SellerContextState = {
  lifecycleStatus: SellerLifecycleStatus | null;
  seller: SellerCompany | null;
  isLoading: boolean;
  fetchError: string | null;
};

export type SellerContextValue = SellerContextState & {
  refreshSeller: () => Promise<void>;
  refreshSellerStatus: () => Promise<SellerLifecycleStatus | null>;
};
```

- `refreshSeller()` uses `fetchCurrentSellerWithStatus()` from task 1
- `refreshSellerStatus()` calls `fetchSellerBackendStatus()`; on change, call `refreshSeller()`
- Activate only when `resolveApiMode() === "http"` **and** `isAuthenticated && selectedProfile === "seller"`
- Mock default: `{ lifecycleStatus: null, seller: null, isLoading: false, fetchError: null, refreshSeller: async () => {}, refreshSellerStatus: async () => null }`
- Optional: `src/domain/seller/seller-lifecycle.ts` — only if needed; prefer `SellerStatusDTO` from API

Does not modify `AuthContext` restore logic (task 3) or pages (task 5).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `useSeller()` available; throws outside provider like `useAuth()`
- [ ] HTTP seller login/restore triggers bootstrap refresh on mount
- [ ] `created` sellers redirected to registration after first successful refresh
- [ ] Mock and non-seller flows unchanged
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-session-status-sync/prd.md` ← read first
- `tasks/prd-seller-session-status-sync/techspec.md` ← read first
- `src/contexts/SellerContext.tsx` ← create
- `src/main.tsx` ← modify
- `src/contexts/AuthContext.tsx` ← read
- `src/services/seller.service.ts` ← use `fetchCurrentSellerWithStatus`
- `src/services/seller-registration.service.ts` ← read (`fetchSellerBackendStatus`)
- `src/domain/seller/seller-registration.routing.ts` ← read
- `src/lib/routes.ts` ← read
