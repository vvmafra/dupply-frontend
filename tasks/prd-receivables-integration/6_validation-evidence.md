# Validation evidence — Task 6.0: Wire analyst list, detail, and dashboard counts

## Changes made

- `src/pages/analyst/AnalystReceivablesPage.tsx`, `AnalystReceivableDetailPage.tsx`
- Updated `AnalystDashboardPage` to count `under_review` via `fetchReceivables`

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] Analyst list/detail wired to HTTP service
- [x] Offer/reprove actions when `status === under_review`
- [x] No simulated scores; TODO placeholder only
