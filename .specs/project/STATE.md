# Dupply — State

Memória persistente entre sessões. Atualizar ao fechar decisões, blockers ou pausar trabalho.

**Última atualização:** 2026-07-26

---

## Decisões fechadas

| Data | Decisão | Contexto |
|------|---------|----------|
| 2026-09-30 | Contrato v2 do backend (`feat/demo-local`) | `yieldRateMonthly` (fração, juros simples/30d) e `minInvestment` (reais) no receivable; admin dispara `open-funding` e `advance-stage`; em HTTP a oferta **é** o receivable (`offer.id === receivable.id`) e o aporte é em reais (fecha só no alvo exato) |
| 2026-09-30 | `minAmount` ≠ ticket mínimo | `Offer.minAmount` continua sendo o piso de captação do mock (FIDC); o ticket por aporte é `Offer.minInvestment`. Em HTTP `minAmount = targetAmount` (backend não tem fechamento parcial) |
| 2026-07-26 | Persona **investor** de volta (mock-first) | Marketplace: ofertas de cotas por duplicata; spec `investor-marketplace` |
| 2026-07-26 | Captação híbrida: crowd + **FIDC no gap** | ≥ mínimo e &lt; 100% → desembolso + FIDC completa target; &lt; mínimo → estorno |
| 2026-07-26 | 1 duplicata = 1 Oferta (entidade nova) | Admin cria após aceite do cedente; spread no cadastro da oferta dentro do deságio do analista |
| 2026-05-20 | Demo sexta inclui **P0 + P1 + P2** | Auth, duplicata E2E, cadastro, revisão analista, passkey/wallet |
| 2026-05-20 | Wallet **front-heavy (A)** | `smart-account-kit` no browser; backend persiste `contractId` |
| 2026-05-20 | Negócio via **REST**; chain via backend | Front não chama RPC para regras de duplicata |
| 2026-05-20 | Persona `investor` fora | **Superseded** em 2026-07-26 — investor retorna via `investor-marketplace` |
| 2026-05-20 | Skill TLC em `.cursor/skills/` apenas | Evitar cópias manuais windsurf/claude |
| 2026-05-20 | Docs de produto em `.specs/project/` | Pitch deck em `.specs/project/pitch-deck.pdf`, não em `public/` |
| 2026-05-21 | API **mock-first** até backend pronto | `VITE_USE_MOCKS=true` default; Bearer assumido |
| 2026-05-21 | Auth alvo: **Bearer token** | Confirmar com back quando contrato fechar |
| 2026-05-21 | Limpeza agent skills | Removidos `.windsurf/`, `.claude/`; só `.cursor/skills/` |

---

## Blockers

| ID | Blocker | Owner | Status |
|----|---------|-------|--------|
| B1 | `GET /users/me` inexistente no backend | Backend | 🟢 contornado — `profileId` vem no JWT; seller usa `GET /v1/sellers/:profileId`, investor `GET /v1/investors/me` |
| B2 | Rota `POST /users/me/wallet` (ou equivalente) | Backend | 🔴 pendente — P2 |
| B4 | Admin não lista aportes por receivable | Backend | 🟡 `listInvestmentsByOffer`/`listAllInvestments` retornam `[]` em HTTP; tela mostra captado/alvo |
| B5 | Analista não lê sellers `active` (`GET /v1/sellers/:id` → 403) | Backend | 🟡 nome do cedente cai para o id na fila do analista |
| B6 | JWT expira em 15 min (`JWT_ACCESS_TTL_SECONDS=900`) | Infra | 🟡 subir o TTL no `.env` do backend para a demo; front faz logout no 401 |
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
- [x] P0: duplicata HTTP (submit, risk-decision com termos, seller-decision, listagens)
- [x] P0: captação HTTP (open-funding, invest em reais com ticket mínimo, advance-stage ×3, payout refletido no saldo)
- [~] P1: revisão analista/admin HTTP (`PATCH /v1/sellers/:id/status`); cadastro de cedente (`registerSeller`) segue mock
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

**Feito (2026-09-28):** gaps de demo — loop logout→login entre personas (`resolvePostLoginPath`), mocks persistidos em `localStorage` (`src/lib/mock-store.ts` + reset no login), detalhe do analista recarrega status real (`for_approval`) após decisão. Smoke Playwright 10/10 no build.  
**Feito (2026-09-30, integração):** contrato v2 (`yieldRateMonthly`/`minInvestment`), wizard do analista com taxa e ticket, admin "Abrir captação" e "Avançar etapa", aporte em reais com ticket mínimo, `admin.service` HTTP (sellers, duplicatas por etapa, métricas), `fetchCurrentSeller` via `profileId`. Verificado com backend local (SQLite + `seed:dev`): smoke HTTP 60/60 no roteiro seller→analista→seller→admin→investidor→admin×3→saldo (R$ 18.038,23 → +R$ 10,82 de juros); smoke mock 45/45.  
**Como rodar em HTTP:** backend `JWT_SECRET=... DATABASE_URL=file:./data/dupply.db npm run seed:dev && npm run start:local`; front `.env.local` com `VITE_USE_MOCKS=false` e `VITE_API_BASE_URL=http://localhost:8080`.  
**Feito (2026-09-28, refactor):** `useAsyncData` em todas as páginas; `NewDuplicataForm` em react-hook-form + Zod (`duplicata.schema.ts`) com parser XML e seções extraídas; cards de duplicata compartilhados; skeletons genéricos em `PageSkeleton.tsx`; `npm run typecheck` corrigido (era no-op). Smoke completo 45/45: todas as rotas das 4 personas + fluxo cedente→analista→cedente→admin→investidor.  
**Em andamento:** `investor-marketplace` mock implementado (typecheck+build)  
**Próximo passo:** smoke manual do fluxo admin→investor; botões do analista ainda ativos em qualquer status; painel de IA vazio em mock  
**Docs:** `@.specs/features/investor-marketplace/`  
**Demo:** login mock → perfil Investidor ou `investor@dupply.com.br`; admin → Prontas para oferta
