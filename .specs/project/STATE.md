# Dupply — State

Memória persistente entre sessões. Atualizar ao fechar decisões, blockers ou pausar trabalho.

**Última atualização:** 2026-05-26

---

## Decisões fechadas

| Data | Decisão | Contexto |
|------|---------|----------|
| 2026-05-20 | Demo sexta inclui **P0 + P1 + P2** | Auth, duplicata E2E, cadastro, revisão analista, passkey/wallet |
| 2026-05-20 | Wallet **front-heavy (A)** | `smart-account-kit` no browser; backend persiste `contractId` |
| 2026-05-20 | Negócio via **REST**; chain via backend | Front não chama RPC para regras de duplicata |
| 2026-05-20 | Persona `investor` fora | Remover scaffold quando conveniente |
| 2026-05-20 | Skill TLC em `.cursor/skills/` apenas | Evitar cópias manuais windsurf/claude |
| 2026-05-20 | Docs de produto em `.specs/project/` | Pitch deck em `.specs/project/pitch-deck.pdf`, não em `public/` |
| 2026-05-21 | API **mock-first** até backend pronto | `VITE_USE_MOCKS=true` default; Bearer assumido |
| 2026-05-21 | Auth alvo: **Bearer access + cookie refresh** | Backend entrega `dupply_rt` HttpOnly; front usa `credentials: "include"` em `/v1/auth/*` |
| 2026-05-26 | Refresh token **fora do JSON** | Cookie `dupply_rt`, `Path=/v1/auth`; logout sem Bearer |
| 2026-05-21 | Limpeza agent skills | Removidos `.windsurf/`, `.claude/`; só `.cursor/skills/` |

---

## Blockers

| ID | Blocker | Owner | Status |
|----|---------|-------|--------|
| B1 | Hidratação via `GET /v1/accounts/me` (adapter T9) | Frontend | 🟡 opcional — endpoint existe; snapshot + JWT decode suficiente por ora |
| B2 | Rota `POST /users/me/wallet` (ou equivalente) | Backend | 🔴 pendente — P2 |
| B3 | Env vars smart-account (wasm hash, verifier, relayer) | Infra | 🟡 definir com back |

---

## Preferências

- **Idioma agente:** português
- **Velocidade > perfeição** até demo sexta
- **Maintainer:** solo dev frontend + agentes IA
- **Gate mínimo:** `npm run typecheck`

---

## Todos ativos (macro)

- [x] Onda 0 scaffold: `api-client` + env + token-storage + `.env.example`
- [x] T2: switch mock→HTTP documentado + `resolveApiMode()` em `env.ts`
- [ ] T3–T5: adapters nos services (⏸ até endpoints back)
- [x] P0 auth: login REST/mock + persistência + guards + seleção de perfil (`auth-login-persistence` T1–T8)
- [ ] P0 auth cookie: refresh silencioso + logout HTTP (`auth-login-persistence` **T11**)
- [ ] P0: duplicata HTTP
- [ ] P1: cadastro cedente + revisão analista HTTP
- [ ] P2: WalletContext + smart-account-kit + link backend
- [x] Spec `.specs/features/api-integration/` (spec + design + tasks)
- [ ] Spec `wallet-passkey/`

---

## Deferred (pós-demo)

- IA de risco real
- Migrar admin receivables → duplicatas
- Vitest + CI
- E2E Playwright
- Pitch deck: extrair métricas para PROJECT.md quando PDF disponível

---

## Lições / notas

- Protótipo hackathon tem divergências rules/código documentadas em CONCERNS.md — não corrigir tudo antes da demo; priorizar integração API.
- `NewDuplicataForm` com validate inline — migrar na Onda 3, não bloquear P0.

---

## Handoff (última sessão)

**Em andamento:** backend auth com cookie `dupply_rt` implementado; docs alinhadas  
**Próximo passo:** implementar **T11** no frontend (`credentials: "include"`, refresh, logout HTTP)  
**Demo HTTP:** `.env.local` → `VITE_USE_MOCKS=false` + `VITE_API_BASE_URL=http://localhost:8080` → seeds `seller@dupply.dev.local`, `risk@dupply.dev.local`; CORS origin deve estar em `CORS_ALLOWED_ORIGINS` no backend  
**Novo chat:** `@.specs/project/STATE.md` + `@.specs/features/auth-login-persistence/tasks.md` (T11)
