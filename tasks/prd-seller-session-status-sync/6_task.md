# Task 6.0: Add login session-active banner (P2) and final verification

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Implement minimal P2 login UX: when a user visits the login route with an active session, show an inline Portuguese banner with options to continue to the app or log out and sign in again — instead of a silent redirect. Extend `GuestRoute` with `allowAuthenticatedView` for the login route only. Run full manual regression from the tech spec test strategy and confirm `npm run typecheck` passes. Corresponds to techspec §8 (P2).

Depends on: 3.0

## Requirements

- FR-21: Login route with restored session shows clear feedback and paths to continue or log out
- FR-20: All copy in Portuguese
- FR-18: Non-seller personas unaffected
- Complete manual test strategy from techspec (approval while logged in, restore after approval, inactive/created/account inactive, mock regression, non-seller)

## Subtasks

- [ ] 6.1 Read `src/routes/guards.tsx` — `GuestRoute` redirect behavior
- [ ] 6.2 Add `allowAuthenticatedView?: boolean` to `GuestRoute`; when true and authenticated, render children
- [ ] 6.3 Update `src/App.tsx` — `<GuestRoute allowAuthenticatedView><LoginPage /></GuestRoute>`
- [ ] 6.4 Create `src/components/auth/SessionActiveBanner.tsx` with PT copy and actions
- [ ] 6.5 Update `src/pages/LoginPage.tsx` to show banner when authenticated
- [ ] 6.6 Manual: login with active session shows banner; Continue / Log out work
- [ ] 6.7 Manual: full techspec test strategy checklist
- [ ] 6.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §8 P2 — Login session-already-active UX**.

```tsx
// App.tsx
<GuestRoute allowAuthenticatedView>
  <LoginPage />
</GuestRoute>
```

`SessionActiveBanner` content (FR-20):

- Message: `"Você já está conectado como {email}"`
- **Continuar** → `navigate(getProfileRedirect(selectedProfile))`
- **Sair e entrar novamente** → `logout()` then stay on login

No dedicated interstitial route. Import `getProfileRedirect` from existing auth/routing helpers.

### Manual verification (from techspec Test strategy)

| Scenario | Expected |
|----------|----------|
| `in_review` logged in → admin approves | ~30s overlay gone, Nova recebível enabled |
| Session restore after approval to `active` | Dashboard, no overlay, registration allowed |
| Seller `inactive` on restore | Session cleared, rejection toast |
| Seller `created` on restore | Redirect to `/register/seller` |
| Account `inactive` on restore | Session cleared, inactive account toast |
| Mock mode demo login | Unchanged behavior |
| Admin/analyst login | No seller polling or extra GETs |

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Login page shows session-active banner instead of silent redirect
- [ ] Continue and log-out actions work correctly
- [ ] All techspec manual scenarios pass
- [ ] Mock mode and non-seller personas unchanged
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-session-status-sync/prd.md` ← read first
- `tasks/prd-seller-session-status-sync/techspec.md` ← read first
- `src/components/auth/SessionActiveBanner.tsx` ← create
- `src/pages/LoginPage.tsx` ← modify
- `src/routes/guards.tsx` ← modify
- `src/App.tsx` ← modify
- `src/contexts/AuthContext.tsx` ← read (`logout`, profile redirect helpers)
