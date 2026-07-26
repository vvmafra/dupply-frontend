# Investor Marketplace — Tasks

**Spec:** [spec.md](./spec.md)  
**Design:** [design.md](./design.md)  
**Context:** [context.md](./context.md)  
**Status:** In Progress — implementation landed; mark tasks done after smoke  
**Gate:** `npm run typecheck` (sem test runner — ver TESTING.md; gate manual + typecheck como auth-login-persistence)

---

## Status legend

🔴 todo · 🟡 in progress · 🟢 done · ⏸ blocked

---

## Execution Plan

### Phase 1 — Domain foundation

```
T1 → T2 ─┐
     T3 ─┼→ T5 → T6
     T4 ─┘
```

T2, T3, T4 are `[P]` after T1.

### Phase 2 — Auth + shell

```
T7 → T8 → T9
```

T10 (seller toast) is `[P]` anytime after Phase 1 starts (no code dep on offers).

### Phase 3 — Admin UI

```
T9 ──┬→ T11
     ├→ T12
     └→ T13
```

T11–T13 `[P]` after T6 + T9.

### Phase 4 — Investor UI

```
T6 + T9 ──┬→ T14 → T15
          ├→ T16
          └→ T17
```

T14 can start after T1 (card is presentational); T15 needs T6+T9+T14. T16/T17 `[P]` after T6+T9.

### Phase 5 — Gate

```
T11–T17 → T18
```

---

## Task Breakdown

### T1 — Offer domain types + PT constants 🔴

**What:** Create English types (`Offer`, `Investment`, statuses, `RiskLevel`, inputs) and PT label maps.  
**Where:** `src/domain/offer/offer.types.ts`, `src/domain/offer/offer.constants.ts`  
**Depends on:** None  
**Reuses:** Style of `domain/duplicata/duplicata.types.ts` + `duplicata-analise.constants.ts`  
**Requirement:** INV-03, INV-04, INV-05, INV-06  

**Done when:**

- [ ] Types match design.md data models
- [ ] Status/risk labels exported for UI (PT)
- [ ] No React imports
- [ ] `npm run typecheck` passes

**Tests:** none (no runner)  
**Gate:** `npm run typecheck`  
**Verify:** types importable from `@/domain/offer/...`

---

### T2 — Offer economics helpers `[P]` 🔴

**What:** Pure helpers for target, quotas, return %, progress, FIDC gap.  
**Where:** `src/domain/offer/offer-economics.helpers.ts`  
**Depends on:** T1  
**Reuses:** `calcValorLiquidoCedente` from `duplicata-antecipacao.helpers.ts`  
**Requirement:** INV-03, INV-04, INV-06  

**Done when:**

- [ ] All functions from design exist and are pure
- [ ] Default target uses analyst discount + face
- [ ] Estimated return = discount − platform spread
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T3 — Offer close resolver `[P]` 🔴

**What:** Pure `resolveOfferClose` → `failed` | `full` | `partial_with_fidc` + `fidcAmount`.  
**Where:** `src/domain/offer/offer-close.helpers.ts`  
**Depends on:** T1  
**Reuses:** None (pure)  
**Requirement:** INV-06  

**Done when:**

- [ ] Below min → failed, fidc 0
- [ ] min ≤ raised < target → partial_with_fidc, gap amount
- [ ] raised ≥ target → full, fidc 0
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T4 — Risk level mapper `[P]` 🔴

**What:** Map `scoreDuplicata` → `RiskLevel` with documented thresholds.  
**Where:** `src/domain/offer/offer-risk.helpers.ts`  
**Depends on:** T1  
**Reuses:** None  
**Requirement:** INV-04  

**Done when:**

- [ ] `mapScoreToRiskLevel` exported with constants documented in file
- [ ] No counterparty names involved
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T5 — Create-offer + invest Zod schemas 🔴

**What:** Zod schemas for admin create offer and investor subscribe (PT messages).  
**Where:** `src/domain/offer/offer.schema.ts`, `src/domain/offer/invest.schema.ts`  
**Depends on:** T1, T2  
**Reuses:** `auth-login.schema.ts` / seller-registration schema style  
**Requirement:** INV-03, INV-05  

**Done when:**

- [ ] Create schema validates spread ≤ analyst discount, min ≤ target, deadline future, quotaPrice > 0
- [ ] Invest schema validates quotaCount ≥ 1 integer
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T6 — `offer.service` mock store + optional seeds 🔴

**What:** In-memory offer/investment store with all service APIs from design.  
**Where:** `src/services/offer.service.ts`, optional `src/data/offers.mock.ts`  
**Depends on:** T2, T3, T4, T5  
**Reuses:** `duplicata.service.ts` mock pattern; reads via `fetchDuplicataById` / `fetchAllDuplicatas`  
**Requirement:** INV-02, INV-03, INV-05, INV-06, INV-08  

**Done when:**

- [ ] `listDuplicatasReadyForOffer`, `createOffer`, `investInOffer`, `closeOffer`, `closeExpiredOffers`, list/get helpers work
- [ ] 1:1 offer per duplicata enforced
- [ ] Close applies resolver; failed → investments `refunded`; partial → `fidcBackfillAmount` + `disbursed`
- [ ] Hitting target via invest auto-closes as full
- [ ] Reads return clones
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`  
**Verify:** Manual call sequence in console or temporary script optional

---

### T7 — `ROUTES.investor` + `ROUTES.admin.offers` 🔴

**What:** Add route constants only (no App wiring yet).  
**Where:** `src/lib/routes.ts`  
**Depends on:** None  
**Reuses:** Existing `ROUTES` shape  
**Requirement:** INV-01, INV-03, INV-08  

**Done when:**

- [ ] Paths match design.md
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T8 — Auth profile `investor` + mock seed 🔴

**What:** Extend `UserProfile`, role mapper, profiles, helpers, auth mock seed, ProfileSwitcher, optional MockLoginForm quick-fill.  
**Where:** `auth.types.ts`, `auth-role.mapper.ts`, `auth-profiles.ts`, `auth.helpers.ts`, `auth.service.ts`, `ProfileSwitcher.tsx`, `MockLoginForm.tsx`  
**Depends on:** T7  
**Reuses:** Existing auth mapping patterns  
**Requirement:** INV-01  

**Done when:**

- [ ] `investor` profile selectable in mock
- [ ] `getProfileRedirect("investor")` → opportunities route
- [ ] Seed user with `platformRole: "investor"` (e.g. `investor@dupply.com.br`)
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T9 — App routes + Sidebar nav 🔴

**What:** Register ProtectedRoute pages placeholders or real pages as available; wire investor + admin offer nav.  
**Where:** `src/App.tsx`, `src/components/layout/Sidebar.tsx`  
**Depends on:** T7, T8  
**Reuses:** Existing `ProtectedRoute` + `AppShell` pattern  
**Requirement:** INV-01  

**Notes:** May land stub pages first if T11–T17 not ready; prefer wiring real pages in same PR wave as UI tasks. If stubs: minimal “Em breve” is OK only until T11+ land in same execution session — prefer implementing T9 together with first admin/investor page that exists.

**Done when:**

- [ ] Investor/admin offer routes use `ROUTES.*` (no magic strings for new paths)
- [ ] Sidebar shows investor + admin offer links (PT)
- [ ] Wrong profile blocked by guard
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T10 — Seller accept toast/copy `[P]` 🔴

**What:** Change post-accept copy so it does not promise platform payout in ~2h; reflect listing/funding.  
**Where:** `SellerDuplicatasPage.tsx` and/or `SellerDuplicataOperacaoWizardDialog.tsx`  
**Depends on:** None  
**Reuses:** Existing toast API  
**Requirement:** INV-02  

**Done when:**

- [ ] Approve toast/copy updated (PT)
- [ ] Reject path unchanged in meaning
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T11 — Admin ready-for-offer queue `[P]` 🔴

**What:** Page listing duplicatas eligible for offer → link to create.  
**Where:** `src/pages/admin/AdminOffersReadyPage.tsx`  
**Depends on:** T6, T9  
**Reuses:** Admin list table patterns (`AdminSellersPage`)  
**Requirement:** INV-02, INV-03  

**Done when:**

- [ ] Lists only `aprovado` without existing offer
- [ ] CTA navigates to create route with `duplicataId`
- [ ] Empty state in PT
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T12 — Admin create offer form `[P]` 🔴

**What:** Create offer page with prefill + Zod validation + live estimated investor return.  
**Where:** `src/pages/admin/AdminCreateOfferPage.tsx` (+ small form component under `components/admin/` if needed)  
**Depends on:** T5, T6, T9  
**Reuses:** RHF + `safeParse` pattern from seller registration  
**Requirement:** INV-03  

**Done when:**

- [ ] Prefills face, analyst discount, default target
- [ ] Fields: quotaPrice, minAmount, deadline, platformSpreadPercent
- [ ] Live estimated return visible
- [ ] Success → offer `fundraising` + redirect to admin detail or list
- [ ] Duplicate offer blocked with PT error
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T13 — Admin offers list + detail + close `[P]` 🔴

**What:** List all offers; detail with progress, investments, FIDC share; close button; optional simulate-deadline control.  
**Where:** `src/pages/admin/AdminOffersPage.tsx`, `src/pages/admin/AdminOfferDetailPage.tsx`  
**Depends on:** T6, T9  
**Reuses:** Analyst list→detail pattern; `Progress`  
**Requirement:** INV-06, INV-08  

**Done when:**

- [ ] List shows status badges (PT)
- [ ] Detail calls `closeExpiredOffers` on load
- [ ] Close applies hybrid rules; UI shows investor vs FIDC amounts after close
- [ ] Simulate deadline (if included) is small and demo-only
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T14 — `OpportunityOfferCard` `[P]` 🔴

**What:** Card UI: risk level, target, estimated return, quota price, time left, progress + min marker, CTA. No names.  
**Where:** `src/components/investor/OpportunityOfferCard.tsx`  
**Depends on:** T1  
**Reuses:** `components/ui/progress.tsx`, existing card/button styles  
**Requirement:** INV-04  

**Done when:**

- [ ] Renders props from `Offer` without sacado/cedente names
- [ ] Progress reflects raised/target; min indicated
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T15 — Investor opportunities page 🔴

**What:** Grid of fundraising offers; run `closeExpiredOffers` then list.  
**Where:** `src/pages/investor/InvestorOpportunitiesPage.tsx`  
**Depends on:** T6, T9, T14  
**Reuses:** Page load patterns from seller/analyst lists  
**Requirement:** INV-04  

**Done when:**

- [ ] Only `fundraising` offers shown (after expiry close)
- [ ] Empty state PT
- [ ] Card CTA → offer detail
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T16 — Investor offer detail + invest form `[P]` 🔴

**What:** Detail page (no names) + invest quota form via Zod → `investInOffer`.  
**Where:** `src/pages/investor/InvestorOfferDetailPage.tsx`, `src/components/investor/InvestQuotaForm.tsx`  
**Depends on:** T5, T6, T9  
**Reuses:** Auth user id from session for `investorUserId`  
**Requirement:** INV-05  

**Done when:**

- [ ] Caps quotas to remaining
- [ ] Success updates raised; toast PT
- [ ] Rejects non-fundraising / oversubscribe with PT errors
- [ ] Auto-close when target hit reflected after refresh/navigate
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T17 — Investor investments list `[P]` 🔴

**What:** Minimal “meus investimentos” list with status (active / refunded / settled).  
**Where:** `src/pages/investor/InvestorInvestmentsPage.tsx`  
**Depends on:** T6, T9  
**Reuses:** Simple table/list admin patterns  
**Requirement:** INV-05 (minimal; INV-07 deferred)  

**Done when:**

- [ ] Lists current investor’s investments
- [ ] Shows offer ref, quotas, amount, status PT
- [ ] Empty state PT
- [ ] `npm run typecheck` passes

**Tests:** none  
**Gate:** `npm run typecheck`

---

### T18 — Feature gate + docs touch 🔴

**What:** Final `typecheck`/`build`; mark design approved statuses; note investor back in PROJECT.md personas (brief).  
**Where:** `.specs/project/PROJECT.md`, feature spec/design status fields  
**Depends on:** T10–T17  
**Reuses:** N/A  
**Requirement:** Success criteria  

**Done when:**

- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] PROJECT.md no longer says investor is out of scope
- [ ] Spec/design status → Approved / Implemented as appropriate
- [ ] Traceability IDs updated toward Verified for P1 items after manual demo checklist

**Tests:** none  
**Gate:** `npm run typecheck` && `npm run build`  

**Manual demo checklist (Verify):**

1. Login investor seed → opportunities  
2. Admin: ready queue → create offer → appears for investor  
3. Invest → progress bar moves → investments list  
4. Close partial → FIDC gap shown + disbursed  
5. Close below min → failed + refunded  

---

## Parallel Execution Map

```
Phase 1:
  T1 ──→ T2 [P]
     ├──→ T3 [P] ──→ T5 ──→ T6
     └──→ T4 [P]

Phase 2:
  T7 ──→ T8 ──→ T9
  T10 [P] (independent)

Phase 3 (after T6+T9):
  T11 [P]
  T12 [P]
  T13 [P]

Phase 4:
  T14 [P] (after T1; typically with Phase 3)
  T15 (after T6+T9+T14)
  T16 [P] (after T6+T9)
  T17 [P] (after T6+T9)

Phase 5:
  T18
```

---

## Validation gates (pre-approval)

### 1) Granularity check

| Task | Scope | Status |
|------|-------|--------|
| T1 types+constants | 2 cohesive domain files | ✅ |
| T2 economics | 1 helper module | ✅ |
| T3 close | 1 helper module | ✅ |
| T4 risk | 1 helper module | ✅ |
| T5 schemas | 2 cohesive schema files | ✅ |
| T6 service+seeds | 1 service (+ optional mock data) | ✅ |
| T7 routes | 1 file | ✅ |
| T8 auth seed | cohesive auth touchpoints | ⚠️ OK (same feature vertical) |
| T9 App+Sidebar | 2 shell files | ✅ |
| T10 toast | copy change | ✅ |
| T11 ready page | 1 page | ✅ |
| T12 create page | 1 page (+ optional form cmp) | ✅ |
| T13 list+detail | 2 related admin pages | ⚠️ OK (same vertical) |
| T14 card | 1 component | ✅ |
| T15 opportunities | 1 page | ✅ |
| T16 detail+form | page + form | ⚠️ OK (same vertical) |
| T17 investments | 1 page | ✅ |
| T18 gate/docs | wrap-up | ✅ |

### 2) Diagram ↔ Depends on cross-check

| Task | Depends on (body) | Diagram | Status |
|------|-------------------|---------|--------|
| T1 | None | root | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T1 | T1→T3 | ✅ |
| T4 | T1 | T1→T4 | ✅ |
| T5 | T1, T2 | T2→T5 (T1 via T2) | ✅ |
| T6 | T2,T3,T4,T5 | →T6 | ✅ |
| T7 | None | Phase2 root | ✅ |
| T8 | T7 | T7→T8 | ✅ |
| T9 | T7, T8 | T8→T9 | ✅ |
| T10 | None | [P] independent | ✅ |
| T11 | T6, T9 | after T6+T9 | ✅ |
| T12 | T5, T6, T9 | after T6+T9 | ✅ |
| T13 | T6, T9 | after T6+T9 | ✅ |
| T14 | T1 | [P] early | ✅ |
| T15 | T6, T9, T14 | →T15 | ✅ |
| T16 | T5, T6, T9 | [P] | ✅ |
| T17 | T6, T9 | [P] | ✅ |
| T18 | T10–T17 | final | ✅ |

### 3) Test co-location vs TESTING.md

| Task | Layer | Matrix | Task says | Status |
|------|-------|--------|-----------|--------|
| T1–T5 domain | Domain helpers/schemas | unit *(runner N/A)* | none + typecheck | ✅ OK — same waiver as auth-login-persistence; no Vitest |
| T6 service | Services mock | unit/integration *(N/A)* | none + typecheck | ✅ OK |
| T8–T17 UI/auth | Components/pages | component/e2e *(N/A)* | none + typecheck | ✅ OK |
| T18 | docs + build | build gate | typecheck+build | ✅ OK |

---

## Requirement → tasks

| ID | Tasks |
|----|-------|
| INV-01 | T7, T8, T9 |
| INV-02 | T6, T10, T11 |
| INV-03 | T1, T2, T5, T6, T11, T12 |
| INV-04 | T1, T2, T4, T14, T15 |
| INV-05 | T5, T6, T16, T17 |
| INV-06 | T3, T6, T13 |
| INV-07 | Deferred |
| INV-08 | T13 |
| INV-09 | Deferred |

**Coverage:** P1 IDs mapped; INV-07/09 deferred per design.
