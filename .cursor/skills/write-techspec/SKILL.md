---
name: write-techspec
description: >-
  Write a tech spec from an existing PRD for dupply-frontend.
  Creates tasks/prd-{name}/techspec.md.
  Use when: "write techspec for X", "techspec for X", "tech spec X".
---

# write-techspec

## When to use

Triggered by: "write techspec for X", "techspec for X", "tech spec X"

Must run **after** `write-prd`. Requires `tasks/prd-{name}/prd.md` to exist.

If the PRD notes backend integration, check if `tasks/prd-{name}/integration-spec.md` exists (or `.specs/features/{domain}-integration.md` for standalone specs) — read it before writing component design.

---

## Steps

### 1. Read context

1. Read `tasks/prd-{name}/prd.md` — all sections, especially Functional Requirements.
2. Read `.specs/codebase/ARCHITECTURE.md` — camadas, padrões, fluxos.
3. Read `.specs/codebase/CONVENTIONS.md` — nomenclatura, exports, organização.
4. Read the relevant `.cursor/rules/` files for the areas affected.
5. If the feature touches services/integration: read `.specs/features/api-integration/design.md`.
6. If an integration spec exists: read `tasks/prd-{name}/integration-spec.md` first; fallback to `.specs/features/{domain}-integration.md`.
7. Explore the actual source files that will be changed:
   - Páginas em `src/pages/{persona}/` para a persona afetada.
   - Serviços em `src/services/` para o domínio afetado.
   - Tipos em `src/domain/` para o bounded context.
   - Componentes relevantes em `src/components/`.
8. Note existing patterns (naming, state management, error handling).

### 2. Write the TechSpec

Create `tasks/prd-{name}/techspec.md` using the template below.

Every Functional Requirement (`FR-N`) from the PRD must appear somewhere in the spec — either directly addressed in a component section or noted as not requiring a separate implementation note.

### 3. Announce and suggest next step

Tell the user what was created and that the next step is `create-tasks` (`"create tasks for {name}"`).

---

## TechSpec template

```markdown
# Tech Spec — {Feature Title}

## Overview

One paragraph. What is being implemented and what is NOT being implemented (scope boundary).
Reference PRD if useful. Note if this is mock-only or requires live HTTP integration.

---

## Architecture overview

Describe the layers touched and how they interact:

```
UI (pages/ + components/)
  └── consumes service functions + domain types
Services (services/*.ts)
  └── adapter: resolveApiMode() → mock impl | apiRequest()
Domain (domain/*/
  └── types, schemas Zod, helpers — no React, no services
Lib (lib/)
  └── api-client, env, routes, formatters
```

---

## Component design

### 1. {Component name}

**File:** `src/path/to/file.tsx`

What changes and why. Include concrete code snippets:

```tsx
// Before (if applicable)
// ...

// After
// ...
```

Justify non-obvious decisions.

### 2. {Component name}
...

---

## Data flow

```
User action (click / form submit)
  → Component handler
      → service function (services/*.ts)
          → mock impl (VITE_USE_MOCKS=true)
          → apiRequest() + DTO mapping (VITE_USE_MOCKS=false)
      → setState / toast / navigate
```

---

## Files changed

| File | Change type |
|------|-------------|
| `src/...` | Added / Modified / Deleted |

---

## Impact analysis

- **Auth/navigation:** does this break any guard, redirect or profile check?
- **Other personas:** does this change affect seller, analyst or admin beyond the target?
- **Service adapter:** is the mock-vs-HTTP gate correct and safe?
- **TypeScript:** any `any`, `as` casts or strict violations introduced?

---

## Test strategy

_(No automated test runner configured — describe manual verification steps.)_

### Manual — {scenario}

| Step | Expected result |
|------|-----------------|
| ... | ... |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| ... | ... |
```

---

## Rules

- English only.
- Every `FR-N` from the PRD must be traceable to at least one component section.
- Include exact file paths — no vague "somewhere in the service layer".
- Code snippets must compile against the project's TypeScript config (`strict`, `verbatimModuleSyntax`, ESM).
- Do not change the PRD. If you discover a conflict, note it in "Open questions resolved" and resolve it inline.
- `tasks/prd-{name}/` must already exist (created by `write-prd`).
- Services must follow the adapter pattern — never put `fetch` or `apiRequest` calls directly in pages or components.
- Domain types must not import React or services.
