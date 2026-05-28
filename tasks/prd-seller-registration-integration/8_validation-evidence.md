# Validation evidence — Task 8.0: Add login redirect, inactive session guard, and in-review banner

## Changes made

- `src/domain/seller/seller-registration.routing.ts`: exported `INACTIVE_SELLER_REJECTION_MESSAGE` for reuse in login and session-restore flows (FR-16, FR-18).
- `src/components/auth/MockLoginForm.tsx`: after HTTP login with auto-selected seller profile, fetches `fetchSellerBackendStatus()` before establishing UI session; `inactive` clears storage and shows rejection toast; `created` redirects to `/register/seller`; other statuses use existing dashboard redirect with `from` fallback (FR-11, FR-18).
- `src/contexts/AuthContext.tsx`: on session restore in HTTP mode for seller role, fetches backend status and clears session + toast when `inactive` (FR-18).
- `src/components/layout/AppShell.tsx`: fetches seller status on mount when profile is `seller` (HTTP mode) and shows persistent under-review banner when status is `in_review` (FR-9).

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — verified via `npm run typecheck`.
- [x] `created` seller login redirects to `/register/seller` — implemented in `MockLoginForm` via `status === "created" ? ROUTES.sellerRegistration`.
- [x] `inactive` seller cannot stay authenticated after login or session restore — login calls `logoutFromService()` before `loginWithSession`; restore calls `logoutFromService()` and resets to guest state.
- [x] `in_review` seller sees persistent banner in AppShell — `showUnderReviewBanner` when `sellerStatus === "in_review"`.
- [x] `active` seller has no banner and operational gates work per Slice A — banner only for `in_review`; `canSellerRegisterDuplicatas()` already returns `false` when `validationStatus !== "APPROVED"` (mapped `in_review` → `UNDER_REVIEW`, `active` → `APPROVED`); verified usages in `SellerDashboardPage`, `NewDuplicataPage`, `SellerDuplicatasPage`, `SellerValidationPage`, `SellerValidationProgress`.
- [x] No existing flows broken (auth, profile selection, navigation) — mock mode and non-seller login paths unchanged; seller HTTP login falls back to default redirect on fetch failure.

## Notes

- Manual browser E2E (subtask 8.7) not run in this session — requires live backend with sellers in `created`, `inactive`, and `in_review` states.
- Inactive guard centralized in `AuthContext` restore effect (techspec §11 alternative) to avoid coupling `auth.service` to registration service.
- Login flow checks seller status before `loginWithSession()` so inactive sellers never briefly appear authenticated in React state.
