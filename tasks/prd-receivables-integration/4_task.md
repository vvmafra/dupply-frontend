# Task 4.0: Add shared receivable UI components (badge and offer wizards)

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create/rename shared receivable UI components used by both seller and analyst flows: status badge with backend status → PT labels, analyst offer wizard (discount % → liquid preview), and seller offer response wizard. Remove simulated scores; keep TODO placeholders. Corresponds to techspec Component design §3, §15–16.

Depends on: 1.0, 2.0, 3.0

## Requirements

- FR-11: Seller wizard calls `submitSellerDecision(id, "accept" | "reject")`
- FR-15: Analyst wizard keeps discount % input; preview via `calcProposedValueFromDiscount`
- FR-16: Analyst reprove action available from detail page (wired in Task 6)
- FR-17: `ReceivableStatusBadge` uses `RECEIVABLE_STATUS_LABELS`
- FR-25: Remove simulated `scoreUsuario` / `scoreDuplicata`; optional "Score — em breve" placeholder

## Subtasks

- [ ] 4.1 Read `DuplicataAnaliseBadge.tsx`, `AnalystDuplicataApprovalWizardDialog.tsx`, `SellerDuplicataOperacaoWizardDialog.tsx`
- [ ] 4.2 Create `src/components/receivable/ReceivableStatusBadge.tsx`
- [ ] 4.3 Create `src/components/analyst/AnalystReceivableOfferWizardDialog.tsx`
- [ ] 4.4 Create `src/components/seller/SellerReceivableOfferWizardDialog.tsx`
- [ ] 4.5 Verify component renders correctly (manual browser check — can use Storybook or temporary mount in dev)
- [ ] 4.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §3, §15–16** and **integration-spec.md → Status labels**.

**ReceivableStatusBadge:** Accept `status: ReceivableStatus`; render label from `RECEIVABLE_STATUS_LABELS`; variant styling for interactive states (e.g. highlight when `status === "offer"`).

**AnalystReceivableOfferWizardDialog:**

- Props: `open`, `onOpenChange`, `receivable: ReceivableDetail`, `onConfirm(discountPercent: number)`
- Discount % input + liquid value preview via `calcProposedValueFromDiscount(faceValue, discountPercent)`
- Remove score display; optional empty state "Score — em breve"
- Parent (Task 6) calls `submitRiskOffer(id, discountPercent)` on confirm

**SellerReceivableOfferWizardDialog:**

- Props: `open`, `onOpenChange`, `receivable: ReceivableDetail`, `onDecision(decision: "accept" | "reject")`
- Show `proposedValue` from backend (reais, formatted with `formatCurrencyBRL`)
- Parent (Task 5) calls `submitSellerDecision` on approve/reject

Use domain types only — no DTO imports. Old duplicata components remain until Task 7 cleanup.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Status badge renders all in-scope statuses with correct PT labels
- [ ] Analyst wizard shows discount preview without simulated scores
- [ ] Seller wizard shows proposed value and accept/reject actions
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-receivables-integration/prd.md` ← read first
- `tasks/prd-receivables-integration/techspec.md` ← read first
- `tasks/prd-receivables-integration/integration-spec.md` ← read first
- `src/components/receivable/ReceivableStatusBadge.tsx` ← create
- `src/components/analyst/AnalystReceivableOfferWizardDialog.tsx` ← create
- `src/components/seller/SellerReceivableOfferWizardDialog.tsx` ← create
- `src/domain/receivable/receivable.status.ts` ← read (Task 1)
- `src/domain/receivable/receivable-antecipacao.helpers.ts` ← read (Task 1)
- `src/components/duplicata/DuplicataAnaliseBadge.tsx` ← read (replace)
- `src/components/analyst/AnalystDuplicataApprovalWizardDialog.tsx` ← read (replace)
- `src/components/seller/SellerDuplicataOperacaoWizardDialog.tsx` ← read (replace)
