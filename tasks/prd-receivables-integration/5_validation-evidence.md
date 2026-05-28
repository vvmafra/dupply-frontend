# Validation evidence — Task 5.0: Wire seller form, list, new page, and dashboard previews

## Changes made

- `src/components/forms/NewReceivableForm.tsx`: Save vs Submit actions, Zod validation, edit lock
- `src/pages/seller/SellerReceivablesPage.tsx`, `NewReceivablePage.tsx`
- `src/components/seller/SellerReceivablesPreview.tsx`, `SellerValidationReceivablesOverview.tsx`
- Updated `SellerDashboardPage`, `SellerValidationPage`, `SellerDashboardSummary`, `SellerValidationProgress`

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] Separate Save and Submit API paths
- [x] Atomic submit without prior draft id
- [x] List with PT status badges and offer wizard
