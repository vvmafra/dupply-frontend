# Task 8.0: Update money Cursor rule and run final verification

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Update the frontend Cursor rule for monetary conventions to reflect backend receivable v2 (reais numbers on API, not centavos strings), then run final typecheck and manual verification checklist across seller and analyst flows. Corresponds to techspec Component design §20 and integration-spec Monetary convention.

Depends on: 7.0

## Requirements

- FR-20: Document that receivable API boundary uses reais numbers (aligned with backend v2)
- FR-21: Update `.cursor/rules/45-money-values.mdc` with receivable vs seller conventions
- All FRs: Final grep and typecheck confirm integration complete

## Subtasks

- [ ] 8.1 Read `.cursor/rules/45-money-values.mdc` and integration-spec Monetary convention
- [ ] 8.2 Update Cursor rule: receivable routes use reais `number`; remove stale centavos-string examples if unused
- [ ] 8.3 Run `npm run typecheck` — 0 errors
- [ ] 8.4 Grep: no `duplicata` imports in seller/analyst active paths
- [ ] 8.5 Manual browser verification per techspec Test strategy (seller draft/submit, analyst offer/reprove, seller offer response, errors)
- [ ] 8.6 Mark all tasks complete in `tasks.md`

## Implementation details

Reference **techspec.md → Component design §20**, **Test strategy**, and **integration-spec.md → Monetary convention**.

**45-money-values.mdc updates:**

| Module | API transport | UI |
|--------|---------------|-----|
| Seller routes | reais `number` | reais |
| Receivable routes | reais `number` (backend v2) | reais via `formatCurrencyBRL` |
| DB storage | centavos (server-side only) | — |

Remove or deprecate `toReceivableCents` / `formatReceivableMoneyString` examples if no longer referenced.

**Manual verification checklist** (from techspec Test strategy):

| Flow | Key assertion |
|------|---------------|
| Seller draft save | POST/PATCH → toast → **Rascunho** in list |
| Seller submit (with draft) | POST `.../submit` → **Em análise** |
| Seller submit (no prior save) | POST `/v1/receivables/submit` → single toast → **Em análise** |
| Edit locked receivable | Read-only form; `metadata_locked` on PATCH attempt |
| Analyst offer | Discount % → **Proposta em aberto** |
| Analyst reprove | **Reprovada** |
| Seller accept offer | **Em análise do sacado** |
| Seller reject offer | **Proposta recusada** |
| Inactive seller create | `seller_not_active` toast |
| Incomplete submit | `incomplete_metadata` toast |

**Final grep:**

```bash
rg "duplicata" src/pages/seller src/pages/analyst src/components/seller src/components/analyst src/components/forms src/services
```

Expected: zero matches (except possibly comments — remove those too).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Cursor rule documents receivable API as reais numbers
- [ ] No remaining `duplicata` imports in seller/analyst active code
- [ ] Manual flows verified against backend (or documented blockers if backend unavailable)
- [ ] All items in `tasks.md` marked `[x]`
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `tasks/prd-receivables-integration/tasks.md` ← mark complete
- `.cursor/rules/45-money-values.mdc` ← modify
