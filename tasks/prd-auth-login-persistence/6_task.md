# Task 6.0: Migrate remaining literal route paths to ROUTES constants

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Complete FR-16 by replacing remaining hardcoded path strings in `App.tsx` (and adding missing helpers to `routes.ts` if needed). Guards and most routes already use `ROUTES.*`; this task closes the documented gaps in techspec Component design §9.

Depends on: none

## Requirements

- FR-16: All router paths must use centralized route constants — no duplicated literal path strings
- Add missing route helpers where referenced literals exist:
  - `ROUTES.analyst.sellers.detail(sellerId)`
  - `ROUTES.admin.sellers.detail(sellerId)`
- Use existing helpers where available (e.g. `ROUTES.analyst.duplicatas.detail(id)`, `ROUTES.confirmation(id)`)
- Legacy redirect paths (`/seller/receivables/*`) — add to `ROUTES` or document as intentional legacy aliases in code comment only if kept

## Subtasks

- [ ] 6.1 Read `src/lib/routes.ts` and `src/App.tsx` for literal path strings
- [ ] 6.2 Add missing `ROUTES` helpers for analyst/admin seller detail paths
- [ ] 6.3 Replace literals in `App.tsx` with `ROUTES.*` constants
- [ ] 6.4 Verify guards and navigation still resolve correctly (manual browser check)
- [ ] 6.5 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §9 App routing**.

| Literal | Target |
|---------|--------|
| `/confirmation/:id` | `ROUTES.confirmation(id)` |
| `/analyst/sellers/:sellerId` | `ROUTES.analyst.sellers.detail(sellerId)` |
| `/analyst/duplicatas/:id` | `ROUTES.analyst.duplicatas.detail(id)` |
| `/admin/sellers/:sellerId` | `ROUTES.admin.sellers.detail(sellerId)` |
| `/seller/receivables/*` | legacy redirects — add to ROUTES or keep with minimal comment |

Do not refactor unrelated routes. Match existing `ROUTES` nesting style in `routes.ts`.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] No new literal persona/dashboard paths in `App.tsx` (param routes use `ROUTES` helpers)
- [ ] Deep links to analyst/admin seller detail pages still work
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-auth-login-persistence/prd.md` ← read first
- `tasks/prd-auth-login-persistence/techspec.md` ← read first
- `src/lib/routes.ts` ← modify
- `src/App.tsx` ← modify
- `src/routes/guards.tsx` ← read (verify consistency)
