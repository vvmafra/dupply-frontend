# Task 3.0: Revalidate full seller lifecycle on session restore in AuthContext

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Extend HTTP session restore in `AuthContext` to fetch seller lifecycle status for seller-role accounts before marking the user authenticated, applying rules for all statuses (`created`, `in_review`, `active`, `inactive`) — not only `inactive`. Surface account-inactive and seller-inactive outcomes with existing Portuguese toasts. On status fetch failure, allow restore without assuming `active`. Corresponds to techspec §2 (`AuthContext`).

Depends on: 1.0, 2.0

## Requirements

- FR-1: After successful restore for seller in HTTP mode, fetch seller lifecycle status before authenticating in app state
- FR-2: `inactive` seller → clear session, show `INACTIVE_SELLER_REJECTION_MESSAGE`
- FR-3: `created` → keep session (redirect handled by SellerProvider in task 2)
- FR-4: `in_review` / `active` → keep session, route per existing Slice B rules
- FR-5: Account `inactive` on hydrate — handled in task 1; show toast when restore returns null
- FR-19: Status fetch failure → allow restore, do NOT default to `active`; toast: `"Não foi possível validar seu cadastro. Tentando novamente..."`
- FR-20: Reuse existing Portuguese messages (`INACTIVE_SELLER_REJECTION_MESSAGE`, account inactive copy)

## Subtasks

- [ ] 3.1 Read `AuthContext` restore effect and current `inactive`-only check
- [ ] 3.2 After `restoreSession()`, for HTTP seller: `fetchSellerBackendStatus()` before `setState` authenticated
- [ ] 3.3 Handle `inactive` → `logoutFromService()` + rejection toast + guest state
- [ ] 3.4 Handle `created` | `in_review` | `active` → authenticated with `selectedProfile: "seller"` when missing
- [ ] 3.5 Handle fetch error → authenticate + error toast (no `active` assumption); SellerProvider retries on mount
- [ ] 3.6 Toast when restore null due to account inactive (task 1 service behavior)
- [ ] 3.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §2 `AuthContext` — full lifecycle revalidation on restore** and **Open questions resolved (FR-19)**.

```ts
if (resolveApiMode() === "http" && restored.session.user.platformRole === "seller") {
  let status: SellerLifecycleStatus;
  try {
    status = await fetchSellerBackendStatus();
  } catch {
    setState({ isAuthenticated: true, isLoading: false, ...restored });
    toast.error("Não foi possível validar seu cadastro. Tentando novamente...");
    return;
  }
  if (status === "inactive") {
    await logoutFromService();
    toast.error(INACTIVE_SELLER_REJECTION_MESSAGE);
    setState({ ...guestState, isLoading: false });
    return;
  }
  setState({
    isAuthenticated: true,
    isLoading: false,
    user: restored.session.user,
    selectedProfile: restored.selectedProfile ?? "seller",
  });
  return;
}
```

Accept ≤2 seller GETs on cold boot (restore status + `SellerProvider.refreshSeller()`). Do not navigate inside `AuthContext` for `created` — SellerProvider handles redirect.

Account inactive: when `restoreSession()` returns null and storage was cleared by hydrate block, show `"Sua conta está inativa. Entre em contato com o suporte."`

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Restore revalidates all four seller lifecycle statuses
- [ ] `inactive` seller cannot remain authenticated after restore
- [ ] Fetch failure does not assume `active`
- [ ] Account inactive on restore clears session with PT toast
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-session-status-sync/prd.md` ← read first
- `tasks/prd-seller-session-status-sync/techspec.md` ← read first
- `src/contexts/AuthContext.tsx` ← modify
- `src/contexts/SellerContext.tsx` ← read (retry on mount)
- `src/services/auth.service.ts` ← read (hydrate from task 1)
- `src/services/seller-registration.service.ts` ← read (`fetchSellerBackendStatus`, messages)
