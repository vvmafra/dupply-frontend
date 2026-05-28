# Task 3.0: Extend JWT payload with profileId for seller ID resolution

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Extend `decodeJwtPayload` to include the optional `profileId` claim and add `getSellerProfileIdFromToken()` so the seller service can resolve the logged-in seller's ID from the access token on demand. This avoids migrating `PersistedAuthSnapshot` — the JWT remains the single source of truth. Corresponds to techspec Component design §1.

Depends on: none

## Requirements

- FR-2: Seller ID resolution from JWT `profileId` claim for seller role accounts
- FR-3: Return `null` when token is invalid, role is not `seller`, or `profileId` is missing (caller throws `SellerProfileError` in Task 4)

## Subtasks

- [ ] 3.1 Read `auth-jwt.ts`, `auth-session.types.ts`, and integration-spec auth resolution section
- [ ] 3.2 Add optional `profileId` to decoded JWT payload type
- [ ] 3.3 Implement `getSellerProfileIdFromToken(token: string): string | null`
- [ ] 3.4 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §1** and **integration-spec.md → Auth resolution**.

```ts
// Before
type JwtPayload = {
  sub: string;
  role: string;
  exp?: number;
};

// After
type JwtPayload = {
  sub: string;
  role: string;
  profileId?: string;
  exp?: number;
};

export function getSellerProfileIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.role !== "seller" || !payload.profileId) return null;
  return payload.profileId;
}
```

Do not persist `profileId` in the auth snapshot — decode on demand only. No changes to login/restore flows.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `decodeJwtPayload` accepts tokens with optional `profileId` without breaking existing auth decode
- [ ] `getSellerProfileIdFromToken` returns seller ID only when `role === "seller"` and `profileId` is present
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-profile-integration/prd.md` ← read first
- `tasks/prd-seller-profile-integration/techspec.md` ← read first
- `tasks/prd-seller-profile-integration/integration-spec.md` ← read first
- `src/domain/auth/auth-jwt.ts` ← modify
- `src/domain/auth/auth-session.types.ts` ← read
- `src/lib/token-storage.ts` ← read (`getAccessToken`)
