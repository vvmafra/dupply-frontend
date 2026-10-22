# DESIGN.md — Dupply

Sistema visual da Dupply em uma página. A fonte dos valores é `src/index.css` (semânticos) e `src/styles/palette.css` (primitivos, gerado de `scripts/brand/ramps.json`). O manual de marca completo está em `public/brand/dupply-brand-book.pdf`.

## Identidade

Fintech brasileira de antecipação de duplicatas com análise de risco por agente de IA e liquidação on-chain. A interface precisa transmitir **crédito sério, sem cara de banco**: densa onde há dinheiro, calma no resto. Marca azul; o gradiente ciano→menta do símbolo aparece uma vez por tela, no máximo.

## Cor

Regra: **azul = ação · verde/âmbar/coral = status · violeta = IA · ciano/menta = marca.** Uma cor com dois papéis na mesma tela está errada.

| Token | Light | Dark | Uso |
|---|---|---|---|
| `primary` | `#0060DE` | `#0192FE` (logo) | botão principal, link, foco, seleção |
| `success` | emerald-600 | emerald-400 | aprovado, liquidado, pago |
| `warning` | amber-600 | amber-400 | pendente, em análise, vencimento próximo |
| `destructive` | coral-600 | coral-500 | recusado, vencido, erro, ação irreversível |
| `info` | blue-600 | blue-400 | em captação, em andamento |
| `ai` | violet-600 | violet-400 | só saída do agente de IA |
| `background` / `card` / `border` | neutral-50 / branco / neutral-200 | ink-950 / ink-900 / branco 10% | 85% da interface |
| `navy` `#0B1F3B` | — | — | fundo das páginas públicas e capas; nunca texto ou botão |

Badges de status usam o par **ramp-100 fundo / ramp-700 texto** no claro e **ramp-900 / ramp-300** no escuro, sempre via `StatusBadge`. Gradientes: `var(--gradient-brand)` e `var(--gradient-brand-accent)`.

Contraste: todos os pares acima têm ≥ 4,5:1 (AA). O azul claro do logo `#0192FE` dá 3,2:1 com branco, por isso não é cor de botão no claro.

Ramps disponíveis (50–950): `blue`, `cyan`, `mint`, `violet`, `emerald`, `amber`, `coral`, `neutral` (cinza frio na matiz do azul). As famílias padrão do Tailwind foram desligadas; `slate/zinc/gray → neutral`, `indigo → violet`, `red/rose → coral`, `green → emerald`, `sky → blue`, `teal → cyan` existem só como alias até o codemod.

## Tipografia

Só **Inter**. `cv11` e `ss01` ligados. Corpo 14/1.5 (`text-sm`), rótulo 12 (`text-xs`) peso 500, meta 10 (`text-2xs`), título de página 24–30 peso 600 com `tracking-tight`, KPI 24 peso 700. Valores, taxas, datas e IDs com a utility `numeric` (algarismos tabulares). Hash e endereço em `font-mono`. Sem caixa alta em rótulos.

## Espaço, forma, elevação

Base 4 px. Card `p-6` (compacto `p-4`), grid `gap-4`, seções `space-y-6`, dentro de seção `space-y-2`. Página: `max-w-7xl mx-auto px-4 md:px-6`, `PageHeader` com `mb-6`. Radius `--radius: 0.625rem`; pílula só em badge. Claro: `shadow-xs` em card. Escuro: sem sombra, borda de 1 px.

## Motion

`--duration-fast 120ms`, `--duration-base 200ms`, `--duration-slow 320ms`; easings `ease-standard` e `ease-emphasized`. Anima entrada, estado e número; não anima layout de tabela. `prefers-reduced-motion` é respeitado globalmente. Efeitos de marca (hero animado, contador) só na landing.

## Ícones

Lucide. `size-4` em texto e botão, `size-5` em navegação. Ícone sozinho sempre com `aria-label`.

## Componentes

Primitivos: shadcn (`src/components/ui`, não editar além do tema; novos entram por `npx shadcn add`, inclusive `@beui/*`). Produto: `StatusBadge`, `Money`, `Rate`, `Stat`, `PageHeader`, `Section`, `EmptyState`, `HashAddress` em `src/components/`. Catálogo vivo em `/__ds` (apenas em DEV).

## Proibido

Hex em `src/` fora de `components/ui`; `text-[#…]`, `text-[10px]`; status com cor inventada; valor em R$ sem `Money`; gradiente da marca em botão ou status; Inter trocada por outra fonte; sombra ou contorno no símbolo.
