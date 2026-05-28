# Tech Spec — Receivables Integration

## Overview

This spec replaces the mock `duplicata.*` stack with HTTP integration to `/v1/receivables` for **seller** and **risk analyst** personas. It consolidates frontend naming under `receivable` / `receivables`, introduces draft save vs submit as separate UI actions, maps backend lifecycle statuses to Portuguese labels, and removes simulated scores in HTTP mode.

**In scope:** HTTP-only `receivable.service.ts`, domain rename (`domain/receivable/`), seller create/draft/update/submit/list/offer-response, analyst list/detail/offer/reprove, route migration with legacy redirects, Zod validation (excluding document TODO fields), monetary mappers, error mapping.

**Out of scope:** document upload/storage (Module 6), payer confirmation (`ConfirmationPage`), platform settlement actions, admin receivable HTTP, real scoring API, backend schema changes, automated E2E, legacy EN `domain/receivables/*` demo model used by admin/confirmation (left untouched — FR-3).

Requires live HTTP (`VITE_API_BASE_URL` + backend running). Receivable service has **no mock path** (PRD FR-4, FR-39).

Reference: [prd.md](./prd.md) · [integration-spec.md](./integration-spec.md)

---

## Architecture overview

```
UI (pages/seller/*, pages/analyst/*, components/forms, components/seller, components/analyst)
  └── receivable.service + domain/receivable types (no DTO imports in UI)
Services
  └── receivable.service.ts — HTTP-only I/O, error mapping
  └── receivable.dto.ts — transport types only
  └── seller.service.ts — fetchCurrentSeller (gate + seller id)
Domain (domain/receivable/*)
  └── receivable.types.ts — backend-aligned status + form/list models
  └── receivable.schema.ts — Zod (submit validation; docs excluded)
  └── receivable.mapper.ts — form ↔ DTO, row DTO ↔ domain, enum PT ↔ EN
  └── receivable.status.ts — backend status → PT labels/badges
  └── receivable-antecipacao.helpers.ts — discount % → proposedValue reais
  └── receivable.errors.ts — ReceivableError + codes
Domain (domain/seller/*)
  └── seller-receivable-access.ts — canSellerRegisterReceivables (active seller)
Lib
  └── api-client, token-storage, routes, formatters
```

**Layer boundaries:**

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| Pages / components | service functions, domain types/helpers, toast, navigate | `fetch`, `apiRequest`, DTO imports |
| receivable.service | `apiRequest`, DTO mapping delegation, error mapping | JSX; mock implementation |
| domain/receivable | pure types, Zod, mappers, status labels | React, api-client |

---

## Component design

### 1. Receivable DTOs (`src/services/receivable.dto.ts`)

**Change:** New file per [integration-spec.md](./integration-spec.md) — `ReceivableRowDTO`, request/response types, `ReceivableStatusDTO`, `ReceivableErrorBodyDTO`.

**FR coverage:** FR-4, FR-18, FR-19.

---

### 2. Receivable domain types (`src/domain/receivable/receivable.types.ts`)

**Change:** New types aligned with backend v2 — replace `DuplicataTitulo` and legacy EN demo statuses.

```ts
export type ReceivableStatus =
  | "created"
  | "under_review"
  | "reproved"
  | "offer"
  | "rejected"
  | "approved"
  | "payer_rejected"
  | "confirmed"
  | "processing"
  | "completed"
  | "payer_settled"
  | "overdue";

export type ReceivableType = "commercial" | "service";
// UI-facing aliases with PT display mappers for type, fiscal, proof, acceptance

export type ReceivableListItem = {
  id: string;
  billNumber: string;
  payerLegalName: string;
  faceValue: number;
  dueDate: string;
  status: ReceivableStatus;
};

export type ReceivableDetail = ReceivableListItem & {
  sellerId: string;
  payerId: string;
  invoiceNumber: string;
  issuedAt: string;
  payerCnpj: string;
  payerFinancialEmail: string;
  proposedValue: number | null;
  /** Derived for seller offer wizard when status=offer */
  discountPercent?: number;
  // fiscal/proof fields, desiredAnticipationValue, declarations
  // score placeholders omitted in HTTP mode (FR-25)
};
```

**FR coverage:** FR-1, FR-2, FR-17.

---

### 3. Status labels and badge (`src/domain/receivable/receivable.status.ts`, `src/components/receivable/ReceivableStatusBadge.tsx`)

**Change:** Replace `DuplicataAnaliseBadge` + hackathon 4-state model with backend status mapping.

```ts
export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
  created: "Rascunho",
  under_review: "Em análise",
  offer: "Proposta em aberto",
  reproved: "Reprovada",
  rejected: "Proposta recusada",
  approved: "Em análise do sacado",
  processing: "Transação em andamento",
  completed: "Transação completa",
  payer_rejected: "Recusada pelo sacado", // badge-only v1
  confirmed: "Confirmada", // badge-only v1
  payer_settled: "Liquidada", // badge-only v1
  overdue: "Em atraso", // badge-only v1
};
```

List/detail use `ReceivableStatusBadge` instead of `DuplicataAnaliseBadge`. Interactive row styling when `status === "offer"` (seller list — FR-11).

**FR coverage:** FR-17, FR-10.

---

### 4. Form schema (`src/domain/receivable/receivable.schema.ts`)

**Change:** Move validation from inline `NewDuplicataForm.validate()` to Zod.

```ts
export const receivableDraftSchema = z.object({
  type: z.enum(["commercial", "service"]),
  billNumber: z.string().trim().min(1),
  invoiceNumber: z.string().trim().min(1),
  faceValue: z.number().positive(),
  issuedAt: z.string().min(1),
  dueDate: z.string().min(1),
  payerCnpj: z.string().refine((v) => digitsOnly(v).length === 14),
  payerLegalName: z.string().trim().min(1),
  payerFinancialEmail: z.string().email(),
  fiscalDocumentType: z.enum(["nfe", "nfce", "nfse", "other"]),
  fiscalDocumentKey: z.string().trim().min(1),
  proofType: z.enum(["delivery", "acceptance", "service_provision"]),
  payerAcceptanceStatus: z.enum(["accepted", "pending", "refused"]),
  desiredAnticipationValue: z.number().positive(),
  antifraudDeclarationsAccepted: z.literal(true),
  // document booleans optional — not in submit schema (FR-23)
});

export const receivableSubmitSchema = receivableDraftSchema; // same fields, docs excluded
```

**FR coverage:** FR-22, FR-23.

---

### 5. Mappers (`src/domain/receivable/receivable.mapper.ts`)

**Change:** Pure functions for all boundary conversions.

- `mapReceivableRowToListItem(dto: ReceivableRowDTO): ReceivableListItem` — parse metadata JSON
- `mapReceivableRowToDetail(dto: ReceivableRowDTO): ReceivableDetail`
- `mapFormToCreateBody(values): CreateReceivableRequestDTO`
- `mapFormToUpdateBody(values): UpdateReceivableRequestDTO`
- Enum mappers: PT form radios → English API keys (FR-18)
- `deriveDiscountPercent(faceValue, proposedValue)` for seller offer display

Reuse `parseReais` pattern from seller-registration for BRL string inputs if form keeps string state.

**Money (FR-20):** API uses reais numbers (backend v2). Mappers send/receive reais — update `.cursor/rules/45-money-values.mdc` to document reais for receivable routes (not centavos strings — backend already normalized).

**FR coverage:** FR-18, FR-19, FR-20, FR-21.

---

### 6. Anticipation helper (`src/domain/receivable/receivable-antecipacao.helpers.ts`)

**Change:** Rename from `duplicata-antecipacao.helpers.ts`; keep formula:

```ts
export function calcProposedValueFromDiscount(
  faceValueReais: number,
  discountPercent: number,
): number {
  return faceValueReais * (1 - discountPercent / 100);
}
```

Analyst wizard passes discount %; service calls this before `submitRiskDecision(..., { decision: "offer", proposedValue })`.

**FR coverage:** FR-15.

---

### 7. Receivable errors (`src/domain/receivable/receivable.errors.ts`)

**Change:** Typed error class + Portuguese messages per integration-spec error table.

**FR coverage:** FR-24.

---

### 8. Receivable service (`src/services/receivable.service.ts`)

**Change:** Replace entire `duplicata.service.ts` mock with HTTP-only functions:

| Function | Endpoint |
|----------|----------|
| `fetchReceivables()` | GET `/v1/receivables` |
| `fetchReceivableById(id)` | GET `/v1/receivables/:id` |
| `createReceivableDraft(body)` | POST `/v1/receivables` |
| `updateReceivableDraft(id, body)` | PATCH `/v1/receivables/:id` |
| `submitReceivableForReview(id)` | POST `/v1/receivables/:id/submit` |
| `createAndSubmitReceivable(body)` | POST `/v1/receivables/submit` |
| `submitRiskOffer(id, discountPercent)` | POST `.../risk-decision` |
| `submitRiskReprove(id)` | POST `.../risk-decision` |
| `submitSellerDecision(id, decision)` | POST `.../seller-decision` |

```ts
function assertReceivableApiConfigured(): void {
  if (!env.apiBaseUrl) {
    throw new ReceivableError("network", RECEIVABLE_ERROR_MESSAGES.network);
  }
}

export function mapReceivableApiError(error: unknown): ReceivableError { ... }
```

Delete mock sleep/data imports. No `resolveApiMode()` branch.

**FR coverage:** FR-4, FR-5, FR-6, FR-7, FR-8, FR-10, FR-11, FR-13, FR-14, FR-15, FR-16.

---

### 9. Seller access gate (`src/domain/seller/seller-receivable-access.ts`)

**Change:** Rename from `seller-duplicata-access.ts`; simplify gate to backend-aligned rule:

```ts
/** Seller may register receivables when profile status is active (backend enforces on create). */
export function canSellerRegisterReceivables(seller: SellerCompany): boolean {
  // Derive from seller profile mapping: active seller only
  return seller.validationStatus === "APPROVED" && seller.kycStatus === "APPROVED";
  // Equivalent to backend status=active via mapSellerDtoToCompany
}
```

Replace all `canSellerRegisterDuplicatas` imports. Copy update labels from duplicata → receivable wording.

**FR coverage:** FR-1, FR-12.

---

### 10. New receivable form (`src/components/forms/NewReceivableForm.tsx`)

**Change:** Rename from `NewDuplicataForm.tsx`. Split actions:

```tsx
// Two primary actions (FR-6, FR-7)
<Button type="button" onClick={handleSaveDraft} disabled={loading}>
  Salvar informações
</Button>
<Button type="button" onClick={handleSubmitForReview} disabled={loading}>
  Enviar para análise
</Button>
```

**Save draft:** validate minimal fields or full draft schema → if `draftId` in state, `updateReceivableDraft`; else `createReceivableDraft` → store returned id → toast "Informações salvas".

**Submit for review:** run `receivableSubmitSchema` → if no `draftId`, `createAndSubmitReceivable`; else `submitReceivableForReview(draftId)` → toast success → navigate to list.

**Edit lock (FR-9):** When loading existing receivable with `status !== "created"`, render read-only detail + `metadata_locked` messaging; disable form.

**Documents (FR-23):** Keep `RegistrationUploadField` visible with TODO badge; remove from Zod required rules; do not send booleans to API.

**Remove:** demo autofill button (or gate behind dev-only if desired — not in PRD).

**FR coverage:** FR-6, FR-7, FR-8, FR-9, FR-22, FR-23.

---

### 11. Seller list page (`src/pages/seller/SellerReceivablesPage.tsx`)

**Change:** Rename from `SellerDuplicatasPage.tsx`.

- `fetchReceivables()` instead of `fetchDuplicatasBySeller` (backend scopes by JWT — no sellerId param needed)
- Status column uses `ReceivableStatusBadge` with backend status
- Row click / wizard when `status === "offer"` → `submitSellerDecision(id, "accept" | "reject")`
- Copy: "Recebíveis" / "Nova recebível"
- Header link to `ROUTES.seller.receivables.new`

**FR coverage:** FR-1, FR-10, FR-11, FR-17.

---

### 12. New receivable page (`src/pages/seller/NewReceivablePage.tsx`)

**Change:** Rename from `NewDuplicataPage.tsx`; use `canSellerRegisterReceivables`, `NewReceivableForm`.

**FR coverage:** FR-1, FR-12.

---

### 13. Analyst list page (`src/pages/analyst/AnalystReceivablesPage.tsx`)

**Change:** Rename from `AnalystDuplicatasPage.tsx`.

- `fetchReceivables()` — all rows for analyst JWT
- Link to `ROUTES.analyst.receivables.detail(id)`
- Show seller id or parsed metadata name (until API-3)

**FR coverage:** FR-1, FR-13, FR-14.

---

### 14. Analyst detail page (`src/pages/analyst/AnalystReceivableDetailPage.tsx`)

**Change:** Rename from `AnalystDuplicataDetailPage.tsx`.

- `fetchReceivableById(id)` on mount
- Display parsed metadata sections (seller, payer, fiscal, proof)
- Actions when `status === "under_review"`:
  - **Oferta** → `AnalystReceivableOfferWizardDialog` → `submitRiskOffer(id, discountPercent)`
  - **Reprovar** → `submitRiskReprove(id)`
- **Remove** "Marcar como pendente" (no backend transition)
- Score props: pass `undefined` / render TODO empty state (FR-25)

**FR coverage:** FR-1, FR-14, FR-15, FR-16, FR-25.

---

### 15. Analyst offer wizard (`src/components/analyst/AnalystReceivableOfferWizardDialog.tsx`)

**Change:** Rename from `AnalystDuplicataApprovalWizardDialog.tsx`.

- Remove simulated `scoreUsuario` / `scoreDuplicata` display; optional placeholder "Score — em breve" (FR-25)
- Keep discount % input + liquid value preview via `calcProposedValueFromDiscount`

**FR coverage:** FR-15, FR-25.

---

### 16. Seller offer wizard (`src/components/seller/SellerReceivableOfferWizardDialog.tsx`)

**Change:** Rename from `SellerDuplicataOperacaoWizardDialog.tsx`.

- Triggered when list item `status === "offer"`
- Show `proposedValue` from backend (mapped to reais)
- Approve → `submitSellerDecision(id, "accept")`; Reject → `"reject"`

**FR coverage:** FR-11.

---

### 17. Dashboard / validation previews

**Files:**

- `src/components/seller/SellerReceivablesPreview.tsx` (rename from `SellerDuplicatasPreview.tsx`)
- `src/components/seller/SellerValidationReceivablesOverview.tsx` (rename from `SellerValidationDuplicatasOverview.tsx`)
- `src/pages/seller/SellerDashboardPage.tsx` — import receivable service
- `src/pages/seller/SellerValidationPage.tsx` — import receivable service
- `src/pages/analyst/AnalystDashboardPage.tsx` — count `under_review` receivables

**FR coverage:** FR-1, FR-10, FR-13.

---

### 18. Routes (`src/lib/routes.ts`, `src/App.tsx`)

**Change:**

```ts
// routes.ts — canonical paths
seller: {
  receivables: {
    list: "/seller/receivables",
    new: "/seller/receivables/new",
    detail: (id: string) => `/seller/receivables/${id}`,
  },
},
analyst: {
  receivables: {
    list: "/analyst/receivables",
    detail: (id: string) => `/analyst/receivables/${id}`,
  },
},
```

**App.tsx:** Register new routes; add `<Navigate>` redirects from `/seller/duplicatas/*` and `/analyst/duplicatas/*` to receivables equivalents (PO open question — default yes).

Update nav links in shell/sidebar components.

**FR coverage:** FR-1, FR-3 (legacy admin/confirmation untouched).

---

### 19. Deletions and legacy isolation (FR-1, FR-2, FR-3)

**Delete after migration:**

- `src/services/duplicata.service.ts`
- `src/domain/duplicata/*`
- `src/data/duplicatas.mock.ts`, `duplicata-demo.mock.ts`
- `src/components/duplicata/*`
- Old page/component files once renamed replacements exist

**Keep (out of scope):**

- `src/domain/receivables/*` — admin + ConfirmationPage
- `src/services/receivables.service.ts` — payer demo flow
- `src/pages/admin/AdminReceivablesPage.tsx`

Ensure seller/analyst paths have **zero imports** from deleted modules or legacy EN demo types.

**FR coverage:** FR-1, FR-2, FR-3.

---

### 20. Cursor rule update (FR-21)

**File:** `.cursor/rules/45-money-values.mdc`

Update receivable row to match backend v2 (reais numbers on API, not centavos strings). Remove or deprecate `toReceivableCents` / `formatReceivableMoneyString` examples if not used.

**FR coverage:** FR-20, FR-21.

---

## Data flow

### Save draft

```
User clicks "Salvar informações"
  → NewReceivableForm.handleSaveDraft
      → receivableDraftSchema.parse(form)
      → draftId ? updateReceivableDraft(id, body) : createReceivableDraft(body)
      → setDraftId(id); toast success
```

### Submit for review (existing draft)

```
User clicks "Enviar para análise"
  → receivableSubmitSchema.parse(form)
  → submitReceivableForReview(draftId)
  → navigate to list; toast "Enviado para análise"
```

### Submit for review (no prior save)

```
User clicks "Enviar para análise"
  → receivableSubmitSchema.parse(form)
  → createAndSubmitReceivable(body)   // POST /v1/receivables/submit
  → navigate to list; toast success
```

### Analyst offer

```
Analyst confirms discount % in wizard
  → calcProposedValueFromDiscount(faceValue, discountPercent)
  → submitRiskOffer(id, discountPercent)
  → refetch detail; toast "Oferta enviada ao cedente"
```

### Seller offer response

```
Seller approves/rejects in wizard
  → submitSellerDecision(id, "accept" | "reject")
  → refetch list; toast with PT copy per status
```

---

## Files changed

| File | Change type |
|------|-------------|
| `src/services/receivable.service.ts` | Added |
| `src/services/receivable.dto.ts` | Added |
| `src/domain/receivable/receivable.types.ts` | Added |
| `src/domain/receivable/receivable.schema.ts` | Added |
| `src/domain/receivable/receivable.mapper.ts` | Added |
| `src/domain/receivable/receivable.status.ts` | Added |
| `src/domain/receivable/receivable-antecipacao.helpers.ts` | Added |
| `src/domain/receivable/receivable.errors.ts` | Added |
| `src/domain/seller/seller-receivable-access.ts` | Added (replaces duplicata access) |
| `src/pages/seller/SellerReceivablesPage.tsx` | Added (replaces Duplicatas) |
| `src/pages/seller/NewReceivablePage.tsx` | Added |
| `src/components/forms/NewReceivableForm.tsx` | Added |
| `src/components/receivable/ReceivableStatusBadge.tsx` | Added |
| `src/pages/analyst/AnalystReceivablesPage.tsx` | Added |
| `src/pages/analyst/AnalystReceivableDetailPage.tsx` | Added |
| `src/components/analyst/AnalystReceivableOfferWizardDialog.tsx` | Added |
| `src/components/seller/SellerReceivableOfferWizardDialog.tsx` | Added |
| `src/components/seller/SellerReceivablesPreview.tsx` | Added |
| `src/components/seller/SellerValidationReceivablesOverview.tsx` | Added |
| `src/lib/routes.ts` | Modified |
| `src/App.tsx` | Modified |
| Nav/shell components | Modified (links) |
| `.cursor/rules/45-money-values.mdc` | Modified |
| `src/services/duplicata.service.ts` | Deleted |
| `src/domain/duplicata/*` | Deleted |
| `src/data/duplicatas.mock.ts` | Deleted |
| `src/data/duplicata-demo.mock.ts` | Deleted |
| `src/components/duplicata/*` | Deleted |
| Old `*Duplicata*` pages/components | Deleted after rename |

---

## Impact analysis

- **Auth/navigation:** No change to JWT/profile selection. Seller gate uses existing `fetchCurrentSeller()` + active status check. Backend returns `403 seller_not_active` if seller not active on create.
- **Other personas:** Admin and payer confirmation keep legacy EN receivable mocks — no shared service with new module.
- **Service adapter:** HTTP-only — no mock fallback; requires `VITE_API_BASE_URL` (same pattern as seller-registration).
- **TypeScript:** Strict mode — no `any`; parse metadata with typed guard; handle `receivableMetaData: null` for empty drafts.
- **Route redirects:** Old bookmarked `/duplicatas/*` URLs continue working via `Navigate`.

---

## FR traceability

| FR | Addressed in |
|----|----------------|
| FR-1 | §9, §11–18, §19 — rename all active module code |
| FR-2 | §2 — new domain types; §19 delete legacy imports in seller/analyst |
| FR-3 | §19 — admin/confirmation untouched |
| FR-4 | §8 — HTTP-only service |
| FR-5 | Architecture — no DTOs in UI |
| FR-6 | §10 — Salvar informações |
| FR-7 | §10 — Enviar para análise + submit endpoint |
| FR-8 | §10 — createAndSubmitReceivable |
| FR-9 | §10 — edit lock for non-created |
| FR-10 | §11, §17 — seller list |
| FR-11 | §11, §16 — seller-decision |
| FR-12 | §9 — canSellerRegisterReceivables |
| FR-13 | §13, §17 — analyst list |
| FR-14 | §13, §14 — detail + metadata |
| FR-15 | §6, §8, §14, §15 — risk offer |
| FR-16 | §8, §14 — reprove |
| FR-17 | §3 — status labels |
| FR-18 | §5 — metadata keys |
| FR-19 | §5 — create body shape |
| FR-20 | §5, §20 — reais mappers |
| FR-21 | §20 — Cursor rule |
| FR-22 | §4 — Zod schema |
| FR-23 | §10 — document TODO |
| FR-24 | §7 — error mapping |
| FR-25 | §14, §15 — score placeholders removed |

---

## Test strategy

_(No automated test runner configured — manual verification.)_

### Manual — Seller draft save and submit

| Step | Expected result |
|------|-----------------|
| Login as active seller | Dashboard loads |
| Open Nova recebível | Form renders; gate passes |
| Fill required fields (skip document uploads) | No client validation errors on doc fields |
| Click **Salvar informações** | `POST /v1/receivables` or `PATCH`; toast; status Rascunho in list |
| Reload form via list edit (if implemented) or continue same session | Draft id retained |
| Click **Enviar para análise** | `POST .../submit`; status **Em análise** |
| Open form for submitted receivable | Read-only; metadata_locked message if edit attempted |

### Manual — Seller submit without prior save

| Step | Expected result |
|------|-----------------|
| New form, fill all required fields | — |
| Click **Enviar para análise** directly | Single loading state; `POST /v1/receivables/submit`; one success toast; list shows **Em análise** |

### Manual — Analyst offer / reprove

| Step | Expected result |
|------|-----------------|
| Login as risk analyst | Analyst receivables list shows submitted row |
| Open detail | Metadata + payer/seller sections visible |
| **Oferta** with 5% discount | `POST .../risk-decision`; status **Proposta em aberto** |
| **Reprovar** on another row | Status **Reprovada** |

### Manual — Seller offer response

| Step | Expected result |
|------|-----------------|
| Login as seller with `offer` receivable | List badge **Proposta em aberto**; row opens wizard |
| Accept | `POST .../seller-decision accept`; status **Em análise do sacado** |
| Reject (another offer) | Status **Proposta recusada** |

### Manual — Errors

| Step | Expected result |
|------|-----------------|
| Inactive seller creates receivable | Toast: seller_not_active PT message |
| Submit incomplete metadata | Toast: incomplete_metadata |
| Edit receivable in under_review | PATCH blocked → metadata_locked message |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.
- Grep: no remaining `duplicata` imports in `src/pages/seller`, `src/pages/analyst`, `src/components/seller`, `src/components/analyst`, `src/components/forms`.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| Atomic submit endpoint timing | Use `POST /v1/receivables/submit` — **already implemented** in backend |
| Money at API boundary | Backend v2 uses **reais numbers** (not centavos strings); update frontend Cursor rule accordingly — PRD example is stale |
| Route URLs | Default: canonical `/seller/receivables/*` and `/analyst/receivables/*` with redirects from `/duplicatas/*` — pending PO confirmation |
| Terminal status copy (`reproved` vs `rejected`) | Use FR-17 table; analyst reprove toast "Recebível reprovada"; seller reject toast "Proposta recusada" — pending PO confirmation |
| API response shape v1 | Parse `receivableMetaData` client-side; no enriched DTO until API-3 |
| Docs refresh (INTEGRATIONS.md etc.) | PO task after merge — not blocking implementation |

---

## Next step

Run **`create tasks for receivables-integration`** to break this spec into implementation tasks.
