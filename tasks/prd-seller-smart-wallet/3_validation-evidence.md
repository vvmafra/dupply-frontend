# Validation evidence — Task 3.0: Add wallet DTOs and HTTP service adapter

## Changes made

- `src/services/wallet.dto.ts`: DTOs de transporte espelhando o módulo backend — `RegisterSellerWalletRequestDTO`, `WalletPublicViewDTO`, `WalletErrorBodyDTO`, e tipos auxiliares `WalletNetworkDTO` / `WalletStatusDTO`.
- `src/services/wallet.service.ts`: adapter HTTP-only com `registerSellerWallet()` (POST `/v1/sellers/:id/wallet`) e `fetchSellerWallet()` (GET mesmo path); seller ID resolvido via JWT (`getSellerProfileIdFromToken`); erros mapeados com `mapWalletApiError()`; modo mock lança `WalletRegistrationError("http_only", ...)`.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] `registerSellerWallet()` POSTs to `/v1/sellers/:id/wallet` with correct payload shape — `apiRequest` com `method: "POST"` e `body: payload` tipado como `RegisterSellerWalletRequestDTO`.
- [x] `fetchSellerWallet()` GETs wallet for authenticated seller — `apiRequest` GET em `/v1/sellers/${sellerId}/wallet`.
- [x] Both functions throw `WalletRegistrationError` in mock mode — guard `resolveApiMode() !== "http"` com código `http_only`.
- [x] API errors map to Portuguese messages per integration-spec table — `catch` delega a `mapWalletApiError()` (task 2).
- [x] No existing flows broken — apenas arquivos novos; nenhuma alteração em auth, seller service ou rotas.

## Notes

- `domain/wallet/wallet-payload.ts` (task 2) mantém `RegisterSellerWalletPayload` sem import de `services/` — estruturalmente compatível com `RegisterSellerWalletRequestDTO`. Task 4+ pode alinhar `buildRegisterPayload` ao DTO de serviço se desejado.
- `WalletErrorBodyDTO` em `wallet.dto.ts` espelha `WalletErrorBody` em `domain/wallet/wallet.errors.ts`; o mapper de domínio continua usando o tipo local (sem acoplamento services → domain invertido).
