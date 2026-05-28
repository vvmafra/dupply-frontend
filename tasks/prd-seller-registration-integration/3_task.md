# Task 3.0: Add seller lifecycle routing helpers

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create a pure routing module that maps backend seller lifecycle status (`created`, `in_review`, `active`, `inactive`) to navigation destinations and registration page gate rules. This centralizes post-login redirect logic and `/register/seller` access control used by pages and auth flows in later tasks. Corresponds to techspec Component design §4.

Depends on: none

## Requirements

- FR-11: Sellers with status `created` must be routed to `/register/seller` after login
- FR-17: Logged-in sellers with `in_review` or `active` status must not access the editable registration wizard
- FR-18: `inactive` status must throw a blocking error for callers to clear session and show PT message

## Subtasks

- [ ] 3.1 Read `src/lib/routes.ts` and existing post-login redirect patterns in `MockLoginForm.tsx`
- [ ] 3.2 Create `src/domain/seller/seller-registration.routing.ts` with lifecycle types and helpers
- [ ] 3.3 Implement `SellerRegistrationBlockedError` for inactive sellers
- [ ] 3.4 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §4**.

```ts
export type SellerLifecycleStatus = SellerStatusDTO;

export function getPostLoginSellerDestination(status: SellerLifecycleStatus): string {
  switch (status) {
    case "created":
      return ROUTES.sellerRegistration;
    case "in_review":
    case "active":
      return ROUTES.seller.dashboard;
    case "inactive":
      throw new SellerRegistrationBlockedError();
  }
}

export function getRegistrationPageRedirect(
  isAuthenticated: boolean,
  status: SellerLifecycleStatus | null,
): string | null {
  if (!isAuthenticated) return null;
  if (status === "created") return null; // allow wizard
  if (status === "in_review" || status === "active") return ROUTES.seller.dashboard;
  return ROUTES.login;
}
```

Import `SellerStatusDTO` from `seller.dto.ts`. No React or service imports — pure domain module only.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Routing helpers cover all four lifecycle statuses
- [ ] `inactive` throws `SellerRegistrationBlockedError` instead of returning a route
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `tasks/prd-seller-registration-integration/integration-spec.md` ← read first
- `src/domain/seller/seller-registration.routing.ts` ← create
- `src/services/seller.dto.ts` ← read (SellerStatusDTO)
- `src/lib/routes.ts` ← read
