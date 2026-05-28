# Validation evidence — Task 2.0: Add SellerContext, SellerProvider, and main.tsx wiring

## Changes made

- `src/contexts/SellerContext.tsx`: Created shared seller state with `refreshSeller`, `refreshSellerStatus`, HTTP-only activation, mock/no-op defaults, and post-refresh redirect for `created` status.
- `src/main.tsx`: Wired `AuthProvider` → `SellerProvider` → `App`; moved `BrowserRouter` to `main.tsx` so `useNavigate` works in `SellerProvider`.
- `src/App.tsx`: Removed duplicate `BrowserRouter` wrapper.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `useSeller()` available; throws outside provider like `useAuth()`
- [x] HTTP seller login/restore triggers bootstrap refresh on mount — `useEffect` in `SellerContextProvider`
- [x] `created` sellers redirected to registration after first successful refresh
- [x] Mock and non-seller flows unchanged — noop context when not HTTP seller session
- [x] No existing flows broken

## Notes

Moved `BrowserRouter` from `App.tsx` to `main.tsx` so `SellerProvider` can call `useNavigate` for the `created` redirect (required by techspec §2).
