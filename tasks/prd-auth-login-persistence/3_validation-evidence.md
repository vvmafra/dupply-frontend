# Validation evidence — Task 3.0: Complete auth service HTTP session lifecycle

## Changes made

- `src/services/auth.service.ts`:
  - Adicionado `credentials: "include"` em `httpLoginImpl` (POST `/v1/auth/login`) — FR-3, FR-23.
  - Criados helpers `mapTokenResponseToSession` e `buildSessionFromSnapshot` conforme integration-spec.
  - Implementado e exportado `refreshAccessToken()`: mock retorna `null`; HTTP chama POST `/v1/auth/refresh` com `credentials: "include"`, atualiza token e retorna sessão; falha limpa storage silenciosamente — FR-9, FR-10.
  - Atualizado branch HTTP de `restoreSessionImpl()`: tenta reconstruir sessão com token válido; se ausente/expirado, delega a `refreshAccessToken()` antes de retornar guest — FR-7, FR-20.
  - Atualizado `logout()`: em modo HTTP, chama POST `/v1/auth/logout` best-effort com `credentials: "include"`, depois `clearAuthStorage()` — FR-11.
  - `refreshAccessToken` exportado para uso na Task 4 (handler de 401 no api-client).

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] HTTP login sends `credentials: "include"` — adicionado em `httpLoginImpl`.
- [x] Expired access token + valid refresh cookie restores session on F5 — lógica em `restoreSessionImpl` + `refreshAccessToken`; requer teste manual HTTP com backend + CORS.
- [x] Failed refresh on restore clears storage silently (no toast) — `refreshAccessToken` catch chama `clearAuthStorage()` sem toast.
- [x] HTTP logout calls server endpoint then clears local storage — implementado em `logout()`.
- [x] Mock mode login/restore/logout behavior unchanged — branch mock preservado; `refreshAccessToken` retorna `null` em mock.
- [x] No existing flows broken — apenas extensão do branch HTTP; mock e assinaturas públicas inalteradas.

## Notes

- Testes manuais HTTP (login com cookie, F5 após expiração do access token, logout) dependem de backend local com `VITE_USE_MOCKS=false` — não executados nesta task.
- Task 4 registrará `setRefreshAccessTokenHandler` no api-client usando o `refreshAccessToken` exportado aqui.
