# External Integrations

**Status:** Protótipo frontend-only — quase todas as "integrações" são mocks locais

## Resumo

| Tipo | Quantidade real | Observação |
|------|-----------------|------------|
| APIs HTTP | 0 | Sem `fetch`, axios ou `import.meta.env` |
| Autenticação externa | 0 | Login mock client-side |
| Blockchain on-chain | 0 | Ledger simulado; link externo apenas para explorer |
| CDN / fonts | 1 | Google Fonts |
| Persistência local | 1 | Tema em `localStorage` |

## Fonts (CDN)

**Service:** Google Fonts
**Purpose:** Tipografia Inter na landing e páginas públicas
**Implementation:** `<link>` em `index.html`
**Configuration:** Hardcoded URL — sem variável de ambiente
**Authentication:** N/A

## Stellar Testnet Explorer

**Service:** [stellar.expert](https://stellar.expert/explorer/testnet)
**Purpose:** Link "ver na blockchain" para transações mockadas no painel admin
**Implementation:** `src/components/admin/AdminTransactionTable.tsx` — `href` com hash de transação mock
**Configuration:** URL base fixa `https://stellar.expert/explorer/testnet/tx/{hash}`
**Authentication:** N/A (link público)

**Nota:** Transações são geradas em `domain/blockchain/blockchain.mock.ts` e servidas por `blockchain.service.ts` — não há integração real com rede Stellar.

## Mock Service Layer (substituto de API)

**Service:** Serviços internos
**Purpose:** Simular backend de antecipação de recebíveis
**Implementation:** `src/services/*.ts`
**Configuration:** Sem `.env` — dados seed em `src/data/*.mock.ts`
**Authentication:** N/A

### Serviços mockados

| Serviço | Domínio | Funções principais |
|---------|---------|-------------------|
| `auth.service.ts` | Login/perfil | `mockLogin`, `selectProfile` |
| `duplicata.service.ts` | Duplicatas | `fetch*`, `createDuplicata`, `setDuplicataAnaliseAnalista`, oferta/decisão antecipação |
| `seller.service.ts` | Cedente | `fetchCurrentSeller`, validação, liberação duplicatas |
| `seller-registration.service.ts` | Onboarding | Cadastro mock (sempre success) |
| `seller-review.service.ts` | Analista cadastral | Filas revisão, score IA mockado |
| `admin.service.ts` | Admin | Métricas, sellers, recebíveis, validações |
| `receivables.service.ts` | Recebíveis legado | CRUD receivables (EN) |
| `blockchain.service.ts` | Blockchain | Listagem transações mock |

**Padrão comum:**

```typescript
import { sleep } from "@/lib/utils";
await sleep(300); // latência simulada
return data.map((d) => ({ ...d })); // cópia defensiva
```

## API Integrations

### Backend Dupply

**Purpose:** Auth, accounts, sellers, receivables (planejado / parcial)  
**Location:** `src/lib/api-client.ts`, `src/services/auth.service.ts`  
**Authentication:**
- Access: `Authorization: Bearer <accessToken>` (sessionStorage)
- Refresh: cookie `dupply_rt` (HttpOnly, `Path=/v1/auth`) — browser-managed; requires `credentials: "include"` on `/v1/auth/*`

**Key auth endpoints (confirmados):**

| Método | Path | Notas |
|--------|------|-------|
| POST | `/v1/auth/login` | body `{ email, password }` → `{ accessToken, tokenType, expiresInSeconds }` + cookie |
| POST | `/v1/auth/refresh` | sem body; cookie rotacionado |
| POST | `/v1/auth/logout` | sem Bearer; invalida cookie |
| GET | `/v1/accounts/me` | Bearer; perfil da conta |

**Frontend pendente (T11):** `credentials: "include"` no `api-client`, silent refresh, logout HTTP.

## Webhooks

Nenhum handler de webhook no frontend.

## Background Jobs

Nenhum sistema de filas. Toda lógica é síncrona (com `sleep` simulando latência de rede).

## Local Storage

**Service:** Browser `localStorage`
**Purpose:** Persistir preferência de tema (dark/light)
**Implementation:** `src/components/theme-provider.tsx`
**Key:** `vite-ui-theme`

**Nota:** Auth persiste access token + snapshot em `sessionStorage`; refresh token fica no cookie HttpOnly (após T11).

## Variáveis de ambiente

- Nenhum arquivo `.env*` no repositório
- `vite.config.ts` define apenas alias `@` → `./src`
- Sem integração com secrets manager ou config por ambiente

## Personas e rotas externas

Não há deep links ou OAuth callbacks configurados. Rotas são 100% client-side via React Router (`BrowserRouter`).

## Mapa de dependências externas (npm)

Principais runtime deps com impacto em integração futura:

| Pacote | Uso | Integração externa |
|--------|-----|-------------------|
| `react-router-dom` | Routing SPA | Não |
| `zod` | Validação | Não |
| `recharts` | Gráficos | Não |
| `sonner` | Toasts | Não |
| `date-fns` | Datas | Não |

Nenhuma SDK de terceiros (Stripe, Auth0, Firebase, etc.) presente.
