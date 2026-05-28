# Validation evidence — Task 4.0: Wire AppShell polling and seller login via shared seller state

## Changes made

- `src/components/layout/AppShell.tsx`: Replaced local seller status state with `useSeller().lifecycleStatus` and polling via `refreshSellerStatus` at 30s when `in_review`.
- `src/components/auth/MockLoginForm.tsx`: HTTP seller login uses `refreshSeller()` + `getPostLoginSellerDestination()` instead of direct `fetchSellerBackendStatus`.
- `src/contexts/SellerContext.tsx`: `refreshSeller()` now returns lifecycle status for login routing.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] Under-review overlay driven by shared `lifecycleStatus`
- [x] Polling at 30s updates shared state on status change
- [x] Seller login navigates via `getPostLoginSellerDestination` for all statuses
- [x] No duplicate status-fetch logic in login form
- [x] No existing flows broken

## Notes

None.
