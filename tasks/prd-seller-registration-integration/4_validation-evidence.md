# Validation evidence — Task 4.0: Implement HTTP-only registration service

## Changes made

- `src/services/auth-session.persistence.ts`: criado módulo compartilhado com `buildAuthSnapshot`, `mapTokenResponseToSession` e `persistAuthSession` para evitar duplicação/circular imports entre login e registro.
- `src/services/auth.service.ts`: refatorado para usar helpers de `auth-session.persistence.ts` (mesmo comportamento de persistência de sessão).
- `src/services/seller.service.ts`: exportado `mapSellerApiError` para reutilização nos erros de rotas seller (FR-21).
- `src/services/seller-registration.service.ts`: substituído mock `registerSeller()` por funções HTTP-only — `registerSellerAccess`, `saveSellerRegistrationStep`, `finishSellerRegistration`, `loadSellerRegistrationState`, `fetchSellerBackendStatus`; mapeamento PT de erros de register; bloqueio `inactive` via `SellerRegistrationBlockedError`; sem gate `resolveApiMode()`.
- `src/components/auth/SellerRegistrationWizard.tsx`: removida dependência de `registerSeller()`; mantido `sleep` temporário no submit final até Task 6 (wiring step-scoped).

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] Mock `registerSeller()` is fully removed — sem `sleep` ou mock gate no service layer.
- [x] All five service functions exist and delegate to Slice A where specified — PATCH/submit via `updateSellerMetadata`/`submitSellerForReview`; GET reutiliza `mapSellerApiError` e DTOs de Slice A.
- [x] Register session persistence matches login pattern — `persistAuthSession` (setAccessToken + setAuthSnapshot) após `POST /v1/auth/register` com `credentials: "include"`.
- [x] No existing flows broken — auth/login refatorado com helpers extraídos; wizard mantém UX mock no submit final (Task 6).

## Notes

- Wizard não foi wired com as novas funções HTTP (escopo explícito da Task 6); apenas ajuste mínimo para compilar após remoção de `registerSeller()`.
- `loadSellerRegistrationState` e `fetchSellerBackendStatus` usam `apiRequest` GET interno com `mapSellerApiError`, pois Slice A não expõe DTO bruto com `status` — alinhado à techspec §5.
- `assertRegistrationApiConfigured()` exige `VITE_API_BASE_URL` (FR-19), independente de `resolveApiMode()`.
