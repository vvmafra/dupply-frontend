# Dupply — Project

**Última atualização:** 2026-05-20  
**Maintainer:** solo (frontend)  
**Repo:** `dupply-frontend` (SPA React) + backend REST em evolução paralela

---

## Visão

Plataforma B2B para **antecipação de duplicatas** com **análise de risco** e **maior transparência**, reduzindo intermediários no fluxo de crédito sobre recebíveis.

A operação on-chain (Stellar/Soroban) fica **atrás da API REST** — o frontend não fala direto com a blockchain para regras de negócio. A exceção é a camada de **identidade/wallet**: o usuário interage via **passkey (WebAuthn)** para vincular **smart accounts**, seguindo o padrão do [smart-account-kit](https://github.com/kalepail/smart-account-kit).

---

## Problema

Empresas cedentes precisam antecipar duplicatas com processos opacos, muitos intermediários e pouca visibilidade sobre análise de risco e condições. Dupply centraliza o fluxo operacional (cadastro → duplicata → análise → operação) com trilha auditável e, no futuro, scoring assistido por IA.

---

## Fase atual

| Aspecto | Estado |
|---------|--------|
| **Produto** | Protótipo funcional (hackathon) evoluindo para **MVP integrado** em **poucas semanas** |
| **Frontend** | Mock local — serviços em memória, auth client-side |
| **Backend** | REST em evolução — integrações prioritárias |
| **Prazo imediato** | Demo com integrações mínimas até **sexta-feira** (potenciais clientes) |
| **Prazo curto** | Boa parte das integrações até **final de semana** |

---

## Personas e jornadas

| Persona | Código | Jornada principal |
|---------|--------|-------------------|
| **Cedente** | `seller` | Login → cadastro/onboarding → registrar duplicata → acompanhar análise → operação de antecipação |
| **Analista de risco** | `riskAnalyst` | Revisar cadastro de cedentes (score mock/IA futura) → aprovar/reprovar/pendente duplicatas |
| **Admin** | `admin` | Visão operacional, cedentes, transações — leitura e dashboards |

**Fora de escopo:** persona `investor` — removida do produto; pastas scaffold devem ser limpas.

---

## Objetivos (curto prazo)

### Até sexta (demo comercial)

Escopo fechado: **P0 + P1 + P2** (detalhe em [ROADMAP.md](./ROADMAP.md))

- [ ] **P0** — Auth REST + perfil + duplicata end-to-end (seller → analyst)
- [ ] **P1** — Cadastro cedente + revisão cadastral analista
- [ ] **P2** — Passkey + smart account (front `smart-account-kit`, back persiste vínculo)
- [ ] Estrutura `api-client` + adapters pronta para rotas REST

### Próximas semanas

- [ ] **Estabilizar protótipo** — alinhar código às `.cursor/rules/` (rotas, schemas Zod, exports)
- [ ] **Integrar API REST** — camada `services/` com client HTTP tipado
- [ ] **Passkey + smart account** — front-heavy: SDK no browser; backend associa `contractId` ao user
- [ ] **Polish demo** — fluxos redondos para apresentação
- [ ] Testes domain + CI básico (typecheck/build)

### Futuro (não bloqueia MVP)

- Análise de risco com **IA real** (hoje mockada como IA no `seller-review.service`)
- Tokenização completa exposta na UI
- Deploy produção com auth server-side

---

## Fora de escopo (explícito)

| Item | Motivo |
|------|--------|
| Persona `investor` | Descontinuada |
| IA de risco em produção | Feature futura; manter mock até API pronta |
| Frontend chamando Soroban/RPC direto para negócio | Blockchain via backend REST |
| ESLint/Prettier | Não configurado; adotar só se necessário |
| E2E completo antes da demo | Prioridade é integração mínima |

---

## Arquitetura de integração (diretriz)

```
┌─────────────────────────────────────────────────────────────┐
│                     dupply-frontend                          │
├─────────────────────────────────────────────────────────────┤
│  UI (pages/components)                                       │
│       ↓                                                      │
│  services/  ←── REST API (auth, duplicatas, sellers, etc.)  │
│       ↓                                                      │
│  domain/  (schemas Zod, helpers, tipos — sem React)         │
├─────────────────────────────────────────────────────────────┤
│  WalletContext / smart-account-kit  ←── passkey WebAuthn    │
│  (somente identidade/on-chain user-facing)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Backend REST (+ blockchain)
```

**Referência wallet:** [kalepail/smart-account-kit](https://github.com/kalepail/smart-account-kit) — SDK TypeScript para smart accounts OpenZeppelin em Stellar/Soroban com passkey, session persistence, relayer para fee sponsoring.

**Princípios:**

- UI em **português**; paths e chaves técnicas em **inglês**
- Regras de negócio em `domain/`, não inline na UI
- Rotas centralizadas em `src/lib/routes.ts`
- Serviços: padrão `fetch*` / `create*` / `update*` — migrar de mock para HTTP mantendo assinaturas quando possível

**Docs técnicos brownfield:** `.specs/codebase/` (STACK, ARCHITECTURE, CONCERNS, CONVENTIONS, TESTING)

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| UI | React 19, Vite 7, TypeScript 5.9, Tailwind 4, shadcn/ui |
| Routing | React Router 7 |
| Forms | react-hook-form + Zod 4 |
| Estado | React Context + estado local |
| API (alvo) | REST — client HTTP a definir (fetch nativo ou wrapper leve) |
| Wallet (alvo) | `smart-account-kit` + WebAuthn passkey |
| Chain (via backend) | Stellar/Soroban |

---

## Restrições e premissas

- **Time:** 1 dev no frontend por enquanto; agentes de IA no fluxo diário
- **Velocidade > perfeição** até a demo de sexta; depois consolidar dívida
- Backend REST é fonte de verdade para dados de negócio
- Auth mock será substituída — não investir em persistência mock além do necessário para demo
- Protótipo aceita credenciais demo em DEV (`import.meta.env.DEV`)

---

## Glossário

| Termo | Significado |
|-------|-------------|
| **Duplicata** | Título de crédito (modelo principal PT) — fluxo seller/analyst |
| **Receivable** | Modelo legado EN no admin — **deprecar** ou migrar para duplicatas |
| **Cedente** | Empresa vendedora (`seller`) |
| **Smart account** | Contrato Soroban gerenciado via passkey — identidade on-chain do usuário |
| **Passkey** | WebAuthn — autenticação biométrica/dispositivo para wallet |
| **Antecipação** | Operação financeira sobre duplicata aprovada |

---

## Decisões fechadas

### Demo sexta — P0 + P1 + P2

| Prioridade | Escopo |
|------------|--------|
| **P0** | Auth REST + seleção perfil + duplicata E2E |
| **P1** | Cadastro cedente + revisão analista |
| **P2** | Passkey / smart account link |

Ver breakdown em [ROADMAP.md](./ROADMAP.md).

### Wallet — front-heavy (decisão A)

| Responsabilidade | Onde |
|------------------|------|
| WebAuthn / passkey UI | Frontend (`smart-account-kit`) |
| Criar/conectar wallet | Frontend SDK |
| Persistir `contractId` | Backend (`POST /users/me/wallet` ou equivalente) |
| Transações on-chain | Backend orquestra via API |
| Relayer / fee sponsor | Env no front (`VITE_RELAYER_URL`) ou back expõe URL |

Estrutura alvo documentada no ROADMAP (Onda 1 / P2).

## Pendências

| Item | Status |
|------|--------|
| Contrato REST exato (endpoints, DTOs) | 🔴 aguardando backend — ver [STATE.md](./STATE.md) |
| Pitch deck v1 | 🟡 opcional em `.specs/project/pitch-deck.pdf` (não usar `public/`) |

---

## Referências externas

- [smart-account-kit](https://github.com/kalepail/smart-account-kit) — abstração de wallets (core do projeto)
- [OpenZeppelin stellar-contracts](https://github.com/OpenZeppelin/stellar-contracts) — contratos subjacentes
- Pitch Deck Dupply v1 — `.specs/project/pitch-deck.pdf` *(opcional, contexto agente)*

---

## Links internos

| Doc | Propósito |
|-----|-----------|
| [ROADMAP.md](./ROADMAP.md) | Milestones e ondas de trabalho |
| [STATE.md](./STATE.md) | Decisões, blockers, preferências |
| [WORKFLOW.md](../WORKFLOW.md) | Fluxo PRD → spec → design → tasks → execute |
| [CONCERNS.md](../codebase/CONCERNS.md) | Dívida técnica e divergências rules/código |
