# Integration Spec — Receivables

**Frontend service:** `src/services/receivable.service.ts`  
**Backend base path:** `/v1/receivables`  
**Status:** Confirmed (against `dupply-backend/src/routes/v1/receivables.ts`, 2026-05-27)  
**Last updated:** 2026-05-27

---

## Overview

Seller and risk-analyst receivable flows today use mock-only stacks: Portuguese `duplicata.*` (hackathon 4-state analyst workflow) and legacy English `domain/receivables/*` (admin/confirmation demo only). Neither talks to the backend.

This integration replaces seller/analyst I/O with HTTP calls to receivable v2, consolidates vocabulary under `receivable` / `receivables`, and follows the same adapter pattern as seller-registration (DTO file, typed errors, domain mappers, `apiRequest` with Bearer auth).

**HTTP-only:** `receivable.service.ts` has **no mock branch** — same as `seller-registration.service.ts` (PRD FR-4).

**Response shape:** Backend returns a **raw receivable row** (`ReceivableRow`), not an enriched public DTO. `receivableMetaData` is a JSON **string** in responses; the service parses it client-side (PRD v1 approach).

Reference: [prd.md](./prd.md)

---

## Endpoint map

| # | Method | Path | Auth | Request body | Response body | Frontend function |
|---|--------|------|------|-------------|---------------|-------------------|
| 1 | GET | `/v1/receivables` | Bearer | — | `{ receivables: ReceivableRowDTO[] }` | `fetchReceivables()` |
| 2 | GET | `/v1/receivables/:id` | Bearer | — | `{ receivable: ReceivableRowDTO }` | `fetchReceivableById(id)` |
| 3 | POST | `/v1/receivables` | Bearer (seller role) | `CreateReceivableRequestDTO` | `201 { id: string }` | `createReceivableDraft(body)` |
| 4 | POST | `/v1/receivables/submit` | Bearer (seller role) | `CreateReceivableRequestDTO` | `201 { id: string; status: "under_review" }` | `createAndSubmitReceivable(body)` |
| 5 | PATCH | `/v1/receivables/:id` | Bearer (seller owner) | `UpdateReceivableRequestDTO` | `{ ok: true }` | `updateReceivableDraft(id, body)` |
| 6 | POST | `/v1/receivables/:id/submit` | Bearer (seller owner) | — | `{ ok: true }` | `submitReceivableForReview(id)` |
| 7 | POST | `/v1/receivables/:id/risk-decision` | Bearer (risk_analyst / risk_analyst_agent) | `RiskDecisionRequestDTO` | `{ ok: true }` | `submitRiskDecision(id, body)` |
| 8 | POST | `/v1/receivables/:id/seller-decision` | Bearer (seller owner) | `SellerDecisionRequestDTO` | `{ ok: true }` | `submitSellerDecision(id, decision)` |

**List scoping:** Seller JWT → rows for authenticated seller only. Risk analyst JWT → all non-deleted rows (backend `executeListReceivables`).

**Atomic submit:** `POST /v1/receivables/submit` is **implemented** in backend (creates + submits in one transaction). Prefer it for **Enviar para análise** when no draft id exists (PRD FR-8; supersedes sequential create+submit).

---

## DTO definitions

Transport types live in `src/services/receivable.dto.ts`. They mirror backend Zod schemas and `ReceivableRow`.

```ts
// --- Metadata (nested in create/update; parsed from string in responses) ---

export type ReceivableMetaDataDTO = {
  type?: "commercial" | "service";
  billNumber?: string;
  invoiceNumber?: string;
  issuedAt?: string; // ISO date YYYY-MM-DD
  dueDate?: string;
  payerCnpj?: string;
  payerLegalName?: string;
  payerFinancialEmail?: string;
  fiscalDocumentType?: "nfe" | "nfce" | "nfse" | "other";
  fiscalDocumentKey?: string;
  proofType?: "delivery" | "acceptance" | "service_provision";
  payerAcceptanceStatus?: "accepted" | "pending" | "refused";
  /** API I/O: reais (backend converts to centavos in stored JSON) */
  desiredAnticipationValue?: number;
  antifraudDeclarationsAccepted?: boolean;
};

// --- Request DTOs ---

export type CreateReceivableRequestDTO = {
  payerCnpj: string;
  payerLegalName?: string;
  payerFinancialEmail?: string;
  /** Face value — reais, multipleOf 0.01 */
  value?: number;
  receivableMetaData?: ReceivableMetaDataDTO;
};

export type UpdateReceivableRequestDTO = {
  value?: number;
  receivableMetaData?: ReceivableMetaDataDTO;
};

export type RiskDecisionRequestDTO =
  | { decision: "offer"; proposedValue: number }
  | { decision: "reprove" };

export type SellerDecisionRequestDTO = {
  decision: "accept" | "reject";
};

// --- Response DTOs ---

export type ReceivableStatusDTO =
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

export type ReceivableRowDTO = {
  id: string;
  status: ReceivableStatusDTO;
  sellerId: string;
  payerId: string;
  /** JSON string from API — parse in mapper */
  receivableMetaData: string | null;
  /** Face value — reais (backend maps DB cents → reais) */
  value: number;
  proposedValue: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
  deletedAt: string | null;
};

export type ReceivableErrorBodyDTO = {
  error: string;
};
```

**Placement:** `src/services/receivable.dto.ts`

---

## Monetary convention (API boundary)

Backend route schemas and `mapReceivableRow()` use **reais as `number`** with up to 2 decimal places — same transport as seller routes. DB storage is centavos internally; conversion is server-side.

| Field | API transport | UI |
|-------|---------------|-----|
| `value`, `proposedValue` | `number` reais | reais (inputs/tables via `formatCurrencyBRL`) |
| `desiredAnticipationValue` (metadata) | `number` reais | reais |

**Analyst offer:** UI keeps discount % input. Service computes `proposedValue` in reais:

```ts
proposedValue = faceValueReais * (1 - discountPercent / 100);
```

> **Note:** PRD data-contract example and `.cursor/rules/45-money-values.mdc` still describe centavos strings. Backend v2 routes use reais numbers — follow backend source of truth during implementation; update the Cursor rule in the same PR (FR-21).

---

## DTO → Domain mapping

Domain types live in `src/domain/receivable/` (singular — distinct from legacy `domain/receivables/` used by admin/confirmation).

```ts
// src/domain/receivable/receivable.types.ts (target)
export type Receivable = {
  id: string;
  status: ReceivableStatus;
  sellerId: string;
  payerId: string;
  // Parsed metadata + top-level money
  billNumber: string;
  invoiceNumber: string;
  type: ReceivableType;
  faceValue: number;
  proposedValue: number | null;
  dueDate: string;
  issuedAt: string;
  payerCnpj: string;
  payerLegalName: string;
  payerFinancialEmail: string;
  // ... remaining form fields
  submittedAt: string; // from createdAt when status !== created
};
```

**Mapper responsibilities** (`src/domain/receivable/receivable.mapper.ts`):

| DTO / API | Domain |
|-----------|--------|
| `receivableMetaData` string | `JSON.parse` → merge with top-level payer fields from create body |
| `status` | `ReceivableStatus` enum (backend values) |
| `value` | `faceValue` (reais) |
| `proposedValue` | `proposedValue` (reais) or null |
| `sellerId` | `sellerId`; seller display name from metadata TODO until API-3 |
| Enum keys (English) | Portuguese UI labels via `receivable.status.ts` — not stored in domain |

**Form → request body** (`mapFormToCreateBody`, `mapFormToUpdateBody`):

| Form field (PT UI) | DTO field |
|--------------------|-----------|
| `tipo` mercantil/servico | `receivableMetaData.type` commercial/service |
| `numeroReceivable` / bill | `billNumber` |
| `numeroFatura` | `invoiceNumber` |
| `valor` | top-level `value` + parse reais |
| `dataEmissao` / `dataVencimento` | `issuedAt` / `dueDate` |
| `sacadoCnpj` | top-level `payerCnpj` (digits only) + metadata |
| `sacadoRazaoSocial` | `payerLegalName` |
| `sacadoEmailFinanceiro` | `payerFinancialEmail` |
| Fiscal/proof enums | map PT → backend enum values |
| `valorDesejadoAntecipacao` | `desiredAnticipationValue` (reais number) |
| `declaracoesAntifraudeAceitas` | `antifraudDeclarationsAccepted` |

Document upload booleans are **excluded** from mapper payloads until Module 6.

---

## Adapter pattern (per function)

All functions are HTTP-only. Pattern:

```ts
export async function fetchReceivables(): Promise<ReceivableListItem[]> {
  assertReceivableApiConfigured();
  try {
    const { receivables } = await apiRequest<{ receivables: ReceivableRowDTO[] }>(
      "/v1/receivables",
    );
    return receivables.map(mapReceivableRowToListItem);
  } catch (error) {
    throw mapReceivableApiError(error);
  }
}
```

### `createReceivableDraft(body)`

**Replaces mock:** `createDuplicata()` — but only persists draft (`status=created`), does not submit.

```ts
const { id } = await apiRequest<{ id: string }>("/v1/receivables", {
  method: "POST",
  body: mapFormToCreateBody(formValues),
});
return id;
```

### `updateReceivableDraft(id, body)`

**New** — no direct mock equivalent (mock always created submitted rows).

```ts
await apiRequest(`/v1/receivables/${id}`, {
  method: "PATCH",
  body: mapFormToUpdateBody(formValues),
});
```

### `submitReceivableForReview(id)`

**Replaces mock:** implicit submit in `createDuplicata()` single action.

```ts
await apiRequest(`/v1/receivables/${id}/submit`, { method: "POST" });
```

### `createAndSubmitReceivable(body)`

**Replaces mock:** one-shot create in `NewDuplicataForm.handleSubmit`.

```ts
const result = await apiRequest<{ id: string; status: "under_review" }>(
  "/v1/receivables/submit",
  { method: "POST", body: mapFormToCreateBody(formValues) },
);
return result;
```

### `fetchReceivableById(id)`

**Replaces mock:** `fetchDuplicataById()`.

### `submitRiskDecision(id, { decision, proposedValue? })`

**Replaces mock:** `setDuplicataOfertaAntecipacao()` (offer) and reprove branch of `setDuplicataAnaliseAnalista()`.

### `submitSellerDecision(id, decision)`

**Replaces mock:** `setDuplicataDecisaoCedente()` — maps `accept`/`reject` to backend (not PT aprovado/reprovado).

---

## Auth & error handling

- **Access token:** Bearer via `apiRequest` (`auth: true` default).
- **401:** silent refresh via `POST /v1/auth/refresh` (cookie `dupply_rt`); then session clear.
- **Error body:** `{ error: string }` — no `message` field on receivable routes today.

```ts
// src/domain/receivable/receivable.errors.ts
export class ReceivableError extends Error {
  constructor(
    readonly code: ReceivableErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ReceivableError";
  }
}

const RECEIVABLE_ERROR_MESSAGES: Record<string, string> = {
  seller_not_active: "Seu cadastro ainda não está ativo para cadastrar recebíveis.",
  incomplete_metadata: "Preencha todos os campos obrigatórios antes de enviar.",
  metadata_locked: "Este recebível não pode mais ser editado.",
  seller_and_payer_must_differ: "O CNPJ do sacado deve ser diferente do seu CNPJ.",
  proposed_value_required_for_offer: "Informe o valor da proposta.",
  proposed_value_not_allowed_for_reprove: "Valor proposto não permitido ao reprovar.",
  receivable_not_found: "Recebível não encontrado.",
  forbidden: "Você não tem permissão para esta operação.",
  not_owner: "Você não tem permissão para esta operação.",
  invalid_receivable_transition: "Esta ação não é permitida no status atual.",
  receivable_deleted: "Este recebível não está mais disponível.",
  network: "Não foi possível conectar. Tente novamente.",
};
```

**Page pattern:**

```tsx
try {
  await submitReceivableForReview(draftId);
  toast.success("Recebível enviado para análise");
} catch (err) {
  if (err instanceof ReceivableError) {
    toast.error(err.message);
  }
}
```

---

## Status labels (UI — Portuguese)

| Backend `status` | UI label |
|------------------|----------|
| `created` | Rascunho |
| `under_review` | Em análise |
| `offer` | Proposta em aberto |
| `reproved` | Reprovada |
| `rejected` | Proposta recusada |
| `approved` | Em análise do sacado |
| `processing` | Transação em andamento |
| `completed` | Transação completa |

Payer/platform statuses beyond `rejected` may appear on list/detail with badge only — no actions in v1.

---

## Migration plan

| Phase | Action | Risk |
|-------|--------|------|
| A | Add `receivable.dto.ts`, `domain/receivable/*`, `receivable.service.ts` (HTTP-only) | None |
| B | Rename/migrate pages and components from `duplicata.*` → `receivable.*`; wire service | Medium |
| C | Update routes (`/seller/receivables/*`, `/analyst/receivables/*`); add redirects from `/duplicatas/*` | Low |
| D | Delete `duplicata.*` mock stack and unused seller/analyst imports of legacy EN demo types | Low |
| E | Manual verification with backend + `npm run typecheck` | Medium |

No `resolveApiMode()` gate — module is HTTP-only once merged.

---

## Pages & components consuming this service

| File | Functions used | Notes |
|------|----------------|-------|
| `src/pages/seller/SellerReceivablesPage.tsx` (rename from `SellerDuplicatasPage`) | `fetchReceivables()`, `submitSellerDecision()` | List + offer response wizard |
| `src/pages/seller/NewReceivablePage.tsx` | gate via `canSellerRegisterReceivables()` | Loads seller profile |
| `src/components/forms/NewReceivableForm.tsx` | `createReceivableDraft`, `updateReceivableDraft`, `submitReceivableForReview`, `createAndSubmitReceivable` | Save vs Submit actions |
| `src/pages/seller/SellerDashboardPage.tsx` | `fetchReceivables()` | Preview count |
| `src/pages/seller/SellerValidationPage.tsx` | `fetchReceivables()` | Overview count |
| `src/pages/analyst/AnalystReceivablesPage.tsx` | `fetchReceivables()` | All rows |
| `src/pages/analyst/AnalystReceivableDetailPage.tsx` | `fetchReceivableById`, `submitRiskDecision` | Offer / reprove |
| `src/pages/analyst/AnalystDashboardPage.tsx` | `fetchReceivables()` | Pending counts |

**Out of scope (keep legacy mocks):** `ConfirmationPage`, `AdminReceivablesPage`, `receivables.service.ts` (EN demo) — unchanged in v1.

---

## Open items

- [x] Confirm endpoint paths — `/v1/receivables` v2 routes in backend
- [x] Confirm response DTO — raw `ReceivableRow`; metadata JSON string
- [x] Confirm error shape — `{ error: string }`
- [x] Atomic submit endpoint — `POST /v1/receivables/submit` available
- [ ] Confirm canonical frontend routes `/seller/receivables/*` and `/analyst/receivables/*` with redirects (PO)
- [ ] Confirm PT toast copy for `reproved` vs `rejected` (PO)
- [ ] Enriched list/detail fields (`sellerLegalName`, payer summary) — API-3 follow-up; use parsed metadata for v1
- [ ] Update `.cursor/rules/45-money-values.mdc` to reais (not centavos strings) — during implementation (FR-21)
- [ ] PO refresh `INTEGRATIONS.md`, `CONCERNS.md`, backend `API.md` after merge
