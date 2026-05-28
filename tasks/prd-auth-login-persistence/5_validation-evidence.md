# Validation evidence — Task 5.0: Account hydration via GET /v1/accounts/me

## Changes made

- `src/services/auth.service.ts`:
  - Adicionado `mapAccountDtoToSessionUser()` — mapeia `AccountResponseDTO` para `SessionUser` (id, email, name via fallback do local-part, `platformRole` via `dto.role`).
  - Adicionado `hydrateUserFromApi()` — chama `GET /v1/accounts/me` com Bearer (default `auth: true`); retorna `null` em mock mode ou em falha HTTP (fallback JWT + snapshot).
  - `httpLoginImpl`: após `setAccessToken`, hidrata usuário e atualiza `session.user` + snapshot antes do retorno.
  - `restoreSessionImpl` (HTTP): após `assertLoginAllowed`, hidrata usuário e atualiza `session.user` quando o endpoint responde.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] HTTP login shows user email/id from `/v1/accounts/me` when endpoint succeeds — `httpLoginImpl` substitui `session.user` por dados hidratados antes de persistir snapshot e retornar.
- [x] Failed hydration does not break login or restore — `hydrateUserFromApi()` captura erros e retorna `null`; sessão JWT-derived permanece intacta.
- [x] Mock mode unchanged — helper retorna `null` imediatamente quando `resolveApiMode() === "mock"`.
- [x] No existing flows broken — `assertLoginAllowed` permanece antes da hidratação no login; mock login/restore inalterados; perfil e guards não modificados.

## Notes

- Teste manual HTTP com backend real não executado nesta sessão — requer `VITE_USE_MOCKS=false` e endpoint `/v1/accounts/me` disponível.
- Snapshot no restore não é reescrito após hidratação (escopo mínimo da task); dados hidratados valem para a sessão em memória; próximo boot ainda usa snapshot + nova hidratação.
- Próxima task sugerida: **6.0** — migrar paths literais restantes para constantes `ROUTES`.
