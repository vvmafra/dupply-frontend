# Testing Infrastructure

**Status:** Não implementado — protótipo hackathon sem framework de testes

## Test Frameworks

**Unit/Integration:** Nenhum (sem Vitest, Jest ou Testing Library no `package.json`)
**E2E:** Nenhum (sem Playwright, Cypress)
**Coverage:** Nenhum (sem c8/istanbul/nyc)

## Test Organization

**Location:** Nenhum arquivo `*.test.ts`, `*.test.tsx`, `*.spec.ts` ou `*.spec.tsx` encontrado
**Naming:** N/A
**Structure:** N/A

## Testing Patterns

### Unit Tests

**Approach:** Não existem
**Location:** N/A

Camadas que se beneficiariam prioritariamente:
- `domain/duplicata/duplicata-antecipacao.helpers.ts` — cálculos financeiros
- `domain/seller/seller-duplicata-access.ts` — gate de acesso
- `domain/seller/seller-registration.schema.ts` — validação Zod
- `domain/auth/auth.helpers.ts` — redirects por perfil

### Integration Tests

**Approach:** Não existem
**Location:** N/A

Candidatos: fluxos serviço + mock (`duplicata.service.ts` mutando estado)

### E2E Tests

**Approach:** Não existem
**Location:** N/A

Candidatos: login → seleção perfil → criar duplicata → analista aprovar

## Test Execution

**Commands disponíveis hoje:**

| Comando | Propósito | Equivalente de gate |
|---------|-----------|-------------------|
| `npm run typecheck` | Verificação estática TypeScript | Gate mínimo atual |
| `npm run build` | `tsc -b && vite build` | Gate de compilação |

**Configuration:** Apenas `tsconfig.app.json` com flags strict — sem config de test runner

## Coverage Targets

**Current:** 0% — nenhum teste automatizado
**Goals:** Não documentados no repositório
**Enforcement:** Nenhum CI

## Test Coverage Matrix

| Code Layer | Required Test Type | Location Pattern | Run Command |
|------------|-------------------|------------------|-------------|
| Domain helpers/schemas | unit | `src/domain/**/*.ts` | *(não configurado)* |
| Services (mock) | unit/integration | `src/services/**/*.ts` | *(não configurado)* |
| React components | component/unit | `src/components/**/*.tsx` | *(não configurado)* |
| Pages / routing | e2e ou integration | `src/pages/**/*.tsx`, `src/App.tsx` | *(não configurado)* |
| Auth flows | e2e | `src/contexts/`, `src/pages/LoginPage.tsx` | *(não configurado)* |
| UI shadcn | none (third-party) | `src/components/ui/**` | — |

## Parallelism Assessment

| Test Type | Parallel-Safe? | Isolation Model | Evidence |
|-----------|----------------|-----------------|----------|
| Unit (futuro) | Sim (provável) | Funções puras em domain; serviços mockáveis com reset de estado | Sem testes; domain helpers são puras |
| Integration (futuro) | Não (atual) | Serviços usam `let` mutável module-level compartilhado | `duplicata.service.ts:8` — `let duplicatas` |
| E2E (futuro) | Sim (provável) | SPA isolada por instância de browser | Padrão típico Playwright |

**Nota:** Estado mutável global nos serviços dificulta testes paralelos de integração até introduzir injeção de dependência ou reset por teste.

## Gate Check Commands

| Gate Level | When to Use | Command |
|------------|-------------|---------|
| Quick | Após alterações em TS/TSX (regra `00-core-context`) | `npm run typecheck` |
| Build | Após conclusão de feature ou antes de PR | `npm run build` |
| Full | *(não disponível)* | — |
| Lint | *(não disponível — sem ESLint)* | — |

## Recomendações para introdução de testes

1. Adicionar **Vitest** + **@testing-library/react** (alinhado ao stack Vite)
2. Priorizar testes unitários em `domain/` (ROI alto, sem DOM)
3. Refatorar serviços para aceitar store injetável ou factory `createDuplicataService(store)` antes de testes de integração
4. Adicionar script `"test": "vitest"` e gate CI mínimo: `typecheck + test + build`

## Divergência vs regras

- Regra `00-core-context` exige `npm run typecheck` — **único gate automatizado existente**
- Nenhuma regra em `.cursor/rules/` exige testes, mas a ausência total é risco documentado em CONCERNS.md
