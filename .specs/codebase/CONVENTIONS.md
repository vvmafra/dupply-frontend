# Code Conventions

**Observed in codebase** — inclui aderência e divergências reais vs `.cursor/rules/`

## Naming Conventions

**Files:**

- Componentes React: PascalCase — `SellerDuplicatasPage.tsx`, `DuplicataAnaliseBadge.tsx`
- UI shadcn: kebab-case — `button.tsx`, `dropdown-menu.tsx`
- Domínio/serviços: kebab-case com sufixo descritivo — `duplicata.types.ts`, `seller-review.service.ts`
- Constantes/helpers: kebab-case — `duplicata-analise.constants.ts`, `auth.helpers.ts`

**Functions/Methods:**

- Serviços: verbos de intenção — `fetchAllDuplicatas`, `createDuplicata`, `setDuplicataAnaliseAnalista`
- Helpers de domínio: `get*`, `can*`, `calc*` — `getProfileRedirect`, `canSellerRegisterDuplicatas`, `calcValorLiquidoCedente`
- Componentes: PascalCase — `export function NewDuplicataForm()`

**Variables:**

- camelCase — `selectedProfile`, `valorDesejadoAntecipacao`, `analiseAnalista`
- Estado local: pares `loading`/`setLoading`, `errors`/`setErrors`

**Constants:**

- UPPER_SNAKE para catálogos — `REQUIRED_DOCUMENTS`, `INITIAL_DUPLICATAS`, `DUPLICATA_DEMO`
- Objetos de rotas: `ROUTES` (camelCase key, valores string)

## Code Organization

**Import/Dependency Declaration:**

Ordem típica observada:
1. React / react-router
2. Bibliotecas externas (lucide, sonner, zod)
3. Componentes UI (`@/components/ui/*`)
4. Componentes de feature
5. Serviços, domínio, lib, tipos

Exemplo de `NewDuplicataForm.tsx`:

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
// ... mais UI
import { createDuplicata } from "@/services/duplicata.service";
import { ROUTES } from "@/lib/routes";
import type { DuplicataTipo } from "@/domain/duplicata/duplicata.types";
```

**File Structure (componentes):**

1. Imports
2. Props interface
3. Component function (named export)
4. Helpers locais (se houver)

**Path alias:**

- Imports internos via `@/` — **aderente** à regra `10-react-ts-frontend`

## Type Safety

**Approach:** TypeScript strict; props tipadas; tipos de domínio centralizados; Zod para schemas de formulário multi-step

**Example:**

```tsx
interface NewDuplicataFormProps {
  sellerId: string;
}
export function NewDuplicataForm({ sellerId }: NewDuplicataFormProps) { ... }
```

- `any` evitado na amostra analisada
- `as const` em `ROUTES` e objetos de labels
- `verbatimModuleSyntax: true` — imports de tipo com `type`

## Exports

**Observed:**

- Páginas e componentes de feature: **export nomeado** (`export function LoginPage()`)
- Exceção: `App.tsx` tem `export function App` **e** `export default App`; `main.tsx` importa o default

**Divergência vs regra `10-react-ts-frontend`:** "Usar componentes funcionais com export nomeado" — `App.tsx`/`main.tsx` usam default export.

## Error Handling

**Pattern:** Toast (sonner) para sucesso; validação inline retorna mensagens em português; sem blocos `catch` no `src/`

- `useAuth()` lança se fora do provider: `throw new Error("useAuth must be used within AuthProvider")`
- Submits usam `try/finally` sem `catch` (ex.: `NewDuplicataForm.handleSubmit`)
- Falhas de serviço mock raramente propagam erro — assume sucesso

## Comments/Documentation

**Style:** Comentários pontuais para hacks de demo/hackathon e decisões não óbvias

Exemplos:
- `/** Cedente pode cadastrar e enviar duplicatas (mock / hackathon). */` em `seller-duplicata-access.ts`
- `/** Dados fixos só para demo/hackathon */` em `NewDuplicataForm.fillDemoData()`
- JSDoc em `PublicShell` explicando propósito do layout

## UI Language

- Textos de interface: **português** (aderente a `00-core-context`)
- Rotas e chaves técnicas: **inglês** (`/seller/duplicatas`, `riskAnalyst`, `for_approval`)
- Exceção: módulo legado `receivables` usa nomenclatura EN no admin

## Formulários

| Formulário | Validação | Aderência |
|------------|-----------|-----------|
| Cadastro cedente (`SellerRegistrationWizard`) | Zod schemas em `domain/seller/seller-registration.schema.ts` | ✅ regra `30-auth-forms-onboarding` |
| Nova duplicata (`NewDuplicataForm`) | `validate()` inline no componente | ❌ diverge — deveria estar em `domain/duplicata` |
| Login mock | Validação mínima no serviço (email não vazio) | Aceitável para demo |

## Rotas

| Prática | Status |
|---------|--------|
| `ROUTES` centralizado em `lib/routes.ts` | ✅ Existe |
| Links/navegação consomem `ROUTES` | ✅ ~25 arquivos |
| Definição de `<Route path="...">` em `App.tsx` usa strings literais | ❌ diverge de `20-routing-pages` |
| `ProtectedRoute` redireciona com strings (`"/login"`) | ❌ diverge |
| `ReceivableTable` usa `` `${detailBasePath}/${r.id}` `` | ⚠️ parcial — prop dinâmica, não `ROUTES` |

## Serviços e mocks

- Funções pequenas, tipadas, com `sleep()` — **aderente** a `40-services-mocks`
- Mocks respeitam tipos de domínio
- Estado mutável module-level nos serviços (`let duplicatas = ...`)

## Personas

- Ativas: `seller`, `admin`, `riskAnalyst` — **aderente** a `00-core-context`
- `investor`: pastas vazias em `pages/`, `domain/`, `components/` — scaffold sem rotas (OK, não reintroduzido)

## Antes de finalizar (regra `00-core-context`)

- `npm run typecheck` disponível e documentado nas rules
- Fluxos de auth/perfil/navegação existem mas têm fragilidades documentadas em CONCERNS.md
