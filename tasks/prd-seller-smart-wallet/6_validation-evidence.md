# Validation evidence — Task 6.0: Build wallet setup page and educational UX

## Changes made

- `src/pages/seller/SellerWalletSetupPage.tsx`: página de setup com bootstrap do seller, redirecionamento para dashboard quando `walletId` existe, e redirecionamento para destino correto quando status não é `active`.
- `src/components/seller/SellerWalletSetupPanel.tsx`: copy educacional em português (carteira, passkey, Friendbot, mainnet futuro), CTA "Criar minha carteira", estados de loading/erro/falha parcial com retry via `retryBackendRegistration()`.
- `src/App.tsx`: rota `/seller/wallet-setup` com `ProtectedRoute` + `AppShell` (sem `SellerWalletRouteGuard`).
- `src/components/layout/AppShell.tsx`: header `logoutOnly` na rota de wallet setup, alinhado ao padrão under-review.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado localmente.
- [x] Setup page accessible at `/seller/wallet-setup` — rota registrada em `App.tsx`.
- [x] Seller with existing `walletId` redirected to dashboard — `useEffect` em `SellerWalletSetupPage`.
- [x] Portuguese copy covers wallet creation, passkey responsibility, Friendbot, and mainnet deferral — seções no `SellerWalletSetupPanel`.
- [x] CTA triggers `createAndRegisterWallet(smartAccountEnv.rpName, seller.email)` — handler do botão principal.
- [x] Partial failure shows retry without second `createWallet()` — UI de falha parcial chama `retryBackendRegistration()`; detecção por `server_error` / `network` em `WalletRegistrationError`.
- [x] No existing flows broken — typecheck limpo; guard e rotas operacionais inalterados.

## Notes

- Verificação em browser (subtask 6.7) não executada neste ambiente — requer seller ativo sem `walletId` e WebAuthn local.
- Estado de loading unifica criação WebAuthn + POST em um único passo visual (`processing`), pois `WalletContext` expõe uma única operação atômica `createAndRegisterWallet`.
- Próxima task sugerida: **7.0** — banner de reconexão, wiring de login e verificação final.
