# Validation evidence — Task 7.0: Migrate routes, navigation, and delete legacy duplicata stack

## Changes made

- `src/lib/routes.ts`: canonical `/seller/receivables/*` and `/analyst/receivables/*`
- `src/App.tsx`: new pages + redirects from `/duplicatas/*`
- `src/components/layout/Sidebar.tsx`: receivable nav labels
- Deleted mock duplicata stack (service, domain, mocks, old pages/components)
- Fixed analyst seller review imports (`CadastralReviewBadge`, `seller-receivable-access`)

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] Canonical routes registered with legacy redirects
- [x] Duplicata mock files deleted
- [x] Admin/confirmation untouched
