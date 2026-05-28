# Validation evidence — Task 3.0: Revalidate full seller lifecycle on session restore in AuthContext

## Changes made

- `src/contexts/AuthContext.tsx`: Extended HTTP seller restore to fetch full lifecycle status before authenticating; handles `inactive` (logout + toast), `created`/`in_review`/`active` (keep session with default seller profile), and fetch errors (authenticate + retry toast, no `active` assumption). Shows account inactive toast when restore blocked.
- `src/services/auth.service.ts`: Added `takeRestoreBlockReason()` to surface account-inactive restore blocks to AuthContext.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] Restore revalidates all four seller lifecycle statuses
- [x] `inactive` seller cannot remain authenticated after restore
- [x] Fetch failure does not assume `active` — error toast + authenticated with SellerProvider retry
- [x] Account inactive on restore clears session with PT toast
- [x] No existing flows broken

## Notes

Added `takeRestoreBlockReason()` in auth service (small extension to task 1) so AuthContext can distinguish account-inactive restore failures from other null-restore cases.
