# Design System — Tasks

**Spec:** [spec.md](./spec.md)  
**Design:** [design.md](./design.md)  
**Status:** In Progress — 2026-10-21  
**Branch:** `feat/design-system` → PR contra `feat/demo-local`  
**Gate por task:** `npm run typecheck` + `npm run build` + screenshots (`scripts/ds-screenshots.mjs`) · commit atômico por task

---

## Status legend

🔴 todo · 🟡 in progress · 🟢 done · ⏸ blocked

---

## Execution Plan

```
T0 → T0.5 → T1 → T2 → T3 ─┐
                   └→ T4 ─┼→ T5
```

T3 (landing) e T4 (telas) são `[P]` depois de T2.

---

## Tasks

### T0 — Baseline 🟡
- [x] Branch `feat/design-system` a partir de `feat/demo-local`
- [x] Spec, design e tasks desta feature
- [x] Logo: o SVG enviado é PNG embutido; PNG transparente extraído em `public/brand/` (vetor real em T1)
- [ ] `npm ci` (⏸ registry npm inacessível em 21/10 à noite — retry em background)
- [ ] `scripts/ds-screenshots.mjs` (Playwright, modo mock, light/dark, 1280/375) → `.specs/features/design-system/screenshots/before/`
- **Verify:** typecheck verde; 8 telas × 2 temas × 2 larguras em `before/`

### T0.5 — Estrutura + portes 🔴
- [ ] `src/app/{App,providers,router,guards}.tsx`; `App.tsx` consome `ROUTES`
- [ ] `git mv` páginas e componentes de perfil para `src/features/<domínio>/`; codemod de imports
- [ ] `lazy()` + `Suspense` + `ErrorBoundary`
- [ ] `lib/validators.ts` (CPF/CNPJ), `lib/mask.ts` (+CEP, data), `services/export/csv.ts`, `components/layout/AuthLayout.tsx`
- [ ] Atualizar `.specs/codebase/STRUCTURE.md`, `.cursor/rules/20-routing-pages.mdc`
- **Verify:** typecheck verde; todas as rotas abrem em mock; nenhum import relativo quebrado

### T1 — Tokens + docs 🔴
- [ ] `src/index.css`: ramps em `@theme`, semânticos light/dark, `text-2xs`, motion tokens, `prefers-reduced-motion`, remover `--dupply-brand-*`
- [ ] Marca vetorial: `public/brand/dupply-mark.svg` (+ mono, + sobre escuro), favicon, `apple-touch-icon`
- [ ] `DESIGN.md`, `PRODUCT.md`, `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`)
- [ ] `.cursor/rules/60-design-system.mdc`; `npm run lint:ds`
- **Verify:** `lint:ds` passa em `components/ui`; contraste AA dos pares semânticos (script); dark sem token igual ao light

### T2 — Componentes de produto + `/__ds` 🔴
- [ ] `StatusBadge` + mapas de status por entidade (a partir do inventário da spec, corrigido pelo Victor)
- [ ] `Money`, `Rate`, `Stat`, `PageHeader`, `Section`, `EmptyState`, `HashAddress`
- [ ] Rota `/__ds` (DEV) com fundações + todos os primitivos e componentes em light/dark
- [ ] Revisão com `frontend-design` skill; `/impeccable critique` no Cursor
- **Verify:** `/__ds` renderiza sem erro; cada componente tem exemplo em todos os `tone`/`size`

### T3 — Landing + topbar 🔴 `[P]`
- [ ] `dupplyTopbar.styles.ts` → tokens (0 hex)
- [ ] `LandingPage.tsx` → tokens (0 hex); Motion instalado; hero RareUI (Liquid Wave/Metal), CTA Glass Shimmer, Digit Swap nos números
- [ ] `prefers-reduced-motion` nos efeitos
- **Verify:** `lint:ds` passa; screenshots light/dark/mobile

### T4 — Aplicar nas telas 🔴 `[P]`
- [ ] Codemods: `text-[#7C8594]` → `text-muted-foreground`; `text-[10px]` → `text-2xs`
- [ ] investor: badges → `StatusBadge`, KPIs → `Stat`/`Money`, headers → `PageHeader`
- [ ] seller · analyst · admin (mesma ordem)
- [ ] Remover `ReceivableStatusBadge` em favor de `StatusBadge`
- **Verify:** `grep` de hex/arbitrários = 0; screenshots por perfil

### T5 — QA + PR 🔴
- [ ] Screenshots `after/`; página `compare.html` antes/depois
- [ ] Checar dark em todas as telas e 375px nas 8 principais
- [ ] `STATE.md` (decisões: paleta, estrutura, AGENTS.md), `CONVENTIONS.md`, `STRUCTURE.md`
- [ ] PR `feat/design-system` → `feat/demo-local`
- **Verify:** build verde; PR com sumário e screenshots

---

## Deferred

- Storybook + visual regression (Chromatic/Lost Pixel)
- Vitest para componentes de produto; ESLint com `no-arbitrary-value`
- `DataTable` (TanStack) se não couber em T2
- Troca de fonte (comparativo Geist/Manrope/Plus Jakarta)
- Entidade `Offer` separada de `ReceivableStage.offer`
