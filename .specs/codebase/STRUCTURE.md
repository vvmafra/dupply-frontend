# Project Structure

**Root:** `/home/vvmarsen/projects/dupply-frontend`

## Directory Tree

```
dupply-frontend/
├── .cursor/rules/          # Regras Cursor (6 arquivos .mdc)
├── .specs/codebase/        # Documentação brownfield (este mapeamento)
├── public/                 # Assets estáticos (logo, favicon)
├── src/
│   ├── App.tsx             # Router + ProtectedRoute
│   ├── main.tsx            # Bootstrap React
│   ├── index.css           # Tailwind + tokens
│   ├── components/
│   │   ├── admin/          # UI admin (6)
│   │   ├── analyst/        # UI analista (5)
│   │   ├── auth/           # Login, registro, perfil
│   │   ├── dashboard/      # Charts compartilhados
│   │   ├── duplicata/      # Badge/status duplicata
│   │   ├── forms/          # FormSection, NewDuplicataForm
│   │   ├── investor/       # (vazio)
│   │   ├── layout/         # AppShell, Sidebar, PublicShell
│   │   ├── receivables/    # UI legado EN
│   │   ├── seller/         # UI cedente (8)
│   │   └── ui/             # shadcn (~50 componentes)
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── data/               # 8 arquivos *.mock.ts
│   ├── domain/
│   │   ├── admin/, auth/, blockchain/, documents/
│   │   ├── duplicata/, receivables/, risk-analyst/, seller/
│   │   └── investor/       # (vazio)
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── routes.ts, utils.ts, formatters.ts
│   ├── pages/
│   │   ├── admin/          # 5 páginas
│   │   ├── analyst/        # 4 páginas
│   │   ├── seller/         # 4 páginas
│   │   ├── investor/       # (vazio)
│   │   └── *.tsx           # 7 páginas públicas/compartilhadas
│   └── services/           # 8 serviços mock
├── components.json         # Config shadcn
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json
└── vite.config.ts
```

**Total:** ~177 arquivos `.ts`/`.tsx` em `src/`

## Module Organization

### Public / Auth

**Purpose:** Landing, login mock, cadastro cedente, seleção de perfil
**Location:** `src/pages/LandingPage.tsx`, `LoginPage.tsx`, `SellerRegistration*.tsx`, `SelectProfilePage.tsx`
**Key files:** `components/auth/MockLoginForm.tsx`, `SellerRegistrationWizard.tsx`, `contexts/AuthContext.tsx`

### Seller (cedente)

**Purpose:** Dashboard, validação KYC, CRUD duplicatas, wizard de operação
**Location:** `src/pages/seller/`, `src/components/seller/`
**Key files:** `SellerDuplicatasPage.tsx`, `NewDuplicataPage.tsx`, `NewDuplicataForm.tsx`, `SellerDuplicataOperacaoWizardDialog.tsx`

### Analyst (riskAnalyst)

**Purpose:** Revisão cadastral, análise/aprovação de duplicatas
**Location:** `src/pages/analyst/`, `src/components/analyst/`
**Key files:** `AnalystDuplicatasPage.tsx`, `AnalystDuplicataDetailPage.tsx`, `AnalystDuplicataApprovalWizardDialog.tsx`, `AnalystCadastralReviewWizardDialog.tsx`

### Admin

**Purpose:** Métricas, validações, recebíveis legado, transações blockchain, visão de cedentes
**Location:** `src/pages/admin/`, `src/components/admin/`
**Key files:** `AdminDashboardPage.tsx`, `AdminSellersPage.tsx`, `AdminTransactionTable.tsx`

### Shared review

**Purpose:** Detalhe de cedente compartilhado entre admin e analista
**Location:** `src/pages/SellerReviewDetailPage.tsx`

### Domain layer

**Purpose:** Tipos, schemas, regras de negócio
**Location:** `src/domain/`
**Key files:** `duplicata/duplicata.types.ts`, `seller/seller-registration.schema.ts`, `seller/seller.validation.ts` (`REQUIRED_DOCUMENTS`)

### Data / Services

**Purpose:** Fixtures e API mockada
**Location:** `src/data/`, `src/services/`
**Key files:** `duplicatas.mock.ts`, `duplicata.service.ts`, `seller-review.service.ts`

## Where Things Live

**Autenticação:**

- UI: `pages/LoginPage.tsx`, `components/auth/MockLoginForm.tsx`
- Estado: `contexts/AuthContext.tsx`
- Lógica: `services/auth.service.ts`, `domain/auth/`
- Guards: `App.tsx` (`ProtectedRoute`)

**Cadastro de cedente:**

- UI: `SellerRegistrationWizard` + steps em `components/auth/seller-registration/`
- Validação: `domain/seller/seller-registration.schema.ts`
- Serviço: `services/seller-registration.service.ts`
- Documentos: `REQUIRED_DOCUMENTS` em `domain/seller/seller.validation.ts`

**Duplicatas (fluxo principal):**

- UI cedente: `components/forms/NewDuplicataForm.tsx`, `pages/seller/`
- UI analista: `pages/analyst/`, `components/analyst/`
- Regras: `domain/duplicata/`
- Dados: `data/duplicatas.mock.ts`, `services/duplicata.service.ts`

**Recebíveis (legado admin):**

- UI: `pages/admin/AdminReceivablesPage.tsx`, `components/receivables/`
- Domínio: `domain/receivables/`
- Serviço: `services/receivables.service.ts`

**Blockchain (mock):**

- UI: `AdminTransactionsPage`, `AdminTransactionTable`
- Domínio: `domain/blockchain/`
- Serviço: `services/blockchain.service.ts`

**Rotas:**

- Constantes: `lib/routes.ts`
- Definição: `App.tsx`

**Layout:**

- Autenticado: `components/layout/AppShell.tsx`, `Sidebar.tsx`, `Header.tsx`
- Público: `components/layout/PublicShell.tsx` → `PublicHeader.tsx`

## Special Directories

**`.cursor/rules/`**
Regras de projeto para o agente Cursor — fonte de verdade para convenções declaradas (cruzadas neste mapeamento).

**`src/components/ui/`**
Componentes shadcn/ui gerados — não editar padrões Radix sem necessidade; preferir composição em componentes de feature.

**`src/components/investor/`, `src/pages/investor/`, `src/domain/investor/`**
Scaffold vazio — persona `investor` removida do produto; pastas permanecem sem uso.

**`dist/`**
Build output — gerado por `npm run build`, não versionar alterações manuais.

**Skill TLC (`.cursor/skills/tlc-spec-driven/`)**
Planejamento spec-driven para agentes Cursor — não faz parte do runtime da aplicação. Fonte única; lock em `.agents/.skill-lock.json`.
