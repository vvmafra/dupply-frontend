# API Integration — Tasks

**Spec:** [spec.md](./spec.md)  
**Design:** [design.md](./design.md)  
**Gate:** `npm run typecheck`

---

## Status legend

🔴 todo · 🟡 in progress · 🟢 done · ⏸ blocked (API)

---

## T1 — Scaffold infra HTTP (sem mudar runtime) 🟢

**Req:** API-01, API-02  
**Depends on:** —  
**Where:** `src/lib/env.ts`, `src/lib/token-storage.ts`, `src/lib/api-client.ts`, `.env.example`

**What:**

- Criar módulos lib conforme design
- `.env.example` com mocks default
- Nenhum service importa api-client ainda

**Done when:**

- [x] Arquivos criados e tipados
- [x] `npm run typecheck` passa
- [x] App comportamento idêntico (mocks intactos)

**Gate:** `npm run typecheck` ✅

---

## T2 — Wire env + documentar switch mock→HTTP 🟢

**Req:** API-02, API-03  
**Depends on:** T1  
**Where:** `README.md` ou `.specs/features/api-integration/` (não expandir README raiz sem pedido — nota em STATE)

**What:**

- Documentar como ligar API: `VITE_USE_MOCKS=false` + URL
- `env.useMocks` helper exportado

**Done when:**

- [x] Instruções claras no design ou STATE
- [x] typecheck ok

**Gate:** `npm run typecheck` ✅

---

## T3 — Auth adapter + token persistence

**Req:** AUTH-01 … AUTH-04, API-03, API-04  
**Depends on:** T1  
**Where:** `auth.service.ts`, `AuthContext.tsx`, `MockLoginForm.tsx`

**What:**

- Extrair `mockLogin` / `selectProfile` mock impl
- Branch `if (env.useMocks)` vs HTTP
- `AuthProvider`: `restoreSession()` on mount lendo token
- 401 handler → logout

**Done when:**

- [ ] Mock path = comportamento atual
- [ ] HTTP path compilando (paths placeholder ok)
- [ ] Token persiste em sessionStorage quando HTTP login

**Gate:** `npm run typecheck` + teste manual login mock

**Blocked by:** B1 — endpoints auth exatos ⏸

---

## T4 — Duplicata service HTTP adapter

**Req:** DUP-01 … DUP-04  
**Depends on:** T1, T3 (auth header)  
**Where:** `duplicata.service.ts`

**What:**

- Extrair mocks para funções internas
- Implementar HTTP branch para fetch/create/analise
- Mapear DTO → `DuplicataTitulo`

**Done when:**

- [ ] Mock path intacto
- [ ] HTTP branch pronta para endpoint real

**Blocked by:** B1 ⏸

---

## T5 — Seller registration + review adapters

**Req:** SEL-01, REV-01  
**Depends on:** T3  
**Where:** `seller-registration.service.ts`, `seller-review.service.ts`

**Done when:**

- [ ] Mock path intacto
- [ ] HTTP stubs compilando

**Blocked by:** B1 ⏸

---

## T6 — Demo switch checklist

**Req:** all P0/P1  
**Depends on:** T3, T4, T5 + backend ready  
**Where:** STATE.md handoff

**What:**

- Checklist manual P0/P1/P2 com API real
- Atualizar traceability spec.md

**Done when:**

- [ ] Demo roda com `VITE_USE_MOCKS=false`
- [ ] Ou documentado o que falta por endpoint

---

## Execution order

```
T1 → T2
T1 → T3 ⏸ (quando back confirmar auth)
T3 → T4 → T5
T6 quando API pronta
```

**Próximo imediato:** T3 ⏸ (B1) ou spec `wallet-passkey/` (paralelo, sem backend)

---

## Parallel

Nenhuma task `[P]` até T1 done.
