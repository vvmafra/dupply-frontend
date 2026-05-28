---
name: create-tasks
description: >-
  Break a techspec into atomic task files for dupply-frontend.
  Creates tasks/prd-{name}/tasks.md and N_task.md files.
  Use when: "create tasks for X", "break down tasks for X", "tasks for X".
---

# create-tasks

## When to use

Triggered by: "create tasks for X", "break down tasks for X", "tasks for X"

Must run **after** `write-techspec`. Requires both `prd.md` and `techspec.md` to exist.

---

## Steps

### 1. Read context

1. Read `tasks/prd-{name}/prd.md` — functional requirements, scope, personas.
2. Read `tasks/prd-{name}/techspec.md` — components, files changed, data flow.
3. If integration spec referenced: read `tasks/prd-{name}/integration-spec.md` first; fallback to `.specs/features/{domain}-integration.md`.
4. Identify natural task boundaries:
   - One task per logical unit of change (one page, one service adapter, one domain type, one component, one route).
   - Typecheck verification belongs inside the last task — not as a separate task.
   - Tasks must be ordered so that dependencies come first (domain types before services, services before pages).

### 2. Create `tasks.md`

Create `tasks/prd-{name}/tasks.md`:

```markdown
# Tasks — {Feature Title}

## Tasks

- [ ] 1.0 {Short description}
- [ ] 2.0 {Short description}
- [ ] 3.0 {Short description}
```

Keep descriptions short (one line). Status is tracked here as `[ ]` (pending) or `[x]` (done).

### 3. Create individual `N_task.md` files

For each task, create `tasks/prd-{name}/N_task.md` using the template below.

Number tasks starting at `1`. Use decimal subtasks if needed (`1.1`, `1.2`, ...).

### 4. Announce

Tell the user how many tasks were created and that execution starts with `"execute task 1 for {name}"`.

---

## N_task.md template

```markdown
# Task {N}.0: {Short title}

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

One paragraph. What this task implements and why. Which component from the techspec does it correspond to?

Depends on: _(task numbers this task depends on, or "none")_

## Requirements

- Requirement 1 (reference `FR-N` from PRD or techspec section)
- Requirement 2
- Requirement 3

## Subtasks

- [ ] {N}.1 Read {file} to understand existing pattern
- [ ] {N}.2 Implement {thing}
- [ ] {N}.3 Verify component renders correctly (manual browser check)
- [ ] {N}.4 Run `npm run typecheck` — 0 errors

## Implementation details

Reference the relevant section from `techspec.md` by name. Include any non-obvious constraints
or decisions that must be respected. Copy code snippets from the techspec if helpful.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] {Specific behavior assertion 1}
- [ ] {Specific behavior assertion 2}
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-{name}/prd.md` ← read first
- `tasks/prd-{name}/techspec.md` ← read first
- `src/path/to/file.tsx` ← modify
- `src/services/service.ts` ← modify (if applicable)
- `src/domain/context/types.ts` ← modify (if applicable)
```

---

## Rules

- English only.
- Tasks must be **atomic**: each task should be completable independently once its dependencies are done.
- Dependency order: domain types → service adapters → hooks → pages/components.
- Every `FR-N` from the PRD must be covered by at least one task.
- Tasks must be ordered by dependency — never reference a task number that comes after in the list.
- The `<critical>` tag must appear verbatim in every `N_task.md` — it forces the executing agent to read context before coding.
- Do not exceed ~8 tasks per feature. If you need more, split the feature into sub-features with separate PRDs.
- No "write tests" standalone task — no automated test runner is configured. Verification is `npm run typecheck` + manual browser check.
