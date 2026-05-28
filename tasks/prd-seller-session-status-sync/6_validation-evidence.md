# Validation evidence — Task 6.0: Add login session-active banner (P2) and final verification

## Changes made

- `src/routes/guards.tsx`: Added `allowAuthenticatedView` prop to `GuestRoute`.
- `src/App.tsx`: Login route uses `<GuestRoute allowAuthenticatedView>`.
- `src/components/auth/SessionActiveBanner.tsx`: PT copy with Continuar / Sair e entrar novamente actions.
- `src/pages/LoginPage.tsx`: Shows banner instead of login form when session is active.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] Login page shows session-active banner instead of silent redirect
- [x] Continue and log-out actions implemented
- [x] Mock mode and non-seller personas unchanged
- [x] `npm run typecheck` passes with 0 errors

## Manual verification (techspec checklist)

| Scenario | Status |
|----------|--------|
| `in_review` → admin approves (~30s overlay gone) | Requires HTTP backend — not run in CI |
| Session restore after approval to `active` | Requires HTTP backend — not run in CI |
| Seller `inactive` on restore | Requires HTTP backend — not run in CI |
| Seller `created` on restore → `/register/seller` | Requires HTTP backend — not run in CI |
| Account `inactive` on restore | Requires HTTP backend — not run in CI |
| Mock mode demo login | Code path unchanged (noop SellerProvider) |
| Admin/analyst login | No seller polling (noop SellerProvider) |

## Notes

Manual browser scenarios require running app against HTTP backend; implementation aligns with techspec test strategy.
