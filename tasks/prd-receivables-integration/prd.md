# Product Requirements Document — Receivables Integration

**Status:** Draft — product decisions confirmed 2026-05-26  
**Backend module:** `dupply-backend` receivable v2 (`/v1/receivables`)  
**Replaces:** all frontend `duplicata*` mock flows and legacy EN `receivables` demo model

## Overview

The Dupply frontend currently simulates trade-bill (receivable) operations through two parallel, outdated models: a Portuguese `duplicata.*` hackathon stack (`duplicata.service.ts`, simplified 4-state analyst workflow) and a legacy English `receivables.*` stack used only by admin/confirmation pages. Neither talks to the real backend.

The backend receivable module v2 is implemented with a multi-step lifecycle (draft → submit → risk review → offer → seller decision → payer confirmation → platform settlement). This feature replaces the mock stacks with HTTP integration, **migrates all frontend naming to `receivable` / `receivables`**, and aligns domain vocabulary, status labels, and monetary handling with the backend contract.

Seller registration and seller profile integration (Slices A + B) already established the service adapter pattern (`resolveApiMode()`, DTOs, mappers, typed errors). This feature applies the same pattern to receivables for **seller and risk analyst personas** in the first slice.

Reference lifecycle (backend source of truth):

```
created → under_review → offer | reproved
offer → approved | rejected        (seller decision)
approved → confirmed | payer_rejected   (payer magic link — later)
confirmed → processing → completed → payer_settled | overdue   (platform — later)
```

## Goals

- Wire seller receivable creation, draft save, submit-for-review, listing, and offer response to `/v1/receivables`.
- Wire risk analyst listing, detail, and risk decision (offer with discount % → `proposedValue`, or reprove) to the same API.
- Rename and consolidate frontend modules: **no `duplicata` naming**; single `receivable` domain + `receivable.service.ts`.
- Map backend statuses to Portuguese UI labels for in-scope statuses; defer payer/platform statuses to later slices with TODO hooks.
- Align monetary values with the backend receivable contract at the service boundary; document API gaps for a follow-up backend normalization pass.
- Remove legacy mock-only fields from HTTP mode (simulated scores); keep UI structure with TODO placeholders for future scoring.
- Defer document upload validation and persistence; mark fiscal/proof upload fields as TODO without blocking submit.

**Success metrics:**

- In HTTP mode, an active seller can save a draft (`status=created`), return later, edit, and submit; list shows backend rows with correct PT status badges.
- In HTTP mode, a risk analyst can list all receivables, open detail, send an offer (discount % UI → backend `proposedValue`) or reprove.
- In HTTP mode, a seller with `status=offer` can accept or reject via `POST .../seller-decision`; UI reflects `approved` or `rejected`.
- Mock mode removed from `receivable.service.ts` once HTTP path is implemented (same as seller-registration slice — HTTP-only for this module).
- `npm run typecheck` passes; no remaining imports from deleted `duplicata.*` or legacy EN receivable demo types in seller/analyst flows.
- Product/tech docs updated to match this contract (owner: PO — see Open Questions).

## User Stories

- As a **seller**, I want to save my receivable form as a draft so that I can finish it later without losing data.
- As a **seller**, I want a clear “Salvar informações” action separate from “Enviar para análise” so that I understand draft vs submission.
- As a **seller**, I want to submit a completed receivable for risk review in one action when I am ready, without manually saving first.
- As a **seller**, I want to see my receivables and their current status in Portuguese so that I know what happens next.
- As a **seller**, I want to accept or reject an analyst offer so that I control the anticipation terms.
- As a **risk analyst**, I want to review submitted receivables and either propose terms (discount %) or reprove them.
- As a **risk analyst**, I want receivable detail to show seller and payer data parsed from backend metadata.

**Main flow (in-scope slice):**

1. Seller opens “Nova receivable” / new receivable form (gate: active seller, same as today).
2. Seller fills form → **Salvar informações** → `POST /v1/receivables` (create) or `PATCH /v1/receivables/:id` (update draft).
3. Seller clicks **Enviar para análise** → validate metadata (except document TODO fields) → `POST /v1/receivables/:id/submit` → `under_review`.
4. *(Optional UX shortcut)* If seller clicks **Enviar para análise** without a prior save and no draft id exists, orchestrate create + submit in one user action (see FR-6; prefer dedicated backend endpoint when available).
5. Risk analyst lists receivables → opens detail → **Oferta** (discount %) or **Reprovar**.
6. On offer, seller sees **Proposta em aberto** → accepts or rejects → `approved` or `rejected`.

## Core Features

1. **Receivable service adapter (HTTP-only)**
   - What it does: Centralizes all receivable I/O in `receivable.service.ts` with DTO types, error mapping, and `apiRequest`.
   - Why it matters: Matches seller-registration integration; pages never call HTTP directly.

2. **Draft save vs submit**
   - What it does: Two explicit UI actions mapped to backend `created` + `submit` transitions.
   - Why it matters: Backend lifecycle is staged; conflating them breaks resumability.

3. **Domain rename and cleanup**
   - What it does: Replace `duplicata.*` files/routes/components with `receivable.*`; delete legacy EN demo receivable model and unused admin confirmation dependencies in seller/analyst paths.
   - Why it matters: Single vocabulary aligned with backend; removes dual-model confusion documented in CONCERNS.md.

4. **Status and metadata mappers**
   - What it does: Parse `receivableMetaData` JSON string from API responses; map backend status → PT labels.
   - Why it matters: API returns raw rows today, not enriched DTOs (see Data contract below).

5. **Analyst offer via discount %**
   - What it does: Analyst UI keeps discount % input; service computes `proposedValue` (centavos string) from face value before `POST .../risk-decision`.
   - Why it matters: Preserves existing UX while honoring backend `proposedValue` field.

6. **Monetary boundary mappers**
   - What it does: Convert between UI reais and backend receivable storage format at the service mapper layer only.
   - Why it matters: Receivable API today uses centavos in `value`, `proposedValue`, and `desiredAnticipationValue`; seller module uses reais — mappers must be module-specific until API normalization lands.

7. **Document fields deferred**
   - What it does: Fiscal/proof upload UI remains visible but marked TODO; excluded from validation and submit completeness until Module 6 (documents).
   - Why it matters: Unblocks integration without fake boolean “uploaded” flags blocking real flows.

8. **Score placeholders**
   - What it does: Remove simulated scores from HTTP mode UI; retain layout slots with TODO comments/empty states for future scoring API.
   - Why it matters: Avoids showing fiction after integration.

## Functional Requirements

### Naming and module cleanup

1. **FR-1:** All seller and analyst receivable code must use `receivable` / `receivables` naming (files, types, routes, services, components). The term `duplicata` must not remain in active module code after this feature.
2. **FR-2:** Remove or replace legacy EN `domain/receivables/receivable.types.ts` demo statuses (`DRAFT`, `FUNDED`, etc.) with types aligned to backend v2 statuses for integrated flows.
3. **FR-3:** `ConfirmationPage` payer flow and admin legacy receivable tables are out of scope; mark routes/components as TODO or remove dead imports when integrating seller/analyst paths.

### Service layer

4. **FR-4:** Implement `receivable.service.ts` as HTTP-only (no mock branch), following `seller.service.ts` / `seller-registration.service.ts` patterns: DTO file, typed errors, Portuguese messages, Bearer auth via `apiRequest`.
5. **FR-5:** Pages and components must consume domain types from `domain/receivable/` and service functions only — no DTO imports in UI.

### Draft and submit

6. **FR-6:** **Salvar informações** must persist a receivable with backend status `created`:
   - If no draft id in session/form state → `POST /v1/receivables` with payer fields + partial/full `receivableMetaData` + `value`.
   - If draft id exists → `PATCH /v1/receivables/:id`.
   - Must not transition to `under_review`.
7. **FR-7:** **Enviar para análise** must validate required metadata (excluding document TODO fields) and call `POST /v1/receivables/:id/submit`.
8. **FR-8:** When the user clicks **Enviar para análise** without an existing draft id, the app must perform create-then-submit as a single user-facing action (loading state, single success toast). Prefer `POST /v1/receivables/submit` (or equivalent) when backend adds it; until then, sequential `POST` + `POST .../submit` is acceptable.
9. **FR-9:** Only receivables with `status=created` may be edited via the form; locked states must show read-only detail with appropriate messaging (`metadata_locked`).

### Seller flows

10. **FR-10:** List seller receivables via `GET /v1/receivables` scoped to authenticated seller; map rows to list domain model (number, payer name, face value, due date, status badge).
11. **FR-11:** Seller offer response: `POST /v1/receivables/:id/seller-decision` with `{ decision: "accept" | "reject" }` when `status=offer`.
12. **FR-12:** `canSellerRegisterReceivables()` (renamed from duplicata gate) continues to use seller profile mapping (`active` → allowed); backend enforces `seller_not_active` on create.

### Analyst flows

13. **FR-13:** Analyst list via `GET /v1/receivables` (all rows, analyst JWT).
14. **FR-14:** Analyst detail via `GET /v1/receivables/:id`; display parsed metadata and seller id (seller name from metadata or follow-up API field).
15. **FR-15:** Analyst **Oferta**: `POST /v1/receivables/:id/risk-decision` with `{ decision: "offer", proposedValue }` where `proposedValue` is derived from face value and analyst discount % (same formula as current hackathon helper, converted to backend centavos string).
16. **FR-16:** Analyst **Reprovar**: `POST .../risk-decision` with `{ decision: "reprove" }` without `proposedValue`.

### Status labels (UI — Portuguese)

17. **FR-17:** Map in-scope backend statuses to UI labels:

| Backend status | UI label (PT) |
|----------------|---------------|
| `created` | Rascunho |
| `under_review` | Em análise |
| `offer` | Proposta em aberto |
| `reproved` | Reprovada |
| `rejected` | Proposta recusada |
| `approved` | Em análise do sacado |
| `processing` | Transação em andamento |
| `completed` | Transação completa |

Statuses beyond `rejected` in the seller/analyst slice may appear on list/detail but have no actions in v1 (TODO hooks for payer/platform slices).

### Metadata mapping

18. **FR-18:** Form fields map to backend `receivableMetaData` English keys (`commercial`/`service`, `billNumber`, `invoiceNumber`, `issuedAt`, `dueDate`, payer fields, fiscal/proof enums, `payerAcceptanceStatus`, `desiredAnticipationValue`, `antifraudDeclarationsAccepted`) per backend `module-receivables.mdc`.
19. **FR-19:** Top-level create body includes `payerCnpj`, optional `payerLegalName`, `payerFinancialEmail`, `value`, and nested `receivableMetaData` per OpenAPI route schema.

### Money

20. **FR-20:** At the receivable service mapper boundary, convert UI reais inputs to backend receivable storage format:
   - `value` and `proposedValue`: string integer **centavos** (current backend route contract).
   - `desiredAnticipationValue` in metadata: number **centavos** (current backend metadata contract).
   - Display: convert centavos → reais for inputs and tables.
21. **FR-21:** Add frontend Cursor rule documenting monetary conventions (UI reais, receivable API centavos at boundary, seller API reais) until backend normalizes all modules.

### Validation and forms

22. **FR-22:** Move receivable form validation to `domain/receivable/receivable.schema.ts` (Zod), excluding document TODO fields from required rules.
23. **FR-23:** Document upload fields (`documentoFiscalAnexado`, `comprovanteAnexado` equivalents) remain in UI with visible TODO; must not fail client validation or block submit.

### Errors

24. **FR-24:** Map known backend codes to Portuguese user messages: `seller_not_active`, `incomplete_metadata`, `metadata_locked`, `seller_and_payer_must_differ`, `proposed_value_required`, `forbidden`, `not_found`, `invalid_receivable_transition`, etc.

### Scores

25. **FR-25:** Remove simulated `scoreUsuario` / `scoreDuplicata` values in HTTP mode; keep component props/slots with TODO for future scoring integration.

## Personas & Scope

- **Personas affected:** `seller`, `riskAnalyst`
- **Pages/routes touched (rename to receivables):**
  - Seller: list, new form, validation overview references, dashboard preview
  - Analyst: list, detail, dashboard counts
- **Integration with backend:** yes — requires `integration-spec.md` and `techspec.md`
- **Out of persona scope (TODO later):** payer confirmation (`ConfirmationPage`), admin receivable tables, platform settlement statuses actions

## Data contract (clarification — former Open Question #10)

Today the backend returns a **raw receivable row**, not a nested public DTO:

```json
{
  "receivable": {
    "id": "...",
    "status": "under_review",
    "sellerId": "...",
    "payerId": "...",
    "receivableMetaData": "{ ...json string... }",
    "value": "5000000",
    "proposedValue": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**v1 approach:** the frontend service parses `receivableMetaData` with `JSON.parse` and maps to `domain/receivable` types. Payer display name/CNPJ come from parsed metadata (and create body fields), not from a payer join.

**Follow-up (backend):** optional enriched response DTO (seller legal name, payer summary, parsed metadata object, money as reais numbers) — tracked in API adjustments below; not blocking frontend v1.

## Backend API adjustments (follow-up — separate backend task)

These items were identified during gap analysis; implement after or in parallel with frontend integration:

| # | Gap | Recommendation | Owner |
|---|-----|----------------|-------|
| API-1 | No atomic create-and-submit endpoint | Add `POST /v1/receivables/submit` (or `?submit=true`) accepting full body, creating draft and submitting in one transaction | Backend |
| API-2 | Money inconsistency: receivable routes use centavos strings; `money.mdc` specifies API I/O in reais `number`; seller routes use reais | Normalize receivable HTTP contract to match `money.mdc` (reais in JSON, centavos in DB only) OR document receivable as explicit exception until migration | Backend + PO |
| API-3 | List/detail lack seller name and payer summary | Extend GET responses with `sellerLegalName`, `payerLegalName`, `payerCnpj` (join or denormalize) | Backend |
| API-4 | Document completeness not enforced on submit | When Module 6 lands, validate required `documents` parentType=receivable before submit | Backend |
| API-5 | Scoring fields absent | Future endpoint or metadata extension for analyst scores | Backend |
| API-6 | `API.md` and Swagger summaries outdated vs v2 routes | PO/backend update docs to match `receivables.ts` | PO / Backend |
| API-7 | Frontend `.specs/codebase/INTEGRATIONS.md` still says zero HTTP | PO update after integration ships | PO |

## Technical Constraints

- No new external libraries unless justified.
- Must pass `npm run typecheck` with zero errors.
- Must preserve existing auth, profile selection, and seller profile integration flows.
- Must follow service adapter pattern; receivable module is HTTP-only (no mock path).
- Component/file design details belong in Tech Spec, not this PRD.
- Product copy in UI remains Portuguese; PRD and specs in English.

## Out of Scope

- Document upload/storage (Module 6 — fields stay TODO without validation)
- Payer magic link flow (`approved` → `confirmed` / `payer_rejected`)
- Platform settlement transitions (`processing`, `completed`, `payer_settled`, `overdue`) beyond status badge display
- Real scoring / IA simulation
- Admin receivable management HTTP integration
- Blockchain / trade bills / wallet
- Backend schema or route changes (tracked separately in API adjustments)
- Automated E2E tests (unless added in task breakdown)

## Open Questions

- **Docs refresh:** PO to update `INTEGRATIONS.md`, `CONCERNS.md`, `ROADMAP.md`, and backend `API.md` when integration merges — **Owner: PO**
- **Route URLs:** confirm canonical paths `/seller/receivables/*` and `/analyst/receivables/*` with redirects from old `/duplicatas/*` — **Owner: PO / Frontend**
- **Atomic submit endpoint timing:** ship frontend with sequential create+submit until API-1 lands, or block on backend first — **Owner: PO** (default: sequential OK for v1 per FR-8)
- **Terminal status copy:** confirm PT strings for `reproved` vs `rejected` in analyst/seller toasts — **Owner: PO**

## Resolved decisions (2026-05-26)

| Topic | Decision |
|-------|----------|
| Vocabulary | Migrate frontend to backend `receivable` naming; remove `duplicata` |
| Lifecycle | Match backend staged flow; separate Save vs Submit |
| Money | Follow current receivable backend centavos contract at mapper boundary; add frontend rule |
| Documents | Later; TODO in UI, no validation |
| Slice scope | Seller create/draft/submit/list/offer response + Analyst list/detail/offer/reprove |
| Analyst pricing | Keep discount % UI; compute `proposedValue` for API |
| Scores | Remove in HTTP mode; TODO placeholders |
| Legacy | Remove unused duplicata + EN demo receivable code when integrating |
| Payer flow | Later slice |
| API shape v1 | Parse `receivableMetaData` string client-side |
