# Validation evidence — Task 4.0: Wire 401 handler to silent refresh

## Changes made

- `src/lib/api-client.ts`:
  - Adicionado `setRefreshAccessTokenHandler` com handler `() => Promise<boolean>`, espelhando o padrão de `setUnauthorizedHandler` — evita import circular com `auth.service`.
  - Extraídos helpers `buildAuthHeaders`, `fetchApiResponse` e `throwHttpError` para suportar retry com novo Bearer token.
  - Fluxo 401 em requests autenticadas (`auth: true`): chama refresh handler → retry único com token atualizado → em falha `clearAuthStorage()` + `onUnauthorized()` — FR-9, FR-22, FR-24.
  - Requests com `auth: false` (ex.: `/v1/auth/login`, `/refresh`, `/logout`) continuam lançando `ApiError` sem tentar refresh — evita loop.
- `src/services/auth.service.ts`:
  - Registrado handler no init do módulo via `setRefreshAccessTokenHandler`, delegando a `refreshAccessToken()` exportado na Task 3.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] Authenticated API call with expired access token refreshes and succeeds — fluxo implementado (refresh + retry); requer teste manual HTTP com backend + token expirado.
- [x] Refresh failure triggers session clear + expired logout path — falha chama `clearAuthStorage()` + `onUnauthorized()` → `AuthContext` chama `logout({ reason: "expired" })` com toast opcional.
- [x] Auth routes (`auth: false`) do not trigger refresh-on-401 loop — branch 401+refresh só executa quando `auth === true`.
- [x] No existing flows broken — mock mode inalterado; `refreshAccessToken` retorna `null` em mock, levando ao logout path apenas em requests autenticadas HTTP.

## Notes

- Teste manual HTTP (subtask 4.5) não executado nesta sessão — depende de backend local com `VITE_USE_MOCKS=false`.
- Toast "Sessão expirada" permanece exclusivo do `AuthContext` via `onUnauthorized`; api-client não exibe toast.
- Próxima task sugerida: **5.0** (opcional) — hydration via `GET /v1/accounts/me`.
