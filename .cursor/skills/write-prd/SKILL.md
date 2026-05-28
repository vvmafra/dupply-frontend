---
name: write-prd
description: >-
  Write a structured PRD for a dupply-frontend feature.
  Creates tasks/prd-{name}/prd.md following the project template.
  Use when: "write PRD for X", "create PRD for X", "prd X".
---

# write-prd

## When to use

Triggered by: "write PRD for X", "create PRD for X", "PRD for X"

Use this skill at the **start of every feature** — before writing any code, techspec, or tasks.

---

## Steps

### 1. Gather context

Before writing anything:

1. Read `.specs/codebase/ARCHITECTURE.md` — camadas, padrões, fluxos de dados.
2. Read `.specs/codebase/CONVENTIONS.md` — nomenclatura, exports, organização.
3. Read the relevant `.cursor/rules/` file for the area being affected:
   - `10-react-ts-frontend` — componentes, TypeScript
   - `20-routing-pages` — rotas, páginas
   - `30-auth-forms-onboarding` — auth, formulários
   - `40-services-mocks` — services, mocks
4. Ask for any missing information:
   - **Feature name** (kebab-case, e.g. `seller-duplicata-history`) — used for the folder name.
   - **Description** — what the feature does and why it's needed.
   - **Personas affected** — `seller`, `admin`, `riskAnalyst` or cross-cutting.
   - Any open business questions you cannot infer from existing docs.

### 2. Create the PRD file

Create `tasks/prd-{name}/prd.md` using the template below.

Fill in every section. If a section is unknown, mark it explicitly as **TBD** or **Open Question** — do not leave it blank or invent requirements.

### 3. Announce and suggest next step

After creating the file, tell the user:
- What was created and where.
- That the next step is `write-techspec` (`"write techspec for {name}"`).

---

## PRD template

```markdown
# Product Requirements Document — {Feature Title}

## Overview

One or two paragraphs. What is this feature? Why is it needed now?
Reference any relevant existing behavior this feature changes or extends.

## Goals

- Goal 1
- Goal 2

**Success metrics:**
- Metric 1 (e.g. "Seller can view full duplicata history without page reload")
- Metric 2

## User Stories

- As a {seller | admin | riskAnalyst}, I want to {action} so that {benefit}.
- As a {seller | admin | riskAnalyst}, I want to {action} so that {benefit}.

**Main flow:**
1. Step 1
2. Step 2
3. Step 3

## Core Features

1. **Feature name**
   - What it does: ...
   - Why it matters: ...

2. **Feature name**
   - What it does: ...
   - Why it matters: ...

## Functional Requirements

1. FR-1: ...
2. FR-2: ...
3. FR-3: ...

_(Use numbered IDs so techspec and tasks can reference them.)_

## Personas & Scope

- Personas affected: `seller` | `admin` | `riskAnalyst` | all
- Pages/routes touched: ...
- Integration with backend: yes (requires integration spec) | no (mock only)

## Technical Constraints

- No new external libraries unless justified.
- Must pass `npm run typecheck` with zero errors.
- Must preserve existing auth, profile selection and navigation flows.
- Must follow service adapter pattern (`resolveApiMode()`) if touching services.
- Details of component design will be defined in the Tech Spec.

## Out of Scope

- Item 1
- Item 2

## Open Questions

- Question 1 — who owns the answer?
- Question 2 — who owns the answer?
```

---

## Rules

- English only. No Portuguese in the PRD file.
- Functional requirements must be numbered (`FR-N`). TechSpec and task files will reference these IDs.
- Do not include implementation details (component names, file paths, code snippets) — that belongs in the TechSpec.
- Keep "Technical Constraints" at a product level only (no code).
- `tasks/prd-{name}/` folder must be created if it does not exist.
- If the feature requires backend integration, note it in "Personas & Scope" — a `write-integration-spec` should be created before or alongside the techspec, saved as `tasks/prd-{name}/integration-spec.md`.
