# Investor Marketplace — Context

**Gathered:** 2026-07-26  
**Spec:** `.specs/features/investor-marketplace/spec.md`  
**Status:** Ready for design

---

## Feature Boundary

Mock-first frontend marketplace: after a seller accepts anticipation terms, an **admin** creates a 1:1 **Offer** on that receivable; **investors** (seed/login only) browse **opportunity cards** with progress, subscribe quotas, and closing follows hybrid rules (fail below minimum; partial + **FIDC backfill** gap; full at 100%). Platform spread is set on offer creation inside the analyst discount. No real HTTP/KYC/CVM in this feature.

---

## Implementation Decisions

### Language / code conventions

- **Code in English** (identifiers, domain types, route keys, comments in new code) — keep existing project pattern
- User-facing UI copy remains **Portuguese** (labels, toasts, empty states)

### Investor onboarding

- **Seed + mock login only** — no public registration wizard
- All data in-memory / existing mock services pattern
- At least one demo investor seed for login / profile select

### Offer close + FIDC backfill trigger

- **Both:**
  - Admin can manually **close offer** (applies hybrid rules + FIDC gap if needed)
  - Mock can **auto-close on deadline** (dev/demo control to simulate time passing)
- Same deterministic closing rules either way (INV-06)

### Offer form economics

- Admin sets platform spread within analyst discount
- UI must surface **estimated investor return** (derived / explicit field — design picks presentation; value must be visible at create + on opportunity card/detail)
- Investor does not configure return; they only choose quota quantity

### Opportunity card privacy / disclosure

- **Show:** risk level only (from existing mock scores / analyst signal — exact field mapping in design)
- **Do not show** sacado or cedente names on opportunity cards/detail in this MVP
- Production disclosure (names vs aggregated attributes) tracked in `meeting-questions.md` for the team meeting

### Portfolio depth (clarified)

- **P1 includes** a minimal “my investments” list (required by INV-05 independent test)
- **P2 “carteira”** = richer portfolio page (filters, status detail, history) — **not required in first cut** unless time left; not a blocker for MVP demo
- No separate product fork: first delivery = invest flow + minimal positions list

### Closing hybrid (reaffirmed)

- Below minimum → fail + refund all mock investments
- ≥ minimum and &lt; 100% → disburse + FIDC completes gap to target
- 100% → disburse, no FIDC

### Who creates the offer

- Admin only in MVP

### Meeting questions log

- Living doc: `.specs/features/investor-marketplace/meeting-questions.md`
- Whenever a product/legal/ops doubt appears that should go to the team meeting, **add a bullet** there (do not block the mock on it)

---

## Specific References

- Opportunity UI: **cards** with **progress bar** (funded vs remaining / target)
- Progress should also communicate relation to **minimum** (badge or secondary marker)
- Spread / discount model: analyst sets total discount; offer form sets platform cut; remainder → investor (and FIDC on backfill) return

---

## Deferred Ideas

- Dedicated `ops` / structurer role (admin covers MVP)
- Full investor signup / KYC / suitability
- HTTP/API for offers and investments
- Showing full legal names + documents to investors (compliance-sensitive)
- Seller onboarding copy overhaul (spec P3)
- Secondary market for quotas
