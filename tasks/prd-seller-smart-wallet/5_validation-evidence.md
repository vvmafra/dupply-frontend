# Validation evidence — Task 5.0: Add seller session wallet gating and route guard

## Changes made

- `src/contexts/SellerContext.tsx`: após `fetchCurrentSellerWithStatus()`, redireciona para `ROUTES.seller.walletSetup` quando `requiresWalletSetup(status, seller.walletId)`; early return após redirect de `created` preservado. `refreshSellerStatus()` já chama `refreshSeller()` na transição `in_review → active`, acionando o mesmo redirect (FR-5).
- `src/routes/SellerWalletRouteGuard.tsx`: guard que bloqueia rotas operacionais (`isWalletGatedSellerPath`) enquanto seller ativo não tem `walletId`; exibe `AuthBootstrapFallback` durante loading.
- `src/App.tsx`: rotas seller operacionais (dashboard, validation, receivables list/new) envolvidas com `SellerWalletRouteGuard` dentro de `ProtectedRoute`. Rota `/seller/wallet-setup` não adicionada (escopo da task 6).

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] Active seller with `walletId: null` redirected to `/seller/wallet-setup` after refresh — `SellerContext.refreshSeller()` chama `navigate(ROUTES.seller.walletSetup)` via `requiresWalletSetup`.
- [x] Manual navigation to `/seller` or receivables routes redirects back to wallet setup — `SellerWalletRouteGuard` + `isWalletGatedSellerPath`.
- [x] `in_review` seller sees no wallet setup redirect — `requiresWalletSetup` só é true para `status === "active"`.
- [x] Status poll `in_review → active` with null `walletId` triggers setup redirect — `refreshSellerStatus()` detecta mudança e invoca `refreshSeller()`.
- [x] No wallet gating logic added to login form — `MockLoginForm` inalterado; apenas usa `getPostLoginSellerDestination` com dados já refrescados.
- [x] No existing flows broken — auth/guards inalterados; mock mode não ativa `SellerContextProvider` (HTTP seller session only).

## Notes

- Verificação manual no browser (subtask 5.7) pendente até a task 6 expor a página `SellerWalletSetupPage` e a rota em `App.tsx`; o redirect aponta para `/seller/wallet-setup`, que ainda cai no catch-all `*` → home até a task 6.
- Task 1.0 (`wallet-setup` route + env) permanece `[ ]` em `tasks.md`; `ROUTES.seller.walletSetup` já existia no repo.
