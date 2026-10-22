# Design System Dupply — Specification

**Feature slug:** `design-system`  
**Status:** In Progress — 2026-10-21  
**Prioridade:** Base visual e de componentes para a versão de sexta (23/10) e para tudo que vier depois  
**Depende de:** stack atual (`feat/demo-local`): Vite 7 · React 19 · Tailwind 4 · shadcn new-york · react-router 7

---

## Problem Statement

O front já tem o stack certo e 56 primitivos do shadcn, mas **não tem um sistema**:

- Marca desalinhada do logo: `--primary` é um azul genérico do template; `--dupply-brand-blue: #2F6BFF` e o navy não existem no logo (azul `#0192FE → #064DCD`, ciano `#0FCBF4 → menta `#52EDBA`).
- 66 hex hardcoded em `src/` (55 na `LandingPage`, 6 em `dupplyTopbar.styles.ts`), 17× `text-[#7C8594]`, 40× `text-[10px]`.
- Status com cor inventada por tela: `ReceivableStatusBadge` isolado + 13 `<Badge className="bg-…">` ad hoc.
- KPI/valor monetário montado em ~20 arquivos sem componente.
- Nenhuma fundação documentada (tipografia, espaçamento, motion, elevação) e nenhuma regra que impeça regressão.
- Inter sem `tabular-nums`: colunas de dinheiro não alinham.

Referência de ritmo visual e de fluxos: `neutrotham-frontend` (Hous3). Referência de produto: Liqi. Componentes externos: shadcn, beUI (app), RareUI (landing).

---

## Goals

- [ ] Tokens em 3 níveis (primitivo → semântico → componente) alinhados ao logo, light **e** dark, contraste AA verificado
- [ ] Componentes de produto: `StatusBadge`, `Money`, `Rate`, `Stat`, `PageHeader`, `Section`, `EmptyState`, `HashAddress`
- [ ] Vocabulário único de status por entidade com mapa de cor fixo (ver inventário abaixo)
- [ ] Rota interna `/__ds` (kitchen sink) para aprovar e consultar o sistema
- [ ] `DESIGN.md`, `PRODUCT.md`, `AGENTS.md` na raiz + `.cursor/rules/60-design-system.mdc` + lint anti-hex
- [ ] Landing e topbar sem hex, com 2–3 componentes beUI/RareUI e `prefers-reduced-motion`
- [ ] 31 páginas usando os componentes do sistema (codemod + revisão por perfil)
- [ ] Estrutura `src/app` + `src/features/<domínio>`; utils escaláveis portados do neutrotham

---

## Out of Scope (até sexta)

| Item | Motivo |
|------|--------|
| Storybook, Chromatic / visual regression automatizado | Semana seguinte; `/__ds` + screenshots cobrem a demo |
| Vitest / Playwright E2E / CI | Já em Deferred no STATE.md |
| Monorepo (`packages/ui`) | Só faz sentido com segundo app |
| Troca de fonte (Inter → Geist/Manrope) | Uma linha, mas decisão visual pendente |
| i18n | Produto pt-BR por ora |
| Redesenho de fluxos | Este trabalho é visual/estrutural, não muda regra de negócio |
| Separar `offer` de `ReceivableStage` em entidade própria | Decisão de domínio futura (Victor, 2026-10-21) |

---

## Inventário de status (extraído do código — corrigir aqui)

Legenda de cor: **info** azul · **warning** âmbar · **success** esmeralda · **destructive** coral · **neutral** cinza · **ai** violeta.

### Duplicata — análise do analista (`DuplicataAnaliseAnalista`)

| Valor | Label atual | Cor proposta |
|---|---|---|
| `pendente` | Pendente | warning |
| `for_approval` | Para aprovação | info |
| `aprovado` | Aprovado(a) | success |
| `reprovado` | Reprovado(a) | destructive |

### Duplicata — aceite do sacado (`DuplicataAceiteSacado`)

| Valor | Label | Cor |
|---|---|---|
| `pendente` | Pendente (de aceite) | warning |
| `aceito` | Aceito (pelo sacado) | success |
| `recusado` | Recusado (pelo sacado) | destructive |

### Receivable — stage do backend (`ReceivableStage`, HTTP)

| Valor | Label | Cor |
|---|---|---|
| `created` | Rascunho | neutral |
| `under_review` | Em análise | warning |
| `reproved` | Reprovada | destructive |
| `offer` | Proposta enviada | info — *vira entidade própria no futuro* |
| `rejected` | Recusada pelo cedente | destructive |
| `confirmed` | Aceita pelo cedente | success |
| `funding` | Em captação | info |
| `funded` | Captada | success |
| `processing` | Em processamento | info |
| `completed` | Concluída | success |
| `payer_settled` | Liquidada pelo sacado | success |
| `overdue` | Em atraso | destructive |

### Receivable — legado admin (`ReceivableStatus`) — marcado como deprecated no CONCERNS

| Valor | Label | Cor |
|---|---|---|
| `DRAFT` | Rascunho | neutral |
| `UNDER_REVIEW` | Em análise | warning |
| `APPROVED` | Aprovado | success |
| `LISTED` | Listado | info |
| `FUNDED` | Financiado | success |
| `SETTLED` | Liquidado | success |
| `DEFAULTED` | Inadimplente | destructive |

### Oferta (`OfferStatus`) e Aporte (`InvestmentStatus`)

| Entidade | Valor | Label | Cor |
|---|---|---|---|
| Oferta | `fundraising` | Em captação | info |
| Oferta | `failed` | Não captada | destructive |
| Oferta | `disbursed` | Desembolsada | success |
| Aporte | `active` | Ativo | info |
| Aporte | `refunded` | Estornado | warning |
| Aporte | `settled` | Liquidado | success |

### Cadastro de cedente (`ValidationStatus`) e acesso a duplicatas (`AnalystDuplicatasAccessStatus`)

| Entidade | Valor | Label (proposta — não há mapa hoje) | Cor |
|---|---|---|---|
| Cadastro | `NOT_STARTED` | Não iniciado | neutral |
| Cadastro | `DOCUMENTS_PENDING` | Documentos pendentes | warning |
| Cadastro | `KYC_PENDING` | KYC pendente | warning |
| Cadastro | `UNDER_REVIEW` | Em análise | warning |
| Cadastro | `APPROVED` | Aprovado | success |
| Cadastro | `REJECTED` | Rejeitado | destructive |
| Acesso | `PENDING` / `UNDER_REVIEW` / `APPROVED` / `REJECTED` | Pendente / Em análise / Aprovado / Rejeitado | warning / warning / success / destructive |

### KYC investidor (`InvestorKycStatus`), Documento (`DocumentStatus`), Transação on-chain (`BlockchainTransactionStatus`)

| Entidade | Valor | Label | Cor |
|---|---|---|---|
| KYC | `PENDING` | Pendente | warning |
| KYC | `IN_PROGRESS` | Em análise | warning |
| KYC | `APPROVED` | Aprovado | success |
| KYC | `REJECTED` | Rejeitado | destructive |
| Documento | `PENDING` | Pendente | neutral |
| Documento | `UPLOADED` | Enviado | info |
| Documento | `UNDER_REVIEW` | Em análise | warning |
| Documento | `APPROVED` | Aprovado | success |
| Documento | `REJECTED` | Rejeitado | destructive |
| Tx | `PENDING` | Pendente | warning |
| Tx | `SUCCESS` | Confirmada | success |
| Tx | `FAILED` | Falhou | destructive |

### Risco (`RiskLevel`, dois enums: `low/medium/high` e `LOW/MEDIUM/HIGH`)

| Valor | Label | Cor |
|---|---|---|
| baixo | Baixo | success |
| médio | Médio | warning |
| alto | Alto | destructive |

**Observações para correção:**
1. "Rejeitado" (KYC/documento/cadastro) vs "Recusado" (sacado/cedente) vs "Reprovado" (analista): três verbos para "não". Manter os três porque são atores diferentes, ou unificar?
2. `RiskLevel` existe em dois casings. O `StatusBadge` aceita os dois; unificar fica para a deprecação de receivables.
3. Conteúdo gerado pelo agente de IA (laudo, score) usa a cor **ai** (violeta), não é status.

---

## Success Criteria

- `grep -rE '#[0-9a-fA-F]{6}' src --include='*.tsx' --include='*.ts' | grep -v components/ui/` → 0 resultados
- Nenhum `text-[#…]` nem `text-[10px]` fora de `components/ui/`
- Todo status renderizado via `StatusBadge`; todo valor em R$ via `Money`
- `/__ds` renderiza tudo em light e dark; contraste AA nos pares texto/fundo dos tokens semânticos
- `npm run typecheck` e `npm run build` verdes; screenshots antes/depois em `.specs/features/design-system/screenshots/`
