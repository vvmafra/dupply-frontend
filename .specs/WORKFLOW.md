# Dupply — Workflow de Desenvolvimento

**Última atualização:** 2026-05-21

Documento único que amarra **rules**, **specs** e **skill TLC**. Todo desenvolvimento novo segue este fluxo.

---

## Novo chat no Cursor — o que carregar

**Regra:** poucos arquivos, bem escolhidos. Não `@` tudo de uma vez.

### Sempre (qualquer tarefa)

```
@.specs/project/STATE.md
@.specs/WORKFLOW.md
```

`STATE.md` = decisões, blockers, handoff da última sessão.  
`WORKFLOW.md` = este doc (fluxo + checklists).

Rules em `.cursor/rules/` entram **automaticamente** no Cursor — não precisa `@`.

### Planejar ou retomar macro

```
@.specs/project/PROJECT.md
@.specs/project/ROADMAP.md
```

### Implementar feature em andamento

```
@.specs/features/[slug]/spec.md
@.specs/features/[slug]/tasks.md
```

Se existir: `@.specs/features/[slug]/design.md`

Exemplo hoje: `@.specs/features/api-integration/tasks.md`

### Tocar auth, services ou área frágil

```
@.specs/codebase/CONCERNS.md
```

### Só se precisar de detalhe brownfield (raro)

Um por vez, sob demanda: `ARCHITECTURE.md`, `CONVENTIONS.md`, `STACK.md` — em `.specs/codebase/`.

**Não carregar junto:** múltiplos `spec.md` de features diferentes.

### Frases de abertura (copiar/colar)

**Retomar trabalho:**
> Resume work. Contexto: @.specs/project/STATE.md @.specs/features/api-integration/tasks.md — continuar próxima task pendente.

**Quick fix:**
> Quick fix: [descrição]. @.specs/project/STATE.md

**Feature nova:**
> Specify feature [slug]. @.specs/project/PROJECT.md @.specs/project/ROADMAP.md

**Skill TLC:** instalada em `.cursor/skills/tlc-spec-driven/` — o agente usa quando o trigger bate (specify, implement, etc.). Não precisa `@` o SKILL.md no chat normal.

---

## Visão geral

```
PRD (negócio)  →  spec.md (Specify)  →  design.md (Design*)  →  tasks.md (Tasks*)  →  Execute  →  Validate
                         ↑                      ↑                      ↑
                   .cursor/rules/         CONCERNS.md            npm run typecheck
                   .specs/codebase/       TESTING.md
```

\* Design e Tasks são **opcionais** — profundidade auto-dimensionada (ver abaixo).

### Mapeamento de termos

| Você fala | Artefato | Fase TLC |
|-----------|----------|----------|
| PRD | `.specs/features/[x]/spec.md` | Specify |
| TECH SPEC | `.specs/features/[x]/design.md` | Design |
| Tasks | `.specs/features/[x]/tasks.md` | Tasks |
| Implementar | código + gate | Execute |
| Validar | checklist + typecheck | Validate |

---

## Auto-sizing (quando usar cada fase)

| Escopo | Exemplo | Specify | Design | Tasks | Execute |
|--------|---------|---------|--------|-------|---------|
| **Small** | fix typo, renomear package | — (quick mode) | — | — | direto |
| **Medium** | schema Zod duplicata | spec breve | inline | inline | sim |
| **Large** | integração API demo | spec completa | design | tasks | por task |
| **Complex** | wallet + passkey + policies | spec + discuss | design + research | tasks paralelas | UAT |

**Regras fixas:**

1. **Specify + Execute** — sempre (mesmo que Specify seja 5 linhas no chat)
2. **Design** — skip se não há decisão arquitetural
3. **Tasks** — skip se ≤3 passos óbvios; se ao listar passos virar >5, criar `tasks.md`
4. **Quick mode** — `.specs/quick/NNN-slug/TASK.md` para ≤3 arquivos

---

## Estrutura de arquivos

```
.specs/
├── WORKFLOW.md              ← este doc
├── project/
│   ├── PROJECT.md           ← visão, personas, arquitetura alvo
│   ├── ROADMAP.md           ← milestones e ondas
│   └── STATE.md             ← decisões, blockers, preferências
├── codebase/                ← brownfield (já mapeado)
│   └── CONCERNS.md          ← divergências rules ↔ código
├── features/
│   └── [feature-slug]/
│       ├── spec.md          ← PRD / requisitos (IDs rastreáveis)
│       ├── context.md       ← decisões de gray areas (se discuss)
│       ├── design.md        ← TECH SPEC (se Large/Complex)
│       └── tasks.md         ← breakdown atômico (se Large/Complex)
└── quick/
    └── NNN-slug/
        ├── TASK.md
        └── SUMMARY.md
```

---

## Checklist: antes de codar

1. Ler [PROJECT.md](./project/PROJECT.md) se feature nova ou ambígua
2. Ler [STATE.md](./project/STATE.md) — blockers/decisões recentes
3. Ler `.cursor/rules/` aplicáveis (globs da área tocada)
4. Se tocar área frágil → [CONCERNS.md](./codebase/CONCERNS.md)
5. Se feature Large+ → ler `spec.md` (+ `design.md` se existir)
6. Declarar escopo e tamanho (Small/Medium/Large)

---

## Checklist: antes de considerar done

- [ ] `npm run typecheck` passa
- [ ] Fluxos auth/perfil não quebrados (se tocados)
- [ ] UI em PT; paths em EN
- [ ] Regras de domínio em `domain/`, não inline na UI
- [ ] Rotas novas em `ROUTES` antes de usar
- [ ] Atualizar `tasks.md` / `spec.md` traceability (se existirem)
- [ ] Atualizar [CONCERNS.md](./codebase/CONCERNS.md) se corrigiu divergência
- [ ] Registrar decisão em [STATE.md](./project/STATE.md) se relevante

---

## Fluxo por tipo de trabalho

### Nova feature (Large — ex.: api-integration)

```
1. "Specify feature api-integration"  →  spec.md com IDs (API-01, AUTH-02...)
2. "Design feature api-integration"   →  design.md (client HTTP, adapters, env)
3. "Create tasks api-integration"     →  tasks.md com deps e gates
4. "Implement T1" ... "Implement Tn"  →  1 task por sessão
5. "Validate api-integration"         →  checklist P0/P1/P2 do ROADMAP
```

### Bug fix / ajuste pequeno (Quick mode)

```
1. Descrever problema (1 frase)
2. Listar passos atômicos inline (max 5)
3. Implementar + typecheck
4. SUMMARY.md em .specs/quick/ se quiser histórico
```

### Integração com backend (padrão Dupply)

```
1. Confirmar contrato REST (endpoint, DTO, auth)
2. Tipos em domain/ ou types dedicados
3. Service: função mock → HTTP mantendo assinatura pública
4. Env flag VITE_USE_MOCKS para fallback
5. Testar fluxo manualmente; documentar em tasks.md
```

### Wallet / passkey (padrão front-heavy)

```
1. spec.md: o que o user vê vs o que o back persiste
2. design.md: WalletContext, smart-account-kit config, wallet-api.ts
3. Front: createWallet/connectWallet
4. Back: POST /users/me/wallet { contractId, credentialId? }
5. Nunca orquestrar negócio duplicata via RPC direto no front
```

---

## Context loading (para agentes)

**Sempre carregar (~base):**

- [PROJECT.md](./project/PROJECT.md)
- [STATE.md](./project/STATE.md) (se existir decisão recente)

**Sob demanda:**

- [ROADMAP.md](./project/ROADMAP.md) — planejamento
- [CONCERNS.md](./codebase/CONCERNS.md) — risco/refactor
- [TESTING.md](./codebase/TESTING.md) — gates de teste
- Feature: `spec.md` → `design.md` → `tasks.md` (nunca múltiplas features juntas)

**Nunca carregar simultaneamente:** múltiplos `spec.md` de features diferentes.

---

## Skill e rules

| Fonte | Papel |
|-------|-------|
| `.cursor/rules/*.mdc` | **Como codar** — convenções, personas, padrões |
| `.specs/` | **O quê construir** — visão, features, dívida |
| Skill `tlc-spec-driven` | **Como planejar** — templates Specify/Design/Tasks/Execute |

Instalação skill: `.cursor/skills/tlc-spec-driven/` (fonte única; não duplicar em `.windsurf/` ou `.claude/` manualmente).

---

## Triggers úteis (frases para o agente)

| Intenção | Dizer |
|----------|-------|
| Nova feature | `Specify feature [slug]` |
| Tech spec | `Design feature [slug]` |
| Quebrar em tasks | `Create tasks [slug]` |
| Implementar | `Implement T3` ou `Execute task [slug]/T2` |
| Bug rápido | `Quick fix: [descrição]` |
| Pausar | `Pause work` → atualiza STATE.md |
| Retomar | `Resume work` → lê STATE.md + ROADMAP |

---

## Commits (quando solicitado)

- 1 commit atômico por task quando possível
- Mensagem focada no **porquê**
- Referenciar ID de requisito se existir: `feat(api): connect auth login (AUTH-01)`

---

## Referências

- [PROJECT.md](./project/PROJECT.md)
- [ROADMAP.md](./project/ROADMAP.md)
- [STATE.md](./project/STATE.md)
- Skill: `.cursor/skills/tlc-spec-driven/SKILL.md`
