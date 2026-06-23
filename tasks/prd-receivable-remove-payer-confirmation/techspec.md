# Tech Spec — Remove Payer Confirmation Gate (Frontend)

## Overview

Align seller and risk-analyst receivable UI with the backend 10-status lifecycle after the payer confirmation gate was removed: seller accept transitions `offer → confirmed` (not `approved`), settlement statuses are display-only, and legacy `approved` / `payer_rejected` values remain readable on GET paths without workflow actions. Deprecate the public payer confirmation page so it no longer presents a mock “confirm awareness” flow.

**In scope:** domain status model split (active vs legacy), PT label/badge updates, seller accept toast and dashboard metric buckets, analyst list/detail display (no new actions), `ConfirmationPage` static deprecation, amendment of `tasks/prd-receivables-integration/prd.md` lifecycle sections, delta `integration-spec.md` for status contract.

**Out of scope:** payer portal, real magic-link token validation, platform settlement UI, admin receivable HTTP integration (`AdminReceivablesPage` legacy EN demo — OQ-5 deferred), mock-mode updates to legacy EN `receivables.service.ts` fixtures (OQ-4), backend changes (already shipped).

Reference: [`tasks/prd-receivable-remove-payer-confirmation/prd.md`](prd.md), backend [`dupply-backend/tasks/prd-receivable-remove-payer-confirmation/techspec.md`](../../../dupply-backend/tasks/prd-receivable-remove-payer-confirmation/techspec.md), amends [`tasks/prd-receivables-integration/prd.md`](../prd-receivables-integration/prd.md).

**HTTP-only for seller/analyst:** `receivable.service.ts` has no mock branch — changes are contract/display alignment; no new endpoints.

---

## Architecture overview

```
UI (pages/ + components/)
  └── SellerReceivablesPage, SellerDashboardSummary, Analyst* pages, ConfirmationPage
  └── ReceivableStatusBadge
      └── consumes domain/receivable/receivable.status.ts
      └── consumes receivable.service.ts (HTTP — unchanged API calls)

Services (services/receivable.service.ts)
  └── submitSellerDecision() — unchanged; backend now returns confirmed on accept
  └── legacy receivables.service.ts — isolated to ConfirmationPage deprecation only

Domain (domain/receivable/)
  └── receivable.types.ts — active + legacy status unions
  └── receivable.status.ts — labels, colors, bucket helpers
  └── receivable.mapper.ts — passes through status from DTO (no transition logic)

Lib (lib/routes.ts)
  └── confirmation route kept for bookmarked URLs (static deprecation page)
```

```
Seller accept (HTTP)
  → SellerReceivablesPage.handleOfferDecision("accept")
      → submitSellerDecision(id, "accept")   // POST .../seller-decision
      → refreshItems()                        // GET list — status = confirmed
      → toast.success (updated copy)
      → ReceivableStatusBadge → getReceivableStatusLabel("confirmed") → "Confirmada"
```

Addresses all FR-1 … FR-17 (see component sections).

---

## Component design

### 1. Domain status model — `src/domain/receivable/receivable.types.ts`

**What changes:** Split active machine statuses from legacy read-only values; keep a single `ReceivableStatus` union for UI consumption.

```typescript
// Before — flat union; approved treated as active post-accept state
export type ReceivableStatus =
  | "created"
  | "under_review"
  // ...
  | "approved"
  | "payer_rejected"
  | "confirmed"
  // ...

// After
export const RECEIVABLE_ACTIVE_STATUSES = [
  "created",
  "under_review",
  "reproved",
  "offer",
  "rejected",
  "confirmed",
  "processing",
  "completed",
  "payer_settled",
  "overdue",
] as const;

export type ReceivableActiveStatus = (typeof RECEIVABLE_ACTIVE_STATUSES)[number];

/** Historical API values — display only; no UI transitions (OQ-1, FR-2). */
export const LEGACY_RECEIVABLE_STATUSES = {
  APPROVED: "approved",
  PAYER_REJECTED: "payer_rejected",
} as const;

export type LegacyReceivableStatus =
  (typeof LEGACY_RECEIVABLE_STATUSES)[keyof typeof LEGACY_RECEIVABLE_STATUSES];

export type ReceivableStatus = ReceivableActiveStatus | LegacyReceivableStatus;

export function isLegacyReceivableStatus(
  status: ReceivableStatus,
): status is LegacyReceivableStatus {
  return (
    status === LEGACY_RECEIVABLE_STATUSES.APPROVED ||
    status === LEGACY_RECEIVABLE_STATUSES.PAYER_REJECTED
  );
}
```

**Justification:** Mirrors backend `RECEIVABLE_STATUS` + `LEGACY_RECEIVABLE_STATUSES`. UI code can branch on `isLegacyReceivableStatus` to suppress actions without removing types from GET responses.

Addresses: **FR-1, FR-2, FR-16**.

---

### 2. Status labels, colors, and metric buckets — `src/domain/receivable/receivable.status.ts`

**What changes:** Reorder labels so `confirmed` is the primary post-accept success state; map legacy `approved` to the same label/color as `confirmed` (OQ-1); add shared bucket constants for dashboard metrics.

```typescript
export const RECEIVABLE_STATUS_LABELS: Record<ReceivableStatus, string> = {
  created: "Rascunho",
  under_review: "Em análise",
  offer: "Proposta em aberto",
  reproved: "Reprovada",
  rejected: "Proposta recusada",
  confirmed: "Confirmada",
  processing: "Transação em andamento",
  completed: "Transação completa",
  payer_settled: "Liquidada",
  overdue: "Em atraso",
  // Legacy — display only (OQ-1: approved ≡ confirmed after backend migration)
  approved: "Confirmada",
  payer_rejected: "Recusada pelo sacado (legado)",
};

/** Post-offer success path — for dashboard "Confirmadas" bucket (FR-9). */
export const POST_ACCEPT_IN_PROGRESS_STATUSES: readonly ReceivableStatus[] = [
  "confirmed",
  "processing",
  "completed",
  "payer_settled",
  "approved", // legacy rows count as confirmed-equivalent for metrics
] as const;

export const TERMINAL_FAILURE_STATUSES: readonly ReceivableStatus[] = [
  "reproved",
  "rejected",
  "payer_rejected",
] as const;

export function getReceivableStatusColor(status: ReceivableStatus): string {
  const colors: Record<ReceivableStatus, string> = {
    // ... unchanged for pre-offer statuses ...
    confirmed: "text-success bg-success/20 border-success/40",
    processing: "text-warning bg-warning/20 border-warning/40",
    completed: "text-success bg-success/20 border-success/40",
    payer_settled: "text-success bg-success/20 border-success/40",
    overdue: "text-destructive bg-destructive/20 border-destructive/40",
    // Legacy — same success styling as confirmed; failure for payer_rejected
    approved: "text-success bg-success/20 border-success/40",
    payer_rejected: "text-destructive bg-destructive/20 border-destructive/40",
  };
  return colors[status];
}
```

Remove `approved: "text-info ..."` — it must not appear as the primary post-accept “waiting on payer” state (FR-5).

Addresses: **FR-3, FR-4, FR-5, FR-9**.

---

### 3. DTO status union — `src/services/receivable.dto.ts`

**What changes:** Document legacy values in `ReceivableStatusDTO`; no runtime change to service functions.

```typescript
/** Active backend statuses + legacy read-only values still returned by GET. */
export type ReceivableStatusDTO =
  | "created"
  | "under_review"
  | "reproved"
  | "offer"
  | "rejected"
  | "confirmed"
  | "processing"
  | "completed"
  | "payer_settled"
  | "overdue"
  | "approved"        // legacy
  | "payer_rejected"; // legacy
```

`receivable.mapper.ts` continues `status: dto.status` assignment — union remains compatible.

Addresses: **FR-1, FR-2, FR-16**.

---

### 4. Seller accept feedback — `src/pages/seller/SellerReceivablesPage.tsx`

**What changes:** Update success toast after accept; list refresh behavior is already correct (`refreshItems()` after `submitSellerDecision`).

```tsx
// Before
if (decision === "accept") {
  toast.success("Proposta aceita", {
    description: "O recebível segue para análise do sacado.",
  });
}

// After
if (decision === "accept") {
  toast.success("Proposta aceita", {
    description:
      "Recebível confirmado. A operação segue para liquidação.",
  });
}
```

Offer wizard (`SellerReceivableOfferWizardDialog`) has no payer-wait copy — no change required (FR-8).

Addresses: **FR-6, FR-7, FR-8, FR-13**.

---

### 5. Dashboard metrics — `src/components/seller/SellerDashboardSummary.tsx`

**What changes:** Use domain bucket constants; rename metric title from **Aprovadas** to **Confirmadas** (OQ-3).

```tsx
import {
  POST_ACCEPT_IN_PROGRESS_STATUSES,
  TERMINAL_FAILURE_STATUSES,
} from "@/domain/receivable/receivable.status";

export function SellerDashboardSummary({ receivables }: SellerDashboardSummaryProps) {
  // ...
  const confirmedCount = receivables.filter((item) =>
    POST_ACCEPT_IN_PROGRESS_STATUSES.includes(item.status),
  ).length;
  const rejectedCount = receivables.filter((item) =>
    TERMINAL_FAILURE_STATUSES.includes(item.status),
  ).length;

  return (
    // ...
    <MetricCard title="Confirmadas" value={confirmedCount} icon={CheckCircle2} accent="text-success" />
    // ...
  );
}
```

Addresses: **FR-9, FR-3** (indirect — metric aligns with `confirmed` vocabulary).

---

### 6. Status badge — `src/components/receivable/ReceivableStatusBadge.tsx`

**What changes:** None — already delegates to `getReceivableStatusLabel` / `getReceivableStatusColor`. Verify settlement statuses render after domain updates.

Used by: `SellerReceivablesPage`, `AnalystReceivablesPage`, `AnalystReceivableDetailPage`.

Addresses: **FR-3, FR-5, FR-10**.

---

### 7. Analyst flows — `src/pages/analyst/AnalystReceivablesPage.tsx`, `AnalystReceivableDetailPage.tsx`

**What changes:** Display-only — no code changes expected once domain labels are updated. Verify:

- List/detail badges show **Confirmada** and settlement labels when API returns those statuses.
- Offer/reprove wizards remain gated on `under_review` / `offer` only (existing `canOffer` / status checks unchanged).
- No copy references payer magic-link as a blocking step after seller accept (grep audit — none found today).

Addresses: **FR-10, FR-11**.

---

### 8. Deprecate payer confirmation page — `src/pages/ConfirmationPage.tsx`, `src/App.tsx`

**What changes (OQ-2):** Keep route `/confirmation/:id` for bookmarked email links; replace interactive mock flow with a static deprecation message aligned with backend `410 payer_confirmation_removed`. Remove all imports from legacy `receivables.service.ts`.

```tsx
// Before — mock fetch + confirmDebtorAwareness mutation
import { fetchReceivableById, confirmDebtorAwareness } from "@/services/receivables.service";

// After — static public message; no service calls
import { PublicShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

export function ConfirmationPage() {
  return (
    <PublicShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center max-w-md mx-auto">
        <h1 className="text-lg font-semibold">Confirmação do sacado não é mais necessária</h1>
        <p className="text-sm text-muted-foreground">
          A confirmação do sacado não bloqueia mais a liquidação do recebível.
          Após o cedente aceitar a proposta, a operação segue automaticamente para confirmação e liquidação.
        </p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.home}>Voltar ao início</Link>
        </Button>
      </div>
    </PublicShell>
  );
}
```

`App.tsx` keeps `<Route path={ROUTES.confirmation.path} element={<ConfirmationPage />} />` — route is not removed.

`receivables.service.ts` / `confirmDebtorAwareness` remain for legacy admin EN demo only; no seller/analyst import path (FR-14).

Addresses: **FR-12, FR-13, FR-14**.

---

### 9. Integration spec delta — `tasks/prd-receivable-remove-payer-confirmation/integration-spec.md` *(new)*

**What changes:** Short delta doc amending parent [`tasks/prd-receivables-integration/integration-spec.md`](../prd-receivables-integration/integration-spec.md):

| Section | Update |
|---------|--------|
| Lifecycle | `offer → confirmed \| rejected` (seller accept); remove payer magic-link gate |
| `ReceivableStatusDTO` | Keep `approved` / `payer_rejected` as legacy GET-only |
| Status labels table | Replace `approved → Em análise do sacado` with `confirmed → Confirmada`; add settlement + legacy rows per FR-3/FR-4 |
| Deprecated endpoint | Note `POST /v1/payers/magic-link/respond` → **410 Gone** (`payer_confirmation_removed`) — frontend does not call |
| Out of scope | `ConfirmationPage` no longer uses mock service; static deprecation only |

No changes to `receivable.service.ts` function signatures.

Addresses: **FR-15, FR-17** (integration contract).

---

### 10. Parent PRD amendment — `tasks/prd-receivables-integration/prd.md`

**What changes:** Update lifecycle diagram, success metrics, and status table to 10-status machine; add cross-reference that this PRD supersedes payer-gate sections.

Minimum edits:

- Overview lifecycle block: `offer → confirmed | rejected`; remove `approved → confirmed | payer_rejected` payer step.
- Success metric: “UI reflects `confirmed` or `rejected`” (not `approved`).
- Main flow step 6: seller accept → `confirmed`.

Addresses: **FR-17**.

---

## Data flow

```
User: Seller clicks "Aceitar proposta"
  → SellerReceivableOfferWizardDialog.onDecision("accept")
  → SellerReceivablesPage.handleOfferDecision("accept")
      → submitSellerDecision(id, "accept")          // receivable.service.ts
          → apiRequest POST /v1/receivables/:id/seller-decision
          → backend: offer → confirmed
      → fetchReceivables() → mapReceivableRowToListItem
      → setItems (badge: Confirmada)
      → toast.success (liquidação copy)

User: Opens legacy /confirmation/:id link
  → ConfirmationPage (static deprecation — no HTTP, no mock mutation)

User: Analyst views list after seller accept
  → fetchReceivables() → status confirmed → ReceivableStatusBadge "Confirmada"
```

---

## Files changed

| File | Change type |
|------|-------------|
| `src/domain/receivable/receivable.types.ts` | Modified |
| `src/domain/receivable/receivable.status.ts` | Modified |
| `src/services/receivable.dto.ts` | Modified (comments / ordering) |
| `src/pages/seller/SellerReceivablesPage.tsx` | Modified |
| `src/components/seller/SellerDashboardSummary.tsx` | Modified |
| `src/pages/ConfirmationPage.tsx` | Modified |
| `tasks/prd-receivable-remove-payer-confirmation/integration-spec.md` | Added |
| `tasks/prd-receivables-integration/prd.md` | Modified |
| `tasks/prd-receivables-integration/integration-spec.md` | Modified (status table + lifecycle note) |

**Unchanged (verify only):** `src/services/receivable.service.ts`, `src/domain/receivable/receivable.mapper.ts`, `src/components/receivable/ReceivableStatusBadge.tsx`, analyst pages, `src/services/receivables.service.ts` (legacy admin).

---

## Impact analysis

- **Auth/navigation:** No guard or profile changes. Seller/analyst routes unchanged.
- **Other personas:** Admin `AdminReceivablesPage` keeps legacy EN demo — out of scope (OQ-5). Landing page “Notificação ao sacado” marketing copy unchanged (informational, not lifecycle-blocking).
- **Service adapter:** `receivable.service.ts` remains HTTP-only; no `resolveApiMode()` gate needed. Legacy `receivables.service.ts` decoupled from `ConfirmationPage`.
- **TypeScript:** Stricter active/legacy split; no `any` or unsafe casts. `Record<ReceivableStatus, string>` must include all union members after refactor.
- **Backend dependency:** Requires deployed backend PRD (`seller-decision accept → confirmed`; magic-link respond → 410).

---

## Test strategy

_(No automated test runner configured — manual verification steps.)_

### Manual — Seller accept (HTTP mode)

| Step | Expected result |
|------|-----------------|
| Log in as active seller; open receivable with `status=offer` | Offer wizard opens |
| Accept proposal | Toast: “Recebível confirmado. A operação segue para liquidação.” (no sacado/wait copy) |
| List refreshes | Badge **Confirmada** (`confirmed`), not “Em análise do sacado” |
| Seller dashboard | **Confirmadas** metric includes the receivable |

### Manual — Analyst display (HTTP mode)

| Step | Expected result |
|------|-----------------|
| After seller accept, analyst opens receivables list | Row shows **Confirmada** |
| Open detail | Status badge correct; no payer-confirmation blocking copy |
| Offer/reprove on `under_review` / `offer` | Unchanged behavior |

### Manual — Legacy status display

| Step | Expected result |
|------|-----------------|
| If API returns `approved` (historical row) | Badge **Confirmada**, success styling; no seller/analyst actions |
| If API returns `payer_rejected` | Badge **Recusada pelo sacado (legado)**; failure styling |

### Manual — Confirmation page deprecation

| Step | Expected result |
|------|-----------------|
| Navigate to `/confirmation/any-id` | Static deprecation message; no confirm button; no loading spinner from mock fetch |
| No network calls to `/v1/receivables` or mock `receivables.service` | DevTools network tab clean |

### Manual — Settlement statuses (display-only)

| Step | Expected result |
|------|-----------------|
| Receivable in `processing`, `completed`, `payer_settled`, or `overdue` (if present on API) | Correct PT label on list/detail; no new action buttons |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| **OQ-1** Legacy `approved` label | Show **Confirmada** with same badge styling as `confirmed` — equivalent semantics after backend migration (`approved → confirmed`). |
| **OQ-2** `ConfirmationPage` strategy | **Keep URL** with static deprecation message (mirrors backend 410 narrative); remove mock fetch and confirm action. |
| **OQ-3** Dashboard metric rename | Rename **Aprovadas** → **Confirmadas**; bucket uses `POST_ACCEPT_IN_PROGRESS_STATUSES` (`confirmed` + settlement + legacy `approved`). |
| **OQ-4** Mock mode fixtures | Leave legacy EN `receivables.mock.ts` / `receivables.service.ts` unchanged; seller/analyst HTTP path is unaffected. Document exception in integration-spec delta. |
| **OQ-5** Admin receivable list | **Defer** — minimal badge alignment not in this slice; admin remains on legacy EN demo model. |
