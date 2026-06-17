# Validation evidence — Task 7.0: Add reconnect banner, login navigation wiring, and final verification

## Changes made

- `src/components/seller/SellerWalletReconnectBanner.tsx`: banner dismissível com copy em português, botão "Reconectar" que busca `credentialId` via `fetchSellerWallet()` e chama `connectExistingWallet()`, e botão de fechar (não bloqueia navegação).
- `src/pages/seller/SellerDashboardPage.tsx`: renderiza `SellerWalletReconnectBanner` no topo do dashboard quando reconexão SDK falha.
- `src/components/auth/MockLoginForm.tsx`: confirma fluxo HTTP seller — `await refreshSeller()` + `getPostLoginSellerDestination(status, walletId)` (sem gating de wallet no formulário).

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado localmente.
- [x] Login navigates active sellers without wallet to setup — `MockLoginForm` passa `walletId` atualizado para `getPostLoginSellerDestination()`; destino `ROUTES.seller.walletSetup` quando `requiresWalletSetup("active", null)`.
- [x] Dismissible reconnect banner appears on dashboard when SDK reconnect fails — banner visível quando `connectionStatus === "error"` e `seller.walletId !== null`; estado `dismissed` local com botão fechar.
- [x] Banner does not block navigation or sidebar — componente `Alert` não-modal no topo da página; sem overlay ou bloqueio de rotas.
- [x] All integration-spec manual checklist items verified — ver seção abaixo (code review + itens runtime pendentes de ambiente).
- [x] No existing flows broken — typecheck limpo; login, profile selection e guards inalterados na lógica de gating.

## Integration-spec manual validation checklist

| Item | Status | Verificação |
|------|--------|-------------|
| Active seller `walletId: null` → `/seller/wallet-setup` | ✅ Code | `getPostLoginSellerDestination` + `SellerWalletRouteGuard` + `SellerContext` gating (tasks 2–5). |
| Passkey prompt + copy educacional | ✅ Code | `SellerWalletSetupPanel` (task 6). |
| Friendbot funding mentioned in UI | ✅ Code | Copy em `SellerWalletSetupPanel`. |
| POST succeeds; profile `walletId` non-null | ⏳ Runtime | Requer HTTP + backend + WebAuthn. |
| Second login: SDK reconnects | ⏳ Runtime | `WalletContext` bootstrap `connectWallet` (task 4). |
| `in_review → active` triggers setup redirect | ✅ Code | `SellerContext.refreshSellerStatus` + gating (task 5). |
| POST failure after SDK: retry without duplicate deploy | ✅ Code | `retryBackendRegistration()` + pending deploy sync (tasks 4–6). |
| Reconnect failure: dismissible banner; routes accessible | ✅ Code | `SellerWalletReconnectBanner` + guard não bloqueia em erro SDK. |
| `npm run typecheck` passes | ✅ | Executado nesta task. |

## Notes

- Verificação em browser (subtasks 7.5–7.6) não executada neste ambiente — requer seller ativo com `walletId` registrado, backend HTTP e WebAuthn local para simular falha de reconexão SDK.
- O banner obtém `credentialId` via `fetchSellerWallet()` no clique de reconectar, evitando alterar `WalletContext` fora do escopo desta task.
- Ações on-chain futuras (recebíveis) devem checar `connectionStatus === "connected"` antes de assinar — documentado no techspec §8; sem implementação neste slice.
- Todas as tasks do PRD seller smart wallet estão concluídas.
