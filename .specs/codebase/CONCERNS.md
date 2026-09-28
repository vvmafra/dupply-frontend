# Codebase Concerns

**Analysis Date:** 2026-05-19

Documento cruzado com regras em `.cursor/rules/` — divergências com evidência no código.

---

## Divergências reais vs `.cursor/rules/`

### Rotas: `App.tsx` não consome `ROUTES`

- **Regra:** `20-routing-pages` — "Toda rota nova deve entrar em `ROUTES` antes de ser usada"; "Não usar strings mágicas de rota"
- **Código:** `ROUTES` existe e é usado em links (~25 arquivos), mas **todas** as definições `<Route path="...">` e redirects em `ProtectedRoute` usam strings literais
- **Files:** `src/App.tsx` (linhas 32-33, 40-175), `src/lib/routes.ts`
- **Impact:** Duplicação de paths; risco de drift entre `ROUTES` e router; refactors exigem editar dois lugares
- **Fix approach:** Importar `ROUTES` em `App.tsx` e usar `path={ROUTES.login}` etc.; extrair `ProtectedRoute` para arquivo dedicado se crescer

### Validação de duplicata fora do domínio

- **Regra:** `30-auth-forms-onboarding` — "Validação deve ficar no domínio (`schema`) e não espalhada na UI"
- **Código:** `NewDuplicataForm.tsx` implementa `validate()` inline (linhas 79-98) com ~15 regras manuais
- **Contraste:** Cadastro cedente segue a regra corretamente via `seller-registration.schema.ts` + react-hook-form
- **Impact:** Regras de negócio difíceis de reutilizar/testar; inconsistência entre formulários
- **Fix approach:** Criar `domain/duplicata/duplicata.schema.ts` (Zod) e migrar `NewDuplicataForm` para react-hook-form

### Export default em `App.tsx`

- **Regra:** `10-react-ts-frontend` — "Usar componentes funcionais com export nomeado"
- **Código:** `export default App` em `App.tsx:188`; `main.tsx:5` importa default
- **Impact:** Baixo — inconsistência de estilo
- **Fix approach:** Trocar `main.tsx` para `import { App } from "./App.tsx"` e remover default export

### Dual model duplicatas (PT) vs receivables (EN)

- **Regra:** `50-risk-analyst-hackathon` — fluxo principal é duplicatas; admin ainda expõe receivables
- **Código:** Seller/analyst usam `duplicata.service.ts`; admin usa `receivables.service.ts` + `AdminReceivablesPage`
- **Impact:** Dois vocabulários e datasets paralelos; confusão para novos devs e agentes
- **Fix approach:** Migrar admin para duplicatas ou marcar receivables como deprecated com redirect

---

## Tech Debt

**Estado mutável global nos serviços (mitigado):**

- Issue: Arrays `let` module-level mutados por todas as chamadas de serviço — dados criados na demo sumiam no F5 e não apareciam em outra aba
- Files: `src/lib/mock-store.ts` (store persistido em `localStorage`, chave versionada `dupply_mock:v1:*`); consumido por `duplicata.service.ts`, `offer.service.ts`, `seller-review.service.ts`, `seller.service.ts`, `admin.service.ts`, `investor.service.ts`
- Status: duplicatas, ofertas, investimentos, revisões cadastrais, sellers e perfis de investidor persistem entre reloads/abas; botão "Reiniciar dados da demo" na tela de login (modo mock) chama `resetAllMockStores()`
- Pendente: `MOCK_RECEIVABLES` (admin legado) e `MOCK_TRANSACTIONS` continuam só em memória; mudar o shape dos seeds exige bump de `STORAGE_VERSION`

**Auth sem persistência:**

- Issue: `AuthContext` usa apenas `useState` — sessão perdida no F5
- Files: `src/contexts/AuthContext.tsx`
- Why: Protótipo mock
- Impact: UX ruim em demo; guard inconsistente (`SelectProfilePage` checa `user`, `ProtectedRoute` checa `isAuthenticated`)
- Fix approach: Persistir token/profile mínimo em `sessionStorage`; alinhar guards

**`user.profile` hardcoded como `"seller"`:**

- Issue: `login()` sempre seta `profile: "seller"` independente do perfil escolhido
- Files: `src/contexts/AuthContext.tsx:23`
- Impact: Código que lê `user.profile` pode ter comportamento incorreto; hoje o app usa `selectedProfile` separado
- Fix approach: Setar `user.profile` ao selecionar perfil ou remover campo redundante

**Scaffold investor vazio:**

- Issue: Pastas `pages/investor/`, `domain/investor/`, `components/investor/` existem sem conteúdo
- Files: diretórios vazios
- Impact: Ruído na navegação do projeto
- Fix approach: Remover pastas ou adicionar README interno explicando depreciação

**Nome de pacote desatualizado:**

- Issue: `"name": "shadcn-ui-template"` em `package.json`
- Impact: Confusão em tooling/logs
- Fix approach: Renomear para `dupply-frontend`

---

## Security Considerations

**Autenticação client-side only:**

- Risk: Qualquer usuário pode manipular estado React e acessar rotas protegidas em demo
- Files: `src/contexts/AuthContext.tsx`, `src/App.tsx`
- Current mitigation: Protótipo local sem dados reais
- Recommendations: Ao integrar backend, validar sessão server-side; não confiar em `selectedProfile` no client

**Credenciais demo expostas na UI:**

- Risk: `MockLoginForm` pré-preenche e-mail/senha de demonstração
- Files: `src/components/auth/MockLoginForm.tsx`
- Current mitigation: Aceitável para hackathon
- Recommendations: Remover ou isolar atrás de flag `import.meta.env.DEV` antes de produção

---

## Fragile Areas

**Fluxo auth → perfil → dashboard:**

- Files: `AuthContext.tsx`, `SelectProfilePage.tsx`, `App.tsx`, `domain/auth/auth.helpers.ts`
- Why fragile: Três fontes de verdade (`user`, `isAuthenticated`, `selectedProfile`); sem persistência
- Common failures: Reload perde sessão; navegação após login pode correr com profile ainda null (mitigado parcialmente por `selectedProfileOnLogin` param)
- Safe modification: Testar manualmente login → cada perfil → logout → deep link protegido
- Test coverage: Nenhum

**Wizard de aprovação de duplicata (analista):**

- Files: `AnalystDuplicataApprovalWizardDialog.tsx`, `duplicata.service.ts`, `domain/duplicata/duplicata-antecipacao.helpers.ts`
- Why fragile: Múltiplos estados (`analiseAnalista`, oferta, decisão cedente); delete condicional de campos em `setDuplicataAnaliseAnalista`
- Safe modification: Preservar transições de status documentadas em `duplicata-analise.constants.ts`
- Test coverage: Nenhum

**Gate `canSellerRegisterDuplicatas`:**

- Files: `src/domain/seller/seller-duplicata-access.ts`
- Why fragile: Comentário explícito "mock / hackathon" — regra simplificada
- Safe modification: Alterar apenas com alinhamento product + atualizar mocks de sellers
- Test coverage: Nenhum

---

## Missing Critical Features

**Backend real:**

- Problem: Zero integração HTTP
- Current workaround: Serviços mock
- Blocks: Deploy produção, auth real, persistência
- Implementation complexity: Grande — substituir camada `services/`

**Testes automatizados:**

- Problem: Nenhum framework configurado
- Current workaround: `npm run typecheck` manual
- Blocks: Refactors seguros, CI
- Implementation complexity: Médio — Vitest + testes domain primeiro

**CI/CD:**

- Problem: Sem pipeline
- Blocks: Gates automáticos em PR
- Implementation complexity: Pequeno — workflow GitHub Actions com typecheck + build

---

## Test Coverage Gaps

**Domain helpers (cálculo antecipação, acesso duplicatas):**

- What's not tested: `calcValorLiquidoCedente`, `canSellerRegisterDuplicatas`, schemas Zod
- Risk: Regressão silenciosa em valores financeiros e gates de acesso
- Priority: High
- Difficulty: Low — funções puras

**Serviços mock (mutação de estado):**

- What's not tested: CRUD duplicatas, transições de análise
- Risk: Fluxo seller→analyst quebra sem detecção
- Priority: High
- Difficulty: Medium — requer isolamento de store

**Routing e guards:**

- What's not tested: `ProtectedRoute`, redirects legados `/seller/receivables*`
- Risk: Rotas expostas ou redirects quebrados
- Priority: Medium
- Difficulty: Medium — Testing Library + MemoryRouter

---

## Dependencies at Risk

**Nenhum risco crítico identificado** — stack recente (React 19, Vite 7, TS 5.9). Monitorar:
- React Router 7 (API ainda evoluindo)
- Zod 4 (major recente — schemas já usam v4)

---

## Aderências confirmadas (sem divergência)

| Regra | Evidência |
|-------|-----------|
| Personas seller/admin/riskAnalyst; sem investor | `auth.types.ts`, rotas em `App.tsx`, zero refs a `investor` no código |
| UI em português | Labels, toasts, erros de validação em PT |
| Paths em inglês | `/seller/duplicatas`, `/analyst/sellers` |
| `REQUIRED_DOCUMENTS` centralizado | `seller.validation.ts` — consumido em 6+ arquivos, não duplicado |
| Serviços com `fetch*`/`create*`, `sleep`, tipados | Padrão consistente em `src/services/` |
| Páginas públicas com layout público | `PublicShell` → `PublicHeader` em Login, Landing, Registro, SelectProfile |
| `npm run typecheck` disponível | `package.json` scripts |

---

_Concerns audit: 2026-05-19_
_Atualizar conforme divergências forem corrigidas ou novas forem descobertas_
