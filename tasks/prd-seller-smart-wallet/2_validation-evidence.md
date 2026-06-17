# Validation evidence — Task 2.0: Add wallet domain helpers and extend seller types/routing

## Changes made

- `src/domain/wallet/wallet-gating.ts`: criado com `requiresWalletSetup()`, `SELLER_WALLET_GATED_ROUTES` (dashboard, validation, receivables list/new) e `isWalletGatedSellerPath()`.
- `src/domain/wallet/wallet-payload.ts`: criado com `publicKeyToHex()`, `buildRegisterPayload()` e tipo `RegisterSellerWalletPayload` (domínio puro — sem import de services).
- `src/domain/wallet/wallet.errors.ts`: criado com `WalletRegistrationError`, `mapWalletApiError()` e mensagens PT da integration-spec (incl. retry em 5xx).
- `src/domain/seller/seller.types.ts`: adicionado `walletId: string | null` em `SellerCompany`.
- `src/domain/seller/seller-profile.mapper.ts`: mapeamento `walletId: dto.walletId` em `mapSellerDtoToCompany`.
- `src/domain/seller/seller-registration.routing.ts`: `getPostLoginSellerDestination(status, walletId)` redireciona seller `active` sem carteira para `ROUTES.seller.walletSetup`.
- `src/contexts/SellerContext.tsx`: `refreshSeller()` retorna `{ status, walletId }` para callers obterem `walletId` fresco após refresh.
- `src/components/auth/MockLoginForm.tsx`: passa `walletId` ao helper de destino pós-login (sem lógica de gating adicional — FR-4).
- `src/data/users.mock.ts`: adicionado `walletId` nos mocks para satisfazer o tipo estendido.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] `requiresWalletSetup()` returns true only for `active` + `walletId === null` — implementado conforme techspec §3.
- [x] `SELLER_WALLET_GATED_ROUTES` covers dashboard, validation, and receivables paths — inclui `/seller`, `/seller/validation`, `/seller/receivables`, `/seller/receivables/new`.
- [x] `buildRegisterPayload()` converts `publicKey` Uint8Array to hex and sets `network: "testnet"` — via `smartAccountEnv.network` (default `"testnet"`).
- [x] `SellerCompany.walletId` is mapped from DTO — `mapSellerDtoToCompany` lê `dto.walletId`.
- [x] `getPostLoginSellerDestination` accepts and uses `walletId` — assinatura atualizada; `active` + null → wallet setup.
- [x] No existing flows broken (auth, profile selection, navigation) — typecheck limpo; mock sellers receberam `walletId`; login HTTP passa `walletId` do refresh.

## Notes

- **Dependência task 1.0:** arquivos de task 1 (`ROUTES.seller.walletSetup`, `smart-account.config.ts`) já existiam no repo; task 1 ainda não está marcada `[x]` em `tasks.md`.
- **`RegisterSellerWalletPayload` vs `wallet.dto.ts`:** tipo definido em `domain/wallet/wallet-payload.ts` para respeitar a regra de domínio sem imports de `services/`. Task 3 pode espelhar o shape em `wallet.dto.ts`.
- **`refreshSeller` return type:** estendido minimamente para expor `walletId` ao login sem duplicar fetch — alinha com task 7.2; gating em `SellerContext`/route guard permanece para task 5.
