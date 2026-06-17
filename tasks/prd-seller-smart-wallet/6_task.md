# Task 6.0: Build wallet setup page and educational UX

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create the blocking wallet setup page and panel component with Portuguese educational copy explaining digital wallet creation, passkey responsibility, and testnet Friendbot funding. Wire the page route in `App.tsx` and connect the primary CTA to `WalletContext.createAndRegisterWallet()`. Handle loading, error, and retry states including partial-failure recovery UI. Corresponds to techspec §7 (Seller wallet setup page and UX).

Depends on: 4.0, 5.0

## Requirements

- FR-8: UI must inform seller that testnet XLM funding is automatic via Friendbot
- FR-10: UI must explain (a) a digital wallet is being created and (b) seller is responsible for managing passkey access
- FR-13: On registration failure after on-chain success, show recoverable Portuguese error with retry action (calls `retryBackendRegistration()`)
- FR-22: Include note that mainnet support and production funding are deferred to a future version

## Subtasks

- [ ] 6.1 Read an existing seller page (e.g. under-review overlay pattern) for layout conventions
- [ ] 6.2 Create `src/pages/seller/SellerWalletSetupPage.tsx` — page shell and redirect if `walletId` already set
- [ ] 6.3 Create `src/components/seller/SellerWalletSetupPanel.tsx` — intro copy, CTA, loading/error/success states
- [ ] 6.4 Wire primary CTA "Criar minha carteira" to `createAndRegisterWallet("Dupply", seller.email)`
- [ ] 6.5 Add retry UI for partial failure: "Carteira criada na rede, mas não vinculada. Tente novamente."
- [ ] 6.6 Add route in `App.tsx` for `/seller/wallet-setup` (ProtectedRoute + AppShell, not wrapped by guard)
- [ ] 6.7 Verify component renders correctly (manual browser check)
- [ ] 6.8 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §7 Seller wallet setup page and UX** and **55-smart-account-kit.mdc → UX (português)**.

| Section | Content |
|---------|---------|
| Intro | Carteira digital Stellar (testnet) será criada para receber operações on-chain. |
| Passkey | Acesso protegido por passkey (biometria/PIN). **Você é responsável** por manter essa passkey. |
| Friendbot | No testnet, saldo XLM é creditado automaticamente via Friendbot. |
| Mainnet note | Suporte a rede principal e financiamento em produção serão disponibilizados em versão futura. |

States: idle → creating (WebAuthn) → registering (POST) → success redirect to dashboard → error with retry.

On success: `navigate(ROUTES.seller.dashboard, { replace: true })` after seller refresh confirms non-null `walletId`.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Setup page accessible at `/seller/wallet-setup` for active sellers without wallet
- [ ] Seller with existing `walletId` is redirected away from setup page to dashboard
- [ ] Portuguese copy covers wallet creation, passkey responsibility, Friendbot, and mainnet deferral
- [ ] CTA triggers WebAuthn prompt and full create + register flow
- [ ] Partial failure shows retry without triggering second `createWallet()`
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-smart-wallet/prd.md` ← read first
- `tasks/prd-seller-smart-wallet/techspec.md` ← read first
- `.cursor/rules/55-smart-account-kit.mdc` ← read
- `src/pages/seller/SellerWalletSetupPage.tsx` ← create
- `src/components/seller/SellerWalletSetupPanel.tsx` ← create
- `src/contexts/WalletContext.tsx` ← read (from task 4)
- `src/App.tsx` ← modify (setup route)
- `src/lib/routes.ts` ← read (from task 1)
