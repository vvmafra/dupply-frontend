# AGENTS.md — Dupply Frontend

Instruções para qualquer agente (Cursor, Claude Code, Codex, Copilot) que trabalhe neste repositório. É a fonte única; `CLAUDE.md` só aponta para cá e as rules em `.cursor/rules/` detalham por área.

## O que é

SPA React 19 + Vite 7 + TypeScript + Tailwind 4 + shadcn (new-york) + react-router 7 da **Dupply**, plataforma de antecipação de duplicatas com análise de risco por agente de IA e liquidação on-chain. Quatro perfis: `seller` (cedente), `riskAnalyst` (analista), `investor`, `admin`. Produto e princípios em `PRODUCT.md`; sistema visual em `DESIGN.md`; marca em `public/brand/`.

## Antes de começar

1. Leia `.specs/project/STATE.md` (decisões, blockers) e `.specs/WORKFLOW.md` (fluxo).
2. Feature em andamento: `.specs/features/<slug>/{spec,design,tasks}.md`. Trabalhe pelas tasks, uma por commit.
3. Para UI: `DESIGN.md` e a rule `.cursor/rules/60-design-system.mdc`. Para ver os componentes, rode o app e abra `/__ds`.

## Comandos

| Comando | Quando |
|---|---|
| `npm run dev` | desenvolver (mock por padrão: `VITE_USE_MOCKS=true`) |
| `npm run typecheck` | gate mínimo, sempre antes de concluir |
| `npm run build` | antes de abrir PR |
| `npm run lint:ds` | após tocar qualquer `.tsx`/`.css` |
| `npm run brand:book` | regenerar o manual de marca após mudar tokens |

## Convenções

- Textos de interface em português; rotas, chaves e código em inglês.
- Componentes funcionais com export nomeado; imports via `@/`; sem `any`.
- UI: `src/components/ui` (shadcn, não editar à mão), `src/components` (produto), `src/components/layout`. Domínio em `src/domain`, serviços em `src/services` (mock-first), rotas em `src/lib/routes.ts`.
- Status sempre via `StatusBadge`, dinheiro via `Money`, cores só por token. Hex em `src/` é bug.
- Validação de formulário no domínio (`*.schema.ts` com Zod), não na UI.
- Não reformatar arquivo inteiro; seguir o estilo do arquivo tocado.

## Ao terminar uma task

- `typecheck` e `lint:ds` verdes; tela conferida em light e dark.
- Commit atômico com mensagem convencional (`feat(scope): …`, `fix:`, `docs:`, `refactor:`).
- Atualizar `tasks.md` da feature e, se houve decisão, `.specs/project/STATE.md`.
