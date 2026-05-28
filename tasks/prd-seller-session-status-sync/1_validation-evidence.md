# Validation evidence — Task 1.0: Extend auth and seller service adapters for lifecycle hydration

## Changes made

- `src/services/auth.service.ts`: Replaced `hydrateUserFromApi` with `hydrateAccountFromApi` returning `{ user, status }`; blocks restore/login when account status is `inactive` (clears storage).
- `src/services/seller.service.ts`: Added `fetchCurrentSellerWithStatus()` returning mapped `SellerCompany` and `SellerStatusDTO` in a single GET.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors
- [x] Account `inactive` clears storage on restore and login hydrate — implemented in `restoreSessionImpl` and `httpLoginImpl`
- [x] Hydrate failure still allows restore with snapshot/JWT fallback — catch returns null, session continues with snapshot user
- [x] `fetchCurrentSellerWithStatus()` exists and maps DTO in one GET
- [x] No existing flows broken — mock paths unchanged

## Notes

None.
