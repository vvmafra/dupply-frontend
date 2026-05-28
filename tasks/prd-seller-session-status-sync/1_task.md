# Task 1.0: Extend auth and seller service adapters for lifecycle hydration

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Update the HTTP auth service to return account status from `GET /v1/accounts/me` and block restore/login when the account is `inactive`, without breaking restore when hydration fails. Add `fetchCurrentSellerWithStatus()` to the seller service so `SellerContext` can load mapped profile and lifecycle status in one round-trip. Corresponds to techspec §3 (`auth.service.ts`) and §1 (`seller.service.ts` — `fetchCurrentSellerWithStatus`).

Depends on: none

## Requirements

- FR-5: When account hydration returns `status: inactive`, clear auth storage and treat restore/login as no session
- FR-6: Account hydration failure must not break session restore; keep JWT/snapshot fallback
- FR-20: Reuse Portuguese inactive account copy: `"Sua conta está inativa. Entre em contato com o suporte."`
- Foundation for FR-7, FR-8 (shared seller state will consume these service functions in task 2)

## Subtasks

- [ ] 1.1 Read `src/services/auth.service.ts` — `hydrateUserFromApi`, `restoreSessionImpl`, `httpLoginImpl`
- [ ] 1.2 Change hydration to return `{ user, status }`; block when `status === "inactive"` in restore and login paths
- [ ] 1.3 Read `src/services/seller.service.ts` and `seller-profile.mapper.ts`
- [ ] 1.4 Add `fetchCurrentSellerWithStatus()` returning `{ seller, status }` via single `GET /v1/sellers/:id`
- [ ] 1.5 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §3 `auth.service.ts` — account inactive on restore** and **§1 `fetchCurrentSellerWithStatus`**.

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
    return null; // FR-6
  }
}
```

In `restoreSessionImpl()` and `httpLoginImpl()`:

```ts
if (hydrated?.status === "inactive") {
  clearAuthStorage();
  return null;
}
```

```ts
export async function fetchCurrentSellerWithStatus(): Promise<{
  seller: SellerCompany;
  status: SellerStatusDTO;
}> {
  const sellerId = resolveSellerIdFromSession();
  const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
  return { seller: mapSellerDtoToCompany(dto), status: dto.status };
}
```

Mock mode paths must remain unchanged (`resolveApiMode()`). Do not add React or context code in this task.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Account `inactive` clears storage on restore and login hydrate
- [ ] Hydrate failure still allows restore with snapshot/JWT fallback
- [ ] `fetchCurrentSellerWithStatus()` exists and maps DTO in one GET
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-session-status-sync/prd.md` ← read first
- `tasks/prd-seller-session-status-sync/techspec.md` ← read first
- `src/services/auth.service.ts` ← modify
- `src/services/seller.service.ts` ← modify
- `src/services/seller.dto.ts` ← read
- `src/domain/seller/seller-profile.mapper.ts` ← read
