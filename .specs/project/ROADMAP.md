# Dupply — Roadmap

**Última atualização:** 2026-05-20  
**Horizonte:** demo sexta → fim de semana → 2–4 semanas

Referência: [PROJECT.md](./PROJECT.md) · [STATE.md](./STATE.md) · [CONCERNS.md](../codebase/CONCERNS.md)

---

## Milestones

| Data | Milestone | Critério de done |
|------|-----------|------------------|
| **Sex 23/05** | Demo comercial | P0 + P1 + P2 integrados à API REST |
| **Dom 25/05** | Integração ampliada | Fluxos restantes conectados; mocks só fallback DEV |
| **Sem 2–4** | MVP estável | Rules alinhadas, testes domain, CI, wallet production-ready |

---

## Demo sexta — escopo fechado

### P0 — obrigatório

| # | Fluxo | Front | Backend | Entregável front |
|---|-------|-------|---------|------------------|
| P0.1 | Auth REST + sessão | `AuthContext`, `MockLoginForm` | `POST /v1/auth/login`, cookie `dupply_rt`, refresh/logout | `auth.service.ts` HTTP + T11 cookie |
| P0.2 | Seleção de perfil | `SelectProfilePage` | `PATCH /users/me/profile` ou equivalente | Perfil sincronizado com backend |
| P0.3 | Duplicata end-to-end | seller cria + analyst analisa | CRUD + análise duplicatas | `duplicata.service.ts` HTTP |

### P1 — demo completa

| # | Fluxo | Front | Backend | Entregável front |
|---|-------|-------|---------|------------------|
| P1.1 | Cadastro cedente | `SellerRegistrationWizard` | onboarding seller | `seller-registration.service.ts` HTTP |
| P1.2 | Revisão cadastral analista | `AnalystSellersPage`, wizards | seller review | `seller-review.service.ts` HTTP |

### P2 — diferencial

| # | Fluxo | Front | Backend | Entregável front |
|---|-------|-------|---------|------------------|
| P2.1 | Passkey + smart account | novo módulo wallet | `POST /users/me/wallet` (persistir `contractId`) | `WalletContext` + `smart-account-kit` |
| P2.2 | UI vincular wallet | step pós-login ou settings | associa wallet ao user | Botão criar/conectar passkey |

**Fora da demo sexta:** admin dashboards integrados, E2E, deprecação receivables, IA real.

---

## Onda 0 — Infra API (pré-requisito da demo)

**Objetivo:** trocar mocks por HTTP sem quebrar UI.

| Task | Onde | Done when |
|------|------|-----------|
| Client HTTP base | `src/lib/api-client.ts` | fetch wrapper: base URL env, auth header, errors tipados |
| Env vars | `.env.example` | `VITE_API_BASE_URL`, flags mock fallback |
| Adapter pattern | `src/services/` | cada service: `useMock()` ou env `VITE_USE_MOCKS` |
| Tipos compartilhados | `domain/` | DTOs alinhados ao contrato REST (ajustar quando back definir) |

**Feature spec:** `.specs/features/api-integration/` *(criar na execução)*

---

## Onda 1 — Demo P0/P1/P2 (até sexta)

### Sequência sugerida

```
Dia 1–2: Onda 0 (api-client + auth P0.1/P0.2)
Dia 2–3: P0.3 duplicatas
Dia 3–4: P1 cadastro + revisão
Dia 4–5: P2 wallet scaffold + integração back quando rota existir
```

### Wallet (P2) — estrutura front-heavy

```
src/
├── contexts/WalletContext.tsx      # estado wallet + kit instance
├── lib/wallet/
│   ├── smart-account.config.ts     # env: RPC, wasm hash, verifier, relayer
│   └── wallet-api.ts               # POST contractId → backend
├── services/wallet.service.ts      # linkWallet(), getWalletStatus()
└── components/wallet/
    ├── WalletConnectButton.tsx
    └── WalletSetupDialog.tsx
```

Front faz WebAuthn via `smart-account-kit`; backend só persiste vínculo user ↔ `contractId`.

---

## Onda 2 — Fim de semana (integração ampliada)

| Item | Prioridade |
|------|------------|
| Admin: sellers read-only via API | Média |
| Operacao antecipação cedente | Alta |
| Remover fallback mock em prod build | Alta |
| Tratamento erro/retry/toast padronizado | Média |

---

## Onda 3 — Estabilização (semana 2)

Alinha [CONCERNS.md](../codebase/CONCERNS.md) — divergências rules/código:

| Item | Esforço |
|------|---------|
| `App.tsx` usar `ROUTES.*` | Baixo |
| `duplicata.schema.ts` + react-hook-form | Médio |
| Export nomeado `App` | Baixo |
| Renomear package `dupply-frontend` | Baixo |
| Remover pastas `investor/` vazias | Baixo |
| Auth guards unificados | Médio |

**Feature spec:** `.specs/features/baseline-conventions/`

---

## Onda 4 — Qualidade (semana 2–3)

| Item | Esforço |
|------|---------|
| Vitest + testes domain helpers | Médio |
| GitHub Actions: typecheck + build + test | Baixo |
| Factory/store nos serviços mock (ou remover mocks) | Médio |
| Deprecar receivables no admin | Médio — decisão produto |

---

## Onda 5 — Pós-MVP

- IA de risco real
- Auth server-side completa
- Deploy produção
- E2E Playwright nos fluxos críticos

---

## Mapa de features → specs

| Feature | Pasta spec | Status |
|---------|------------|--------|
| Integração API + demo | `.specs/features/api-integration/` | 🟡 T1 scaffold done |
| Wallet passkey | `.specs/features/wallet-passkey/` | 🔴 a criar |
| Baseline conventions | `.specs/features/baseline-conventions/` | 🔴 a criar |

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Backend atrasa endpoint | Manter `VITE_USE_MOCKS=true` por fluxo |
| Passkey bloqueia demo | P2 isolado; P0+P1 funcionam sem wallet |
| Contrato REST muda | DTOs em `domain/`; adapter no service |
| Solo dev + prazo | Quick mode para fixes; specs só em Large features |
