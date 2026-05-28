# Task 8.0: Add login redirect, inactive session guard, and in-review banner

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Complete the seller lifecycle integration outside the wizard: post-login redirect for `created` sellers, session restore blocking for `inactive` sellers, and a persistent under-review banner in the seller shell. Verify existing operational gates (`canSellerRegisterDuplicatas`) still disable actions while `in_review`. Corresponds to techspec Component design §10–12.

Depends on: 3.0, 4.0, 7.0

## Requirements

- FR-9: While `in_review`, show persistent banner and disable operational actions; navigation remains available
- FR-10: When status becomes `active`, banner and restrictions lift via existing Slice A gates
- FR-11: Login redirects `created` sellers to `/register/seller`
- FR-18: `inactive` sellers are logged out on login attempt and session restore with PT rejection message
- FR-16: Inactive rejection toast: "Seu cadastro não foi aprovado. Entre em contato com o suporte para mais informações."

## Subtasks

- [ ] 8.1 Read `MockLoginForm.tsx`, `auth.service.ts` / `AuthContext.tsx`, and `AppShell.tsx`
- [ ] 8.2 After seller login, fetch backend status and redirect `created` → wizard, others → dashboard
- [ ] 8.3 On `inactive` login, call logout, clear session, show rejection toast
- [ ] 8.4 Add inactive guard on session restore (auth.service or AuthContext)
- [ ] 8.5 Add under-review banner in AppShell when seller profile is `in_review`
- [ ] 8.6 Verify existing `canSellerRegisterDuplicatas()` gates cover dashboard CTAs — fix gaps only if found
- [ ] 8.7 Manual browser check: login redirect, inactive block, in-review banner, active lift
- [ ] 8.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §10–12** and **integration-spec.md → Auth & error handling**.

Post-login redirect (`MockLoginForm.tsx`):

```tsx
if (autoProfile === "seller") {
  const status = await fetchSellerBackendStatus();
  if (status === "inactive") {
    await logoutFromService();
    toast.error("Seu cadastro não foi aprovado. Entre em contato com o suporte para mais informações.");
    return;
  }
  const dest =
    status === "created"
      ? ROUTES.sellerRegistration
      : (fromPath ?? getProfileRedirect(autoProfile));
  navigate(dest, { replace: true });
}
```

Session restore: after `restoreSessionImpl` succeeds for seller role, call `fetchSellerBackendStatus()` — if `inactive`, clear storage and return `null`. Prefer centralizing in `AuthContext` restore effect if it avoids circular imports.

Under-review banner (`AppShell.tsx`):

```tsx
{showUnderReviewBanner && (
  <Alert variant="default" className="mb-4">
    Seu cadastro está em análise. Responderemos em até 24 horas. Enquanto isso, você pode
    navegar pela plataforma, mas ações operacionais estão desabilitadas.
  </Alert>
)}
```

Fetch status once on mount via `fetchCurrentSeller()` or `fetchSellerBackendStatus()`. Operational disable should already work via `canSellerRegisterDuplicatas()` returning false when `validationStatus !== "APPROVED"` — verify dashboard CTA and duplicata routes only.

Manual E2E checklist: see **techspec.md → Test strategy** (happy path, resume, status gates, errors).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `created` seller login redirects to `/register/seller`
- [ ] `inactive` seller cannot stay authenticated after login or session restore
- [ ] `in_review` seller sees persistent banner in AppShell
- [ ] `active` seller has no banner and operational gates work per Slice A
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `tasks/prd-seller-registration-integration/integration-spec.md` ← read first
- `src/components/auth/MockLoginForm.tsx` ← modify
- `src/services/auth.service.ts` ← modify (or AuthContext)
- `src/contexts/AuthContext.tsx` ← modify (session restore guard)
- `src/components/layout/AppShell.tsx` ← modify
- `src/services/seller-registration.service.ts` ← read (fetchSellerBackendStatus)
- `src/domain/seller/seller-registration.routing.ts` ← read
