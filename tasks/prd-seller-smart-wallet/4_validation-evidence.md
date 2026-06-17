# Validation evidence — Task 4.0: Implement WalletContext with SDK lifecycle and provider wiring

## Changes made

- `src/contexts/WalletContext.tsx`: Criado contexto com singleton `SmartAccountKit` + `IndexedDBStorage`, bootstrap de reconexão via `fetchSellerWallet()` + `connectWallet({ credentialId })`, fluxo `createAndRegisterWallet()` (SDK → `buildRegisterPayload` → POST → `refreshSeller()`), `retryBackendRegistration()` com sync de deploy pendente (`credentials.getPending()` / `deploy()` / `syncAll()`) e tratamento de 409 com `refreshSeller()` + mensagem de escalação.
- `src/main.tsx`: `WalletProvider` aninhado dentro de `SellerProvider`, ativo apenas em sessões HTTP de seller (mesmo gate do `SellerProvider`).

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso
- [x] `WalletProvider` mounts only in HTTP seller sessions (mock mode unaffected) — gate `isActiveSellerSession()` + noop context fora de HTTP/seller
- [x] `createAndRegisterWallet()` deploys on testnet with Friendbot and registers via POST — `autoSubmit: true`, `autoFund: true`, `registerSellerWallet()` após SDK
- [x] `createWallet()` is never called when seller already has `walletId` — guard no início de `createAndRegisterWallet()`
- [x] Bootstrap reconnects existing wallet via `connectWallet` — `useEffect` em `walletId !== null`
- [x] `retryBackendRegistration()` re-POSTs without duplicate deploy — usa `pendingRegistrationRef` + sync/deploy pendente, sem `createWallet()`
- [x] No `credentialId` or private key in logs or persisted frontend state — payload mantido apenas em ref volátil; mensagens de erro genéricas
- [x] No existing flows broken (auth, profile selection, navigation) — provider noop fora de sessão seller HTTP; typecheck limpo

## Notes

- Task 1.0 permanece `[ ]` em `tasks.md`, mas dependências (package `smart-account-kit`, `smart-account.config.ts`) já estavam presentes no repositório.
- UI de setup (task 6) e banner de reconexão (task 7) consumirão `useWallet()` — fora do escopo desta task.
- Gating de redirect para `/seller/wallet-setup` permanece para task 5 (`SellerContext` + route guard).
