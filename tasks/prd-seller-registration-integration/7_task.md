# Task 7.0: Update registration and completion pages with lifecycle gates

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Replace blunt authenticated-user redirects on `SellerRegistrationPage` with lifecycle-aware gate logic using `loadSellerRegistrationState()` and routing helpers. Update `SellerRegistrationCompletePage` so the seller stays logged in and the primary CTA enters the seller dashboard. Corresponds to techspec Component design §8–9.

Depends on: 3.0, 4.0, 6.0

## Requirements

- FR-7: Completion page messaging consistent with submit toast (under review, 24 hours)
- FR-8: Primary CTA "Acessar minha área" navigates to seller dashboard with session active
- FR-11: Page allows wizard for authenticated sellers with `created` status
- FR-12: Page triggers wizard resume hydration path for `created` sellers
- FR-17: Redirect `in_review` and `active` sellers away from editable wizard to dashboard

## Subtasks

- [ ] 7.1 Read current `SellerRegistrationPage.tsx` and `SellerRegistrationCompletePage.tsx`
- [ ] 7.2 Implement lifecycle gate on registration page (`loading` / `wizard` / `redirect` states)
- [ ] 7.3 Use `getRegistrationPageRedirect()` for authenticated non-`created` sellers
- [ ] 7.4 Update completion page copy — remove "log in after approval" messaging
- [ ] 7.5 Add primary CTA with `setProfile("seller")` → `ROUTES.seller.dashboard`
- [ ] 7.6 Verify page redirects and completion CTA in browser (manual check)
- [ ] 7.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §8–9**.

Registration page gate pattern:

```tsx
useEffect(() => {
  if (isLoading) return;
  if (!isAuthenticated) {
    setGate("wizard");
    return;
  }
  void (async () => {
    try {
      const { status } = await loadSellerRegistrationState();
      const dest = getRegistrationPageRedirect(true, status);
      if (dest) {
        setRedirectTo(dest);
        setGate("redirect");
      } else {
        setGate("wizard");
      }
    } catch (err) {
      if (err instanceof SellerRegistrationBlockedError) {
        /* logout handled by caller */
      }
      setGate("wizard");
    }
  })();
}, [isAuthenticated, isLoading]);
```

Completion page decision (PRD open question resolved): default landing = **seller dashboard** with under-review banner.

```tsx
<Button asChild>
  <Link to={ROUTES.seller.dashboard} onClick={() => setProfile("seller")}>
    Acessar minha área
  </Link>
</Button>
```

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Unauthenticated users see the public registration wizard
- [ ] `created` sellers can access and resume the wizard
- [ ] `in_review` / `active` sellers are redirected to dashboard
- [ ] Completion page CTA keeps session and lands on seller dashboard
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `tasks/prd-seller-registration-integration/integration-spec.md` ← read first
- `src/pages/SellerRegistrationPage.tsx` ← modify
- `src/pages/SellerRegistrationCompletePage.tsx` ← modify
- `src/domain/seller/seller-registration.routing.ts` ← read
- `src/services/seller-registration.service.ts` ← read
