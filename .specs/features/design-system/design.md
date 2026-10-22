# Design System Dupply — Design

**Spec:** [spec.md](./spec.md)  
**Status:** Draft — 2026-10-21

---

## 1. Fundações

### Cor — 3 níveis

**Primitivos** (ramps 50–950 em OKLCH, geradas a partir dos hex do logo; valores finais em `src/index.css`):

| Ramp | Matiz | Origem | Papel |
|---|---|---|---|
| `blue` | 251 | logo `#0192FE` | ação (primary) |
| `cyan` | 220 | logo `#0FCBF4` | acento de marca |
| `mint` | 167 | logo `#52EDBA` | acento de marca |
| `violet` | 285 | novo | conteúdo de IA |
| `emerald` | 152 | novo | success |
| `amber` | 80 | novo | warning |
| `coral` | 25 | novo | destructive |
| `neutral` | 251, croma 0.016 | novo | cinzas frios na matiz da marca |
| `navy` | — | existente `#0b1f3b` | fundo das páginas públicas |

**Semânticos** (o que o código usa; nunca usar primitivo direto em componente de feature):

| Token | Light | Dark | Uso |
|---|---|---|---|
| `primary` | `#0060DE` (entre os dois azuis do logo; 5:1 c/ branco) | `#0192FE` | botão principal, link, foco, seleção |
| `success` / `warning` / `destructive` / `info` | ramp 600 texto · 100 fundo | ramp 400 texto · 900 fundo | status |
| `ai` | violet 600 · 100 | violet 400 · 900 | só saída do agente de IA |
| `background` / `card` / `border` / `muted-foreground` | neutral 50 · branco · 200 · 600 | ink 950 `#07101C` · ink 900 `#101B2B` · ink 800 `#1B2737` · neutral 400 | 85% da interface |
| `brand-gradient` | `linear-gradient(135deg, #0192FE, #064DCD)` | idem | hero, CTA de marca |
| `brand-accent-gradient` | `linear-gradient(135deg, #0FCBF4, #52EDBA)` | idem | ilustração, destaque; **nunca** botão ou status |

Decisão: o azul claro do logo (`#0192FE`) reprova AA com texto branco (3.2:1), então não é cor de botão no light. Ciano e menta são marca, não status (a menta tem 1.5:1 sobre branco).

**Componente** (`--button-*`, `--badge-*`): só quando um componente precisar divergir do semântico. Default: zero.

### Tipografia

- Família: Inter (mantida até sexta) com `font-feature-settings: "cv11", "ss01"` e **`font-variant-numeric: tabular-nums` em `Money`, `Rate`, `Stat` e tabelas**.
- Escala: `text-2xs` (10px, novo token) · xs 12 · sm 14 (corpo) · base 16 · lg 18 · xl 20 · 2xl 24 (KPI) · 3xl 30 (hero interno) · 4xl+ (landing).
- Pesos: 400 corpo · 500 label · 600 título/ação · 700 só KPI e display.
- Mono (`font-mono`) para hash, endereço, IDs (`DUP-2026-0141`).

### Espaçamento e layout (ritmo do neutrotham, já maioritário no código)

- Base 4px. Card `p-6`; card compacto `p-4`; grid `gap-4`; seções `space-y-6`; dentro de seção `space-y-2`/`gap-2`.
- Container de página: `max-w-7xl mx-auto px-4 md:px-6`; `PageHeader` com `mb-6`.
- Radius: `--radius: 0.625rem` (mantido). Pill só em badge.
- Elevação: `shadow-xs` em card light; dark usa borda `1px` `border` em vez de sombra.

### Motion

- Tokens: `--duration-fast: 120ms` · `--duration-base: 200ms` · `--duration-slow: 320ms`; `--ease-out: cubic-bezier(.2,.8,.2,1)` · `--ease-in-out: cubic-bezier(.4,0,.2,1)`.
- Lib: Motion (`motion/react`) instalada para componentes beUI/RareUI; CSS para o resto.
- Regra: anima entrada, estado e número; não anima layout de tabela. `prefers-reduced-motion` global em `index.css`.

### Ícones

Lucide, `size-4` em texto/botão, `size-5` em nav, `stroke-width` default. Ícone nunca sozinho sem `aria-label`.

---

## 2. Componentes de produto (`src/components/`)

| Componente | API | Base |
|---|---|---|
| `StatusBadge` | `<StatusBadge entity="receivableStage" value="funding" />` — mapa entidade→valor→(label, tone) em `domain/*/…constants.ts`; `tone` = success/warning/info/destructive/neutral/ai | `Badge` + cva `tone` |
| `Money` | `<Money value={184250} />`; `size`, `signed`, `compact`, `muted`; tabular | `formatCurrencyBRL` |
| `Rate` | `<Rate value={0.019} period="am" />` | `formatMonthlyRate`/`formatPercent` |
| `Stat` | `label`, `value` (node), `delta`, `hint`, `icon`; `tone` no delta | `Card` |
| `PageHeader` | `title`, `description`, `breadcrumb`, `actions`, `meta` (badges) | — |
| `Section` | `title`, `description`, `actions`, `children`; aplica `space-y-*` | — |
| `EmptyState` | `icon`, `title`, `description`, `action` | `empty.tsx` do shadcn |
| `HashAddress` | `value`, `chars`, `copy`, `href` | `formatShortHash`, mono |
| `DataTable` *(se sobrar)* | TanStack Table + `table.tsx` | shadcn pattern |

Convenções (herdadas do shadcn): função nomeada exportada, `className` mergeado com `cn`, variantes via `cva`, `data-slot`, sem `forwardRef` (React 19), props HTML espalhadas.

### Externos (via `shadcn add`)

- beUI (app): Digit Swap → dentro de `Money`/`Stat` (opcional, `animate` prop); Morphing Modal (checkout de aporte); Bottom Sheet (mobile); Theme Toggle; AI agent UI (`AnalystAiReport`).
- RareUI (landing somente): Liquid Wave/Metal (hero), Glass Shimmer Button (CTA), Floating Navigation (header público).

---

## 3. Estrutura de pastas (alvo)

```
src/
  app/                 App.tsx, providers.tsx, router.tsx (consome ROUTES), guards.tsx
  components/ui/       shadcn — não editar à mão além do tema
  components/          StatusBadge, Money, Rate, Stat, PageHeader, Section, EmptyState, HashAddress
  components/layout/   AppShell, PublicShell, AuthLayout, Sidebar, Header
  features/
    auth/   investor/   seller/   analyst/   admin/   duplicata/   offer/
      components/  hooks/  pages/
  domain/  services/  lib/  hooks/  styles/
  pages/__ds/          kitchen sink (só DEV)
```

Movimentação por `git mv` + codemod de imports `@/pages/*` → `@/features/*/pages/*`, `@/components/<perfil>/*` → `@/features/<perfil>/components/*`. Gate: `tsc -b`.

### Portado do neutrotham

- `lib/validators.ts`: `isValidCPF`, `isValidCNPJ`; `lib/mask.ts` ganha CEP e data.
- `services/export/csv.ts`: exportação genérica de listas (admin/analista).
- `app/router.tsx` com `lazy()` por página + `Suspense` + `ErrorBoundary` no topo.
- `components/layout/AuthLayout.tsx`.

---

## 4. Governança

- `DESIGN.md` (raiz): resumo humano das fundações, lido por Impeccable, Cursor e Claude.
- `PRODUCT.md` (raiz): quem usa, jobs, princípios, plataforma.
- `AGENTS.md` (raiz): fonte única de instruções para agentes; `CLAUDE.md` = `@AGENTS.md`. Mantém a decisão de 2026-05-20 (sem cópias em `.windsurf/.claude`).
- `.cursor/rules/60-design-system.mdc`: sem hex em `src/` fora de `components/ui`; status só via `StatusBadge`; R$ só via `Money`; espaçamento pelos primitivos; novo UI entra por `shadcn add`.
- Lint: script `npm run lint:ds` (grep) até o ESLint entrar; depois `eslint-plugin-tailwindcss` `no-arbitrary-value`.
- `/__ds`: só em `import.meta.env.DEV`.
