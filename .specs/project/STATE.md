# Dupply — State

Memória persistente entre sessões. Atualizar ao fechar decisões, blockers ou pausar trabalho.

**Última atualização:** 2026-05-21

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
| 2026-05-21 | Auth alvo: **Bearer token** | Confirmar com back quando contrato fechar |
| 2026-05-21 | Limpeza agent skills | Removidos `.windsurf/`, `.claude/`; só `.cursor/skills/` |

---

## Blockers

| ID | Blocker | Owner | Status |
|----|---------|-------|--------|
| B1 | Contrato REST exato (endpoints, DTOs) | Backend | 🔴 pendente — auth assumido Bearer |
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
- [ ] P0: auth REST + perfil + duplicata HTTP
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

**Em andamento:** api-integration T2 done — mocks intactos; switch documentado em `design.md` § Switch mock → HTTP  
**Próximo passo:** spec `wallet-passkey/` **ou** T3 auth quando back confirmar paths (B1)  
**Switch API:** `.env.local` → `VITE_USE_MOCKS=false` + `VITE_API_BASE_URL=...` → reiniciar dev  
**Novo chat:** `@.specs/project/STATE.md` + `@.specs/WORKFLOW.md` (+ feature tasks se implementando)
