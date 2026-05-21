# API Integration — Specification

**Feature slug:** `api-integration`  
**Status:** Draft — aguardando contrato REST do backend  
**Prioridade demo:** P0 → P1 (P2 wallet em feature separada)

---

## Problem Statement

O frontend funciona 100% com mocks in-memory. Para a demo de sexta e evolução do MVP, precisamos de uma **camada HTTP plugável** que troque mocks por REST **sem refatorar páginas** — hoje bloqueado porque a API ainda não está pronta.

---

## Goals

- [ ] Infra HTTP pronta (`api-client`, env, token Bearer) com **mocks como default**
- [ ] Cada service migrável individualmente quando endpoint existir
- [ ] Demo P0+P1 funcionando com mocks até API chegar; switch por env
- [ ] Quando API pronta: trocar `VITE_USE_MOCKS=false` + `VITE_API_BASE_URL` sem mudar UI

---

## Out of Scope

| Item | Motivo |
|------|--------|
| Wallet/passkey HTTP | Feature `wallet-passkey` |
| Admin receivables | Pós-demo |
| GraphQL / WebSockets | REST only |
| Retry/circuit breaker avançado | Pós-MVP |
| OpenAPI codegen | Manual DTOs até contrato estabilizar |

---

## Premissas (até backend confirmar)

| Aspecto | Assunção | Status |
|---------|----------|--------|
| Auth | **Bearer token** no header `Authorization` | 🟡 assumido — confirmar com back |
| Base URL | `VITE_API_BASE_URL` | 🔴 pendente |
| Modo dev | `VITE_USE_MOCKS=true` (default) | ✅ fechado |
| Formato | JSON REST | 🟡 assumido |

---

## User Stories

### P1: Infra HTTP mock-first ⭐ MVP técnico

**User Story**: Como dev, quero uma camada API configurável para ligar REST quando disponível sem quebrar a demo mockada.

**Why P1**: Desbloqueia integração incremental; não depende da API estar pronta hoje.

**Acceptance Criteria**:

1. WHEN `VITE_USE_MOCKS=true` THEN services SHALL usar implementação mock atual
2. WHEN `VITE_USE_MOCKS=false` AND `VITE_API_BASE_URL` set THEN `api-client` SHALL enviar requests HTTP
3. WHEN login REST retornar token THEN system SHALL persistir token e incluir `Authorization: Bearer <token>` nas requests
4. WHEN API retornar 401 THEN system SHALL limpar sessão e redirecionar para login

**Independent Test**: Com mocks, app idêntico ao hoje; com env apontando para API stub, requests saem com Bearer.

**Req IDs:** `API-01`, `API-02`, `API-03`, `API-04`

---

### P2: Auth REST (P0 demo) ⭐

**User Story**: Como usuário, quero login real via API para sessão persistente entre reloads.

**Why P2**: P0 da demo comercial.

**Acceptance Criteria**:

1. WHEN usuário submete login válido THEN system SHALL chamar `POST /auth/login` (path TBD) e receber token + user
2. WHEN login sucesso THEN system SHALL persistir token e popular `AuthContext`
3. WHEN usuário seleciona perfil THEN system SHALL chamar endpoint de perfil (TBD) ou manter local até rota existir
4. WHEN F5 THEN sessão SHALL ser restaurada do storage se token válido

**Independent Test**: Login → reload → ainda autenticado (com API ou mock enriquecido).

**Req IDs:** `AUTH-01` … `AUTH-04`

---

### P3: Duplicatas REST (P0 demo)

**User Story**: Como cedente/analista, quero CRUD e análise de duplicatas via API.

**Acceptance Criteria**:

1. WHEN seller lista duplicatas THEN `GET /duplicatas?sellerId=` (TBD)
2. WHEN seller cria duplicata THEN `POST /duplicatas`
3. WHEN analyst analisa THEN `PATCH /duplicatas/:id/analise` (TBD)
4. WHEN mock mode THEN comportamento atual preservado

**Req IDs:** `DUP-01` … `DUP-04`

---

### P4: Cadastro + revisão (P1 demo)

**User Story**: Como cedente/analista, quero onboarding e revisão cadastral via API.

**Acceptance Criteria**:

1. WHEN seller completa wizard THEN `POST /sellers/register` (TBD)
2. WHEN analyst revisa cadastro THEN endpoints seller-review (TBD)
3. WHEN mock mode THEN fluxo atual intacto

**Req IDs:** `SEL-01`, `REV-01`

---

## Edge Cases

- WHEN `VITE_API_BASE_URL` ausente e `VITE_USE_MOCKS=false` THEN app SHALL logar warning e fallback mock
- WHEN API timeout/5xx THEN UI SHALL toast erro em PT e manter estado consistente
- WHEN token expirado (401) THEN logout + redirect login
- WHEN contrato DTO divergir THEN adapter no service mapeia; domain types permanecem

---

## Endpoints placeholder (confirmar com backend)

| Domínio | Método | Path (TBD) | Service |
|---------|--------|------------|---------|
| Auth | POST | `/auth/login` | `auth.service.ts` |
| Auth | POST | `/auth/logout` | `auth.service.ts` |
| User | PATCH | `/users/me/profile` | `auth.service.ts` |
| Duplicatas | GET | `/duplicatas` | `duplicata.service.ts` |
| Duplicatas | POST | `/duplicatas` | `duplicata.service.ts` |
| Duplicatas | PATCH | `/duplicatas/:id/analise` | `duplicata.service.ts` |
| Sellers | POST | `/sellers/register` | `seller-registration.service.ts` |
| Review | GET/PATCH | `/sellers/:id/review` | `seller-review.service.ts` |

---

## Traceability

| Req ID | Story | Task | Status |
|--------|-------|------|--------|
| API-01 | P1 | T1 | 🟢 |
| API-02 | P1 | T1 | 🟢 |
| API-03 | P1 | T2 | 🟢 |
| API-04 | P1 | T2 | 🟢 |
| AUTH-01 | P2 | T3 | 🔴 |
| DUP-01 | P3 | T4 | 🔴 |
| SEL-01 | P4 | T5 | 🔴 |

---

## Related

- [design.md](./design.md)
- [tasks.md](./tasks.md)
- [ROADMAP.md](../../project/ROADMAP.md) — Onda 0–2
- [STATE.md](../../project/STATE.md) — blocker B1
