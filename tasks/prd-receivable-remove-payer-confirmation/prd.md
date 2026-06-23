# Product Requirements Document — Remove Payer Confirmation Gate (Frontend)

**Status:** Draft  
**Backend PRD:** `dupply-backend/tasks/prd-receivable-remove-payer-confirmation/prd.md` (implemented)  
**Amends:** `tasks/prd-receivables-integration/prd.md` (seller/analyst receivable slice)

## Overview

The backend receivable module v2 has removed the payer confirmation gate. When a seller accepts an analyst offer, the receivable now transitions directly `offer → confirmed` instead of `offer → approved`, and the payer no longer needs to act via magic link to unblock settlement. The backend also retires `approved` and `payer_rejected` from the active status machine, deprecates `POST /v1/payers/magic-link/respond` (410 Gone), and migrates in-flight `approved` rows to `confirmed`.

The frontend receivables integration (`prd-receivables-integration`) was built against the **old** lifecycle: seller accept showed **Em análise do sacado** (`approved`), and the payer confirmation page (`ConfirmationPage`) was explicitly deferred. That mismatch is now visible in HTTP mode — toasts, dashboard metrics, status badges, and the legacy confirmation route still describe a blocking payer step that no longer exists on the API.

This feature aligns seller and risk-analyst receivable UI with the simplified 10-status backend machine, treats retired statuses as read-only legacy values where historical rows may still appear, and removes or deprecates payer self-service confirmation UX so users are not misled about what happens after seller acceptance.

## Goals

- Reflect the new lifecycle in all seller and analyst receivable surfaces: seller accept → `confirmed`, not `approved`.
- Remove UX copy that implies the operation waits on payer action before proceeding.
- Display post-`confirmed` settlement statuses (`processing`, `completed`, `payer_settled`, `overdue`) with correct Portuguese labels when they appear on list/detail — display only; no platform actions in this slice.
- Handle legacy backend status strings (`approved`, `payer_rejected`) gracefully on read paths without treating them as active workflow states.
- Deprecate or remove the payer magic-link confirmation page and its mock-only service dependencies from active product flows.

**Success metrics:**

- In HTTP mode, after seller accepts an offer, list/detail badges show **Confirmada** (`confirmed`), not **Em análise do sacado** (`approved`).
- Seller success toast after accept describes confirmation / next settlement stage, not payer review.
- Dashboard “Aprovadas” (or renamed equivalent) counts receivables in post-offer success path using `confirmed` and downstream statuses, not `approved`.
- No seller or analyst screen instructs the user to wait for payer link confirmation to unblock the operation.
- `ConfirmationPage` no longer presents an actionable payer confirmation flow tied to lifecycle transitions.
- `npm run typecheck` passes with updated domain types aligned to the backend contract.
- Product docs for receivables integration are amended to reference the 10-status lifecycle.

## User Stories

- As a **seller**, I want accepting an analyst offer to show that my receivable is confirmed and proceeding to liquidation so that I am not left waiting for payer action that no longer exists.
- As a **seller**, I want accurate status badges and dashboard counts after acceptance so that I understand where my operation stands.
- As a **risk analyst**, I want receivable detail and list views to show `confirmed` (and later settlement statuses) after seller acceptance so that I know the deal is no longer blocked on payer confirmation.
- As a **seller or analyst viewing historical data**, I want legacy statuses (`approved`, `payer_rejected`) to remain readable with clear labels if the API still returns them, without offering actions that the backend no longer supports.
- As a **product operator**, I want deprecated payer confirmation links to fail gracefully or show a clear deprecation message instead of a broken mock flow.

**Main flow (aligned with backend):**

1. Seller creates draft → submits → `under_review`.
2. Risk analyst sends offer → `offer`.
3. Seller accepts or rejects via seller decision:
   - accept → `confirmed`
   - reject → `rejected`
4. Backend notifies payer informatively (email — no frontend action required in this feature).
5. Platform advances `confirmed → processing → completed → payer_settled | overdue` via internal/system routes — frontend displays status changes only when polling/list refresh returns updated rows.

## Core Features

1. **Status vocabulary realignment**
   - What it does: Updates domain types, DTO unions, label maps, and badge styling so the active receivable statuses match the backend 10-status machine; demotes `approved` and `payer_rejected` to legacy/read-only display values.
   - Why it matters: Prevents TypeScript and UI drift from the API contract; avoids showing a retired intermediate state as the expected post-accept outcome.

2. **Seller accept feedback**
   - What it does: Updates post-accept toast copy, offer wizard context (if any payer-wait messaging exists), and list refresh behavior so the seller immediately sees `confirmed`.
   - Why it matters: The current toast (“segue para análise do sacado”) contradicts backend behavior and confuses users testing the flow.

3. **Dashboard and list metrics**
   - What it does: Revises seller dashboard receivable summary buckets so “successful / in progress” counts use `confirmed` and settlement statuses instead of `approved`; keeps terminal failure buckets accurate for `rejected`, `reproved`, and legacy `payer_rejected`.
   - Why it matters: Metrics currently double-count or reference a status that no longer occurs on new receivables.

4. **Legacy status display**
   - What it does: When GET responses include `approved` (pre-migration cache or historical row) or `payer_rejected`, render a distinct legacy label/badge without seller/analyst actions; map migrated semantics where product agrees (`approved` → same visual treatment as `confirmed` or explicit legacy label — see Open Questions).
   - Why it matters: Backend keeps historical strings readable (OQ-3); frontend must not crash or show wrong next-step guidance.

5. **Deprecate payer confirmation page**
   - What it does: Retires `ConfirmationPage` as an active payer gate — remove route, replace with deprecation/404-style public message, or redirect — and stop linking to it from product flows; remove or isolate legacy EN mock service usage (`receivables.service.ts` / `confirmDebtorAwareness`) from receivable integration paths.
   - Why it matters: The backend returns 410 on magic-link respond; the current page uses mocks and implies payer action drives status, which is false.

6. **Documentation amendment**
   - What it does: Updates receivables-integration references (status table, main flow diagram, success metrics) to the simplified lifecycle so future tasks do not reintroduce payer-gate assumptions.
   - Why it matters: `prd-receivables-integration` is the parent spec; it still documents `offer → approved` and deferred payer confirmation.

## Functional Requirements

### Status model and labels

1. **FR-1:** Active receivable status types in the HTTP integration path must align with the backend 10-status machine: `created`, `under_review`, `reproved`, `offer`, `rejected`, `confirmed`, `processing`, `completed`, `payer_settled`, `overdue`.

2. **FR-2:** `approved` and `payer_rejected` must be treated as **legacy read-only** status values in domain/DTO typing (not part of the active transition set). UI must render them when returned by GET but must not expose actions that assume payer confirmation or `approved → confirmed` transitions.

3. **FR-3:** Update Portuguese status labels for the active machine. Minimum required mappings:

   | Backend status | UI label (PT) |
   |----------------|---------------|
   | `created` | Rascunho |
   | `under_review` | Em análise |
   | `offer` | Proposta em aberto |
   | `reproved` | Reprovada |
   | `rejected` | Proposta recusada |
   | `confirmed` | Confirmada |
   | `processing` | Transação em andamento |
   | `completed` | Transação completa |
   | `payer_settled` | Liquidada |
   | `overdue` | Em atraso |

4. **FR-4:** Legacy status labels (read-only):

   | Backend status | UI label (PT) |
   |----------------|---------------|
   | `approved` | *(legacy — see OQ-1)* |
   | `payer_rejected` | Recusada pelo sacado *(legacy)* |

5. **FR-5:** Badge color/styling must distinguish `confirmed` and settlement statuses from terminal failure statuses (`rejected`, `reproved`, legacy `payer_rejected`). Remove styling that presents `approved` as the primary post-accept success state.

### Seller flows

6. **FR-6:** After successful seller accept (`POST .../seller-decision` with `decision: "accept"`), refreshed list/detail must show status `confirmed`.

7. **FR-7:** Seller success toast after accept must not state or imply that the receivable is waiting for payer review or magic-link confirmation. Copy must reflect confirmation and forward progress (wording finalized in Tech Spec / UX review).

8. **FR-8:** Seller offer response wizard remains available only when `status = offer`; no new seller actions are required for `confirmed` or settlement statuses in this feature.

9. **FR-9:** Seller dashboard receivable summary metrics must count post-accept in-progress receivables using `confirmed`, `processing`, `completed`, and `payer_settled` — not `approved`. Terminal failure counts must include `rejected`, `reproved`, and legacy `payer_rejected` where applicable.

### Analyst flows

10. **FR-10:** Analyst list and detail views must display `confirmed` and downstream settlement statuses with correct labels when returned by the API; no analyst actions change for this feature beyond accurate display.

11. **FR-11:** Analyst offer/reprove actions remain gated on `under_review` / `offer` as today; analyst UI must not reference payer confirmation as a blocking step after seller accept.

### Payer confirmation deprecation

12. **FR-12:** The public payer confirmation route (`/confirmation/:id`) must not offer a mock or broken “confirm awareness” action that mutates receivable state. Acceptable outcomes: remove route, show static deprecation message aligned with backend `payer_confirmation_removed`, or redirect to a neutral public page — decision in Open Questions.

13. **FR-13:** No seller or analyst flow may link to payer confirmation as a required next step after seller accept.

14. **FR-14:** Legacy EN mock receivable service used exclusively by payer confirmation must not remain on the critical path for seller/analyst HTTP integration.

### Integration and quality

15. **FR-15:** Changes must work in HTTP mode (`VITE_USE_MOCKS=false` + configured `VITE_API_BASE_URL`). Mock mode behavior for receivables may remain unchanged or be updated for consistency — prefer updating legacy mocks only if needed to avoid contradictory demo data; detail in Tech Spec.

16. **FR-16:** `npm run typecheck` must pass with zero errors after type union updates.

17. **FR-17:** Amend `tasks/prd-receivables-integration/prd.md` status table, main flow, and success metrics to the 10-status lifecycle (or add explicit cross-reference to this PRD as superseding those sections).

## Personas & Scope

- **Personas affected:** `seller`, `riskAnalyst` (primary); `admin` only if admin receivable list displays the same status badges (secondary — display-only alignment if touched)
- **Pages/routes touched:**
  - Seller: receivables list, dashboard summary/preview, offer wizard feedback (toast)
  - Analyst: receivables list, detail (display-only for new statuses)
  - Public: payer confirmation route (deprecation/removal)
- **Integration with backend:** yes — requires `integration-spec.md` (delta on status contract and deprecated payer route) and `techspec.md`
- **Backend dependency:** backend PRD `remove-payer-confirmation` must be deployed (seller-decision accept → `confirmed`; magic-link respond → 410). No new backend endpoints required for this frontend slice.

## Technical Constraints

- No new external libraries unless justified.
- Must pass `npm run typecheck` with zero errors.
- Must preserve existing auth, profile selection, and seller/analyst navigation flows.
- Must follow the existing receivable service adapter pattern; pages must not call HTTP directly.
- Settlement advancement (`confirmed → processing → …`) remains backend-internal — no new admin/platform action UI in this feature.
- Payer email notification is backend-only (Module 4); no payer inbox or notification UI in this slice.
- Component/file-level design belongs in the Tech Spec, not this PRD.

## Out of Scope

- Payer self-service portal, magic-link landing pages with real token validation, or email template copy.
- Platform settlement triggers in the UI (internal API routes / workers).
- On-chain registry or tokenization UI (Module 7).
- Admin receivable management HTTP integration (legacy admin tables remain as-is unless a minimal badge label fix is trivial — not a goal of this PRD).
- Re-enabling payer confirmation via feature flag.
- Automated browser E2E tests (may be added in Tech Spec task list if desired).
- Backend API or migration changes (already shipped in backend PRD).

## Open Questions

- **OQ-1:** Legacy `approved` label — show **Confirmada** (treat as equivalent after migration) vs retain **Em análise do sacado** with a “legacy” hint vs a single new label (e.g. “Confirmada (legado)”). **Owner:** product + design.

- **OQ-2:** `ConfirmationPage` deprecation strategy — remove route entirely vs keep URL with static “confirmation no longer required” message (mirrors backend 410 narrative) vs redirect to marketing home. **Owner:** product.

- **OQ-3:** Rename seller dashboard metric **Aprovadas** to **Confirmadas** / **Em andamento** to avoid confusion with retired `approved` status. **Owner:** product + design.

- **OQ-4:** Should mock mode receivable fixtures be updated to the new lifecycle for demo consistency, or left unchanged with a documented exception? **Owner:** frontend lead.

- **OQ-5:** Admin receivable list (`AdminReceivablesPage`) still uses legacy EN demo model — include minimal legacy badge alignment in this PRD or defer to a separate admin integration task? **Owner:** product.
