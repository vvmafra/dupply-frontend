# Validation evidence — Task 5.0: Migrate seller pages to useSeller() for capability gates

## Changes made

- `src/pages/seller/SellerDashboardPage.tsx`: Uses `useSeller()` for profile; keeps local receivables fetch.
- `src/pages/seller/SellerValidationPage.tsx`: Uses `useSeller()`; calls `refreshSeller()` after validation update.
- `src/pages/seller/SellerReceivablesPage.tsx`: Uses `useSeller()` for capability gate on header action.
- `src/pages/seller/NewReceivablePage.tsx`: Gate from shared `seller` via `canSellerRegisterReceivables`.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] All four seller pages use `useSeller()` instead of isolated mount fetch
- [x] New receivable gate reacts to shared seller updates
- [x] Validation page refreshes shared profile after status update
- [x] No existing flows broken

## Notes

Receivables data still fetched per-page (orthogonal to seller profile sync).
