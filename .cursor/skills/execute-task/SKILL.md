---
name: execute-task
description: >-
  Execute a single task file for dupply-frontend end-to-end.
  Reads PRD + techspec + N_task.md, implements, runs typecheck, marks done.
  Use when: "execute task N for X", "implement task N", "run task N for X".
---

# execute-task

## When to use

Triggered by: "execute task N for X", "implement task N for X", "run task N"

Must run **after** `create-tasks`. Requires `prd.md`, `techspec.md`, and `N_task.md` to exist.

---

## Steps

### 1. Load context (mandatory — do not skip)

1. **Read `tasks/prd-{name}/prd.md`** — goals, functional requirements, personas.
2. **Read `tasks/prd-{name}/techspec.md`** — architecture, component design, code snippets, data flow.
3. **Read `tasks/prd-{name}/{N}_task.md`** — requirements, subtasks, success criteria.
4. If the task touches services: **read `.specs/features/api-integration/design.md`** — adapter pattern, env flags.
5. If an integration spec is referenced: **read `tasks/prd-{name}/integration-spec.md`** first; fallback to `.specs/features/{domain}-integration.md` — endpoint contracts, DTO shapes.
6. Check dependencies: verify that all tasks listed in "Depends on" are marked `[x]` in `tasks.md`. If not, stop and notify the user.

### 2. Explore before editing

Before modifying any file:
- Read the files listed in "Relevant files" of the task.
- Understand existing patterns (naming conventions, import style, component structure, error handling).
- Do not invent patterns — follow what is already in `src/`.

### 3. Implement

Follow the techspec exactly. For each subtask in `N_task.md`:
- Implement the change.
- Follow the architecture constraints:
  - `domain/` → no React, no service imports, no `import.meta.env`.
  - `services/` → adapter pattern only; bifurcate with `resolveApiMode()` / `env.useMocks`; never call `fetch` directly.
  - `pages/` and `components/` → consume services and domain types; never call `apiRequest` directly.
  - New env vars → add to `.env.example` with a comment.
  - Import style → use `@/` alias; `import type` for type-only imports (`verbatimModuleSyntax`).

### 4. Verify

Run typecheck:

```bash
npm run typecheck
```

Fix any errors before proceeding. If a pre-existing error is unrelated to this task, note it in the evidence file but do not fix it (to keep the diff clean).

### 5. Mark done and create evidence

1. Mark the task `[x]` in `tasks/prd-{name}/tasks.md`.
2. Create `tasks/prd-{name}/{N}_validation-evidence.md`:

```markdown
# Validation evidence — Task {N}.0: {Title}

## Changes made

- File 1: what changed and why
- File 2: what changed and why

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] Criterion 1 — how verified
- [x] Criterion 2 — how verified

## Notes

Any deviations from the techspec and why.
```

### 6. Announce

Tell the user:
- What was implemented.
- Typecheck result.
- Next task to run (or that all tasks are complete).

---

## Rules

- Never skip step 1 (reading PRD + techspec). The `<critical>` tag in task files is a hard requirement.
- Do not implement more than the task scope — if you notice a gap, note it in the validation evidence under "Notes" and stop.
- If a techspec decision conflicts with reality (e.g. a component has a different structure than expected), implement the correct approach and document the deviation in the evidence file.
- Always run `npm run typecheck` before marking a task done.
- Never put `fetch` or `apiRequest` calls in pages or components — only in `services/`.
- Never import services from `domain/` — domain is a pure layer.
- Do not commit code — the user drives git (use the `commit` skill for that).
