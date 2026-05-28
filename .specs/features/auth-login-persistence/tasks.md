# Auth Login & Persistência — Tasks

**Spec:** [spec.md](./spec.md)  
**Design:** [design.md](./design.md)  
**Gate:** `npm run typecheck` (testes automatizados fora de escopo — gate manual no design)

**Pré-requisito:** infra HTTP de [api-integration](../api-integration/) (`env.ts`, `token-storage.ts`, `api-client.ts`) — T1/T2 concluídos.

---

## Status legend

🔴 todo · 🟡 in progress · 🟢 done · ⏸ blocked (backend)

---

## T1 — Domain layer (`src/domain/auth/`) 🟢

**Req:** ALP-04, ALP-07, ALP-13, ALP-14, ALP-19 (tipos)  
**Fase design:** F1  
**Depends on:** api-integration T1  
**Where:** `auth-session.types.ts`, `auth-login.schema.ts`, `auth-role.mapper.ts`, `auth-jwt.ts`, `auth-profiles.ts`, `auth.types.ts`

**What:**

- Criar `AuthSession`, `PersistedAuthSnapshot`, `SessionUser`
- Schema Zod login (e-mail + senha, mensagens PT)
- `mapPlatformRoleToProfiles`, `assertLoginAllowed` (incl. `payer` → erro PT)
- `decodeJwtPayload`, `isTokenExpired`, `buildSessionFromLogin`
- `getAvailableProfiles`, `shouldAutoSelectProfile`
- Estender `AuthState` com `isLoading`; deprecar `MockUser.profile` (alias se necessário)

**Done when:**

- [ ] Arquivos criados sem importar React, `api-client` ou `token-storage`
- [ ] `npm run typecheck` passa
- [ ] Nenhum caller migrado ainda (só domínio)

**Gate:** `npm run typecheck`

---

## T2 — Token snapshot em `token-storage` 🟢

**Req:** ALP-05, ALP-08  
**Fase design:** F2 (infra)  
**Depends on:** T1  
**Where:** `src/lib/token-storage.ts`

**What:**

- Chave `dupply_auth_snapshot` + `getAuthSnapshot` / `setAuthSnapshot` / `clearAuthSnapshot`
- `clearAuthStorage()` (token + snapshot) para logout, 401 e token expirado
- Parse corrompido → `null` (falha silenciosa)

**Done when:**

- [ ] Funções tipadas com `PersistedAuthSnapshot`
- [ ] Chave `dupply_access_token` inalterada
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck`

---

## T3 — `auth.service.ts` — login, restore, logout 🟢

**Req:** ALP-01, ALP-02, ALP-03, ALP-05, ALP-06, ALP-07, ALP-08, ALP-19  
**Fase design:** F2  
**Depends on:** T1, T2  
**Where:** `src/services/auth.service.ts`

**What:**

- API: `login`, `logout`, `restoreSession`, `persistSelectedProfile`
- `LoginResult` com códigos PT (`invalid_credentials`, `account_inactive`, `payer_unavailable`, etc.)
- Branch mock: preservar `sleep(800)`, qualquer senha com e-mail, `platformRole: "seller"`
- Branch HTTP: `POST /v1/auth/login` via `apiRequest(..., { auth: false, credentials: "include" })`
- Sucesso HTTP: `setAccessToken` + `setAuthSnapshot` (email do form + `sub` do JWT); cookie `dupply_rt` gerenciado pelo browser
- Falha login: **não** gravar storage (ALP-04)
- `restoreSession`: decode exp; se expirado tentar refresh (T11); limpar se refresh falhar; mock lê só snapshot
- Restore idempotente (flag ou promise memoizada — StrictMode)
- `logout`: ver T11 para HTTP server-side + `clearAuthStorage`

**Done when:**

- [ ] Mock e HTTP compilam e retornam `AuthSession` normalizado
- [ ] Restore retorna `null` para guest sem throw
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck` + teste manual: login mock via service (console ou script temporário)

---

## T4 — `AuthContext` bootstrap e API pública 🟢

**Req:** ALP-05, ALP-06, ALP-07, ALP-16  
**Fase design:** F3  
**Depends on:** T3  
**Where:** `src/contexts/AuthContext.tsx`

**What:**

- `isLoading: true` no mount → `restoreSession()` → `isLoading: false`
- `loginWithSession(session, selectedProfile?)` aplica estado autenticado
- `logout({ reason?: "manual" | "expired" })` delega ao service + reset guest
- `setProfile(profile)` atualiza estado + `persistSelectedProfile`
- Remover/substituir `login(email, ...)` — callers migrados em T5/T6
- Cancelamento no `useEffect` de restore (evitar setState após unmount)

**Done when:**

- [ ] F5 após login mantém sessão (teste manual após T5)
- [ ] Guest silencioso quando storage vazio/corrompido
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck` + login mock → F5 → ainda autenticado

---

## T5 — UI login (`MockLoginForm` + erros PT) 🟢

**Req:** ALP-01, ALP-02, ALP-03, ALP-04, ALP-14 (auto-skip no fluxo)  
**Fase design:** F4  
**Depends on:** T1, T4  
**Where:** `src/components/auth/MockLoginForm.tsx`

**What:**

- Validar com `auth-login.schema` antes do service
- `auth.service.login()` → `loginWithSession` em sucesso
- `toast.error` em falha; **não** mutar context em erro
- Redirect: `redirectHint` + `shouldAutoSelectProfile` → `setProfile` + `getProfileRedirect`
- Deep link: honrar `location.state.from` após perfil selecionado
- Remover imports diretos de `mockLogin` / montagem manual de user na UI

**Done when:**

- [ ] Login mock idêntico à demo atual (`VITE_USE_MOCKS=true`)
- [ ] Login HTTP com seed `seller@dupply.dev.local` funciona (mocks off + API URL)
- [ ] Erros 401/403/rede exibem toast PT
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck` + teste manual mock + HTTP (se backend local up)

---

## T6 — Guards + `ROUTES` no router 🟢

**Req:** ALP-09, ALP-10, ALP-11, ALP-12  
**Fase design:** F5  
**Depends on:** T4  
**Where:** `src/routes/guards.tsx`, `src/components/auth/AuthBootstrapFallback.tsx`, `src/App.tsx`, `src/pages/LoginPage.tsx`

**What:**

- `ProtectedRoute`: `isLoading` → fallback; guest → `ROUTES.login` + `state.from`; sem perfil / perfil errado → `ROUTES.selectProfile`
- `GuestRoute`: autenticado → dashboard ou `selectProfile`
- `LoginPage`: remover guard inline; usar `GuestRoute` no `App.tsx`
- Substituir **todas** strings literais de path por `ROUTES.*`
- Remover `ProtectedRoute` inline local do `App.tsx`

**Done when:**

- [ ] `/seller/duplicatas` deslogado → login → retorno à rota original (com perfil OK)
- [ ] Autenticado em `/login` redireciona corretamente
- [ ] Sem flash redirect incorreto durante restore (`isLoading`)
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck` + teste manual deep link + reload com sessão

---

## T7 — Seleção de perfil (P2) 🟢

**Req:** ALP-13, ALP-14, ALP-15  
**Fase design:** F6  
**Depends on:** T4, T5  
**Where:** `src/pages/SelectProfilePage.tsx`, `src/components/auth/ProfileSelectionCard.tsx`

**What:**

- Guard semi-protegido: guest → login; `isLoading` → fallback
- Modo HTTP: cards só de `getAvailableProfiles(platformRole)`
- Modo mock: três cards (comportamento atual)
- Auto-skip quando um único perfil permitido (login + página)
- `ProfileSelectionCard`: prop `profiles: UserProfile[]`; `onSelect` → `setProfile`

**Done when:**

- [ ] `risk@dupply.dev.local` → só card analista
- [ ] Mock → três cards
- [ ] Perfil selecionado persiste após F5
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck` + testes manuais risk + mock

---

## T8 — 401 global + logout UX (P2) 🟢

**Req:** ALP-16, ALP-17, ALP-18  
**Fase design:** F7  
**Depends on:** T4, T2  
**Where:** `src/lib/api-client.ts`, `src/main.tsx` (opcional `AuthSessionSync`), `AuthContext.tsx`

**What:**

- `setUnauthorizedHandler` em `api-client`: 401 → `clearAuthStorage` + callback
- Registrar handler no boot (`AuthProvider` ou `AuthSessionSync` sob `BrowserRouter`)
- Handler chama `logout({ reason: "expired" })` + toast opcional "Sessão expirada"
- Redirect login via guard na próxima render **ou** `navigate(ROUTES.login)` se usar `AuthSessionSync`
- Logout manual: `POST /v1/auth/logout` com `credentials: "include"` (T11)

**Done when:**

- [ ] Token inválido no storage + request autenticada → tenta refresh → guest + login se falhar
- [ ] Logout limpa token e snapshot; F5 permanece guest
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck` + teste manual 401 + logout

---

## T11 — Cookie refresh + logout HTTP 🔴

**Req:** ALP-21, ALP-22  
**Fase design:** F9  
**Depends on:** T2, T3, T8  
**Where:** `src/lib/api-client.ts`, `src/services/auth.service.ts`

**What:**

- `apiRequest`: opção `credentials?: RequestCredentials`; passar ao `fetch`
- Auth endpoints sempre com `credentials: "include"` (`/v1/auth/login`, `/v1/auth/refresh`, `/v1/auth/logout`)
- `refreshAccessToken()`: `POST /v1/auth/refresh` sem body; atualiza `setAccessToken`; retorna `AuthSession | null`
- `restoreSession` (HTTP): se access expirado → tentar refresh antes de `clearAuthStorage`
- `logout` (HTTP): `POST /v1/auth/logout` best-effort + `clearAuthStorage`
- **Nunca** ler/gravar refresh token em `token-storage` — cookie `dupply_rt` é HttpOnly

**Done when:**

- [ ] Login HTTP recebe e mantém sessão após F5 mesmo com access token expirado (refresh silencioso)
- [ ] Logout invalida sessão server-side (cookie limpo)
- [ ] `npm run typecheck` passa

**Gate:** `npm run typecheck` + teste manual: login → esperar exp / forçar exp → F5 ainda autenticado; logout → cookie ausente

---

## T9 — Adapter `GET /v1/accounts/me` (P3) 🔴

**Req:** ALP-20  
**Fase design:** F8  
**Depends on:** T3  
**Where:** `src/services/auth.service.ts`

**What:**

- `hydrateUserFromApi()` interno: preferir endpoint quando existir
- Manter fallback JWT decode + snapshot (ALP-19)
- Assinatura pública do `AuthContext` inalterada

**Done when:**

- [ ] Com endpoint disponível, nome/e-mail vêm da API após restore
- [ ] Sem endpoint, comportamento atual preservado

**Blocked by:** — endpoint disponível; implementação opcional pós-T11

---

## T10 — Traceability + checklist demo 🟢

**Req:** todos ALP-01 … ALP-20  
**Depends on:** T5, T6, T7, T8 (T9 quando desbloqueado)  
**Where:** `spec.md`, `design.md`, `STATE.md` (handoff)

**What:**

- Atualizar tabela **Requirement Traceability** em `spec.md` (status por ALP-*)
- Executar **Test plan manual** do `design.md`
- Registrar em STATE o que falta para demo HTTP completa

**Done when:**

- [ ] Checklist manual do design executado (mock + HTTP onde aplicável)
- [ ] Success criteria do spec marcados ou justificados
- [ ] Nenhum `fetch` / `apiRequest` / `sessionStorage` direto em pages/components auth

**Gate:** checklist manual + `npm run typecheck`

---

## Execution order

```
api-integration T1/T2 (pronto)
        ↓
       T1 → T2 → T3 → T4
              ↓    ↓
             T5   T6 (T5 e T6 após T4; T6 pode paralelizar com T5 se T4 estável)
              ↓
             T7 → T8
              ↓
        T10 (gate demo)
        T9 ⏸ quando GET /users/me existir
```

**Próximo imediato:** **T11** (cookie refresh + logout HTTP) — desbloqueia persistência real pós-expiração do access token; T9 opcional para hidratação via API.

---

## Parallel

| Par | Tasks | Nota |
|-----|-------|------|
| Após T4 | T5 + T6 | UI login e router/guards em paralelo se duas pessoas |
| Após T8 | T11 | cookie auth — depende de api-client + auth.service |

Nenhuma task `[P]` antes de T1 concluída.

---

## Requirement traceability (tasks → ALP)

| Task | ALP IDs |
|------|---------|
| T1 | ALP-04, ALP-07, ALP-13, ALP-14, ALP-19 |
| T2 | ALP-05, ALP-08 |
| T3 | ALP-01–03, ALP-05–08, ALP-19 |
| T4 | ALP-05–08, ALP-16 |
| T5 | ALP-01–04, ALP-14 |
| T6 | ALP-09–12 |
| T7 | ALP-13–15 |
| T8 | ALP-16–18 |
| T9 | ALP-20 |
| T10 | ALP-01–22 (verificação) |
| T11 | ALP-21, ALP-22 |

**Coverage:** 22 requisitos → 11 tasks

---

## Test plan manual (referência rápida)

Executar na íntegra ao fechar **T10** — detalhes em [design.md](./design.md#test-plan-manual-pré-automação).

| Cenário | Task gate |
|---------|-----------|
| Mock default, três cards | T5, T7 |
| HTTP seller / risk / payer | T5, T7 |
| Login → F5 → sessão + perfil | T4, T7 |
| Logout → F5 → guest | T8 |
| Token expirado → refresh → sessão | T11 |
| Logout HTTP + cookie limpo | T11 |
| Deep link protegido | T6 |
| 401 → login | T8 |
| Sem flash redirect no boot | T4, T6 |
