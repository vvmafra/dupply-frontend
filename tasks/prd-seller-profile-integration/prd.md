# Product Requirements Document — Seller Profile Integration (Slice A)

**Status:** Draft — backend seller endpoints confirmed (`GET/PATCH /v1/sellers/:id`, `POST /v1/sellers/:id/submit`)

## Overview

The Dupply frontend seller persona (dashboard, validation, duplicata entry points) loads company data exclusively from in-memory mocks via `seller.service.ts`. After a seller logs in through the real auth layer, the UI still displays `MOCK_SELLERS[0]` regardless of the authenticated account — breaking any end-to-end demo where the logged-in user should see their own profile.

The backend already exposes a stable seller contract: `SellerPublicView` with lifecycle status (`created` → `in_review` → `active` → `inactive`), structured metadata (company, legal representative, business relations), and seller-scoped mutations guarded by JWT ownership. This feature wires the logged-in seller's profile into the existing UI through the project's service adapter pattern (mock vs HTTP), mapping backend shapes to the frontend domain model without rewriting pages.

This feature covers **the authenticated seller's own profile** only. Public registration, analyst/admin review queues, document uploads, wallet, and receivables/duplicatas HTTP integration remain separate features.

## Goals

- Load the authenticated seller's real profile in HTTP mode instead of a hard-coded mock row.
- Allow the seller to update editable metadata and submit for platform review via backend endpoints.
- Map backend seller lifecycle status to existing UI validation/onboarding semantics so dashboard and validation pages render correctly without a full redesign.
- Preserve mock mode (`VITE_USE_MOCKS=true`) with identical demo behavior to today.
- Keep all seller profile I/O in the service layer — pages must not call HTTP directly.

**Success metrics:**

- A seller logged in via HTTP mode sees their own company data on dashboard, validation, and duplicata entry pages — not `MOCK_SELLERS[0]`.
- A seller with status `created` can update metadata via PATCH and submit for review via POST submit; UI reflects the new status after reload or refetch.
- Mock mode behaves identically to the current hackathon demo (same latency simulation, same mock data mutations).
- `canSellerRegisterDuplicatas` and validation progress components produce sensible results when driven by backend-mapped status (e.g. `active` seller can proceed where the demo allowed approved sellers).
- User-facing errors from seller API calls are shown in Portuguese.
- `npm run typecheck` passes with zero errors after implementation.

## User Stories

- As a **seller**, I want my dashboard to show my company's real registration data after login so that I trust the platform reflects my account.
- As a **seller**, I want to see my current onboarding/validation status so that I know whether I can proceed to duplicata flows.
- As a **seller**, I want to update my company and representative information while my profile is still editable so that I can complete onboarding before submission.
- As a **seller**, I want to submit my profile for platform review when my data is complete so that my status moves to under review.
- As a **seller**, I want clear error messages in Portuguese when an update or submit fails so that I understand what to fix without exposing internal details.

**Main flow:**

1. Seller logs in (auth feature) and selects the seller profile.
2. Seller navigates to dashboard or validation page; the app resolves the seller ID from the authenticated session and fetches `GET /v1/sellers/:id`.
3. UI renders company name, status, and validation progress using mapped domain fields.
4. While status is `created`, seller can update metadata (PATCH) — e.g. completing KYC-related fields surfaced in the validation page.
5. When metadata is complete, seller submits for review (POST submit); status becomes `in_review`.
6. On subsequent visits or reload, the same fetch path restores the current backend state.

## Core Features

1. **Dual-mode seller profile service**
   - What it does: Extends `seller.service.ts` with mock and HTTP implementations selected by `resolveApiMode()`, following the same pattern as `auth.service.ts`.
   - Why it matters: Enables incremental integration without breaking the demo; pages keep calling the same service functions.

2. **Fetch current seller profile**
   - What it does: Resolves the logged-in seller's ID and returns a normalized `SellerCompany` (or successor domain type) mapped from `SellerPublicView`.
   - Why it matters: Fixes the core bug where every seller sees the same mock record.

3. **Update seller metadata**
   - What it does: Persists partial updates to company, legal representative, and business relations metadata while the backend allows edits (`status=created`, not locked).
   - Why it matters: Supports the validation/onboarding UX without a separate registration HTTP flow in this slice.

4. **Submit seller for review**
   - What it does: Calls the backend submit endpoint when the seller completes onboarding steps; transitions status from `created` to `in_review` on success.
   - Why it matters: Aligns the validation page's "send for review" behavior with the real lifecycle instead of mutating mock-only fields.

5. **Backend-to-UI status mapping**
   - What it does: Derives frontend validation/onboarding fields (`validationStatus`, `kycStatus`, `analystDuplicatasAccess`, progress indicators) from backend `SellerPublicView.status` and metadata completeness.
   - Why it matters: Avoids a full UI rewrite while honestly representing backend state; hackathon-only fields become computed adapters, not persisted fiction in HTTP mode.

6. **Seller-scoped error handling**
   - What it does: Maps known backend error codes (`seller_not_found`, `forbidden`, `metadata_locked`, `incomplete_metadata`, `invalid_status_transition`) to user-facing Portuguese messages.
   - Why it matters: Sellers get actionable feedback when PATCH or submit fails.

## Functional Requirements

1. FR-1: In mock mode, `fetchCurrentSeller` must continue returning mock data with simulated latency and must not perform HTTP calls.
2. FR-2: In HTTP mode, `fetchCurrentSeller` must resolve the seller ID from the authenticated session (JWT `profileId` claim for seller role) and call `GET /v1/sellers/:id` with Bearer authentication.
3. FR-3: In HTTP mode, when the seller ID cannot be resolved (missing claim, wrong role, no session), the service must fail gracefully with a typed error; pages must show a user-friendly Portuguese message.
4. FR-4: The HTTP response must be mapped to the frontend seller domain type consumed by existing pages (dashboard, validation, new duplicata gate) without those pages importing DTOs directly.
5. FR-5: Status mapping must translate backend `created` → editable onboarding; `in_review` → under platform review; `active` → approved for platform use; `inactive` → rejected/disabled — with UI labels remaining in Portuguese via existing domain helpers where possible.
6. FR-6: In HTTP mode, `analystDuplicatasAccess` must be derived from backend status (e.g. `active` maps to approved for duplicata registration gate) rather than read from mock-only storage.
7. FR-7: In mock mode, `updateSellerValidationStatus` must preserve current in-memory mutation behavior.
8. FR-8: In HTTP mode, metadata updates must call `PATCH /v1/sellers/:id` with the appropriate partial body (`name`, `companyMetaData`, `legalRepresentativeMetaData`, `businessRelationsMetaData`).
9. FR-9: In HTTP mode, submit-for-review actions must call `POST /v1/sellers/:id/submit` and refetch or update local state to reflect `in_review` on success.
10. FR-10: When PATCH returns `metadata_locked` (409), the UI must inform the seller that the profile can no longer be edited and must not silently discard the attempt.
11. FR-11: When submit returns `incomplete_metadata` (400), the UI must inform the seller that required fields are missing — message in Portuguese, no internal field dump required in MVP.
12. FR-12: Monetary fields (`shareCapital`, `annualRevenue`) must be converted correctly between backend decimal reais and any frontend representation used in forms or display.
13. FR-13: Seller profile pages must show loading and error states during fetch; they must not flash mock data before HTTP data arrives in HTTP mode.
14. FR-14: All seller profile HTTP calls must use the shared `api-client` with Bearer token; pages and components must not call `fetch` directly.
15. FR-15: Mock mode must remain the default (`VITE_USE_MOCKS=true`); switching to HTTP mode must require only environment configuration plus a running backend — no page-level code changes.

## Personas & Scope

- **Personas affected:** `seller` (primary); no new analyst/admin capabilities in this slice
- **Pages/routes touched:**
  - Seller dashboard (`/seller`)
  - Seller validation (`/seller/validation`)
  - New duplicata entry gate (`/seller/duplicatas/new`) — seller fetch only; duplicata CRUD stays mock
  - Seller duplicatas list — seller fetch only; list data stays mock until receivables integration
- **Integration with backend:** yes — requires integration spec (`integration-spec.md`) covering:
  - `GET /v1/sellers/:id`
  - `PATCH /v1/sellers/:id`
  - `POST /v1/sellers/:id/submit`
- **Depends on:**
  - Auth login & session persistence (Bearer token, session restore)
  - JWT `profileId` claim available for seller accounts (backend already emits; frontend session layer must expose it for seller ID resolution)
  - Shared HTTP infrastructure (`api-client`, `resolveApiMode`, token storage)

## Technical Constraints

- No new external libraries unless justified and approved.
- Must pass `npm run typecheck` with zero errors.
- Must follow the project's service adapter pattern (`resolveApiMode()`) for all seller profile I/O.
- UI and page components must not perform direct HTTP calls or parse raw API DTOs — mapping belongs in the service/domain layer.
- Must preserve existing auth, profile selection, and seller navigation flows.
- User-facing seller profile errors must be in Portuguese.
- Component and file-level design details (DTO file names, mapper functions, exact field mapping table) belong in the Tech Spec and Integration Spec, not this PRD.
- Backend contract changes are out of scope — adapt the frontend to the existing API.

## Out of Scope

- Public seller registration wizard HTTP integration (`seller-registration.service.ts`) — separate PRD (Slice B).
- Analyst/admin seller review list and cadastral decision flows (`seller-review.service.ts`, `approveAnalystDuplicatasAccess`) — separate PRD (Slice C).
- Document upload and document checklist backed by API — backend module not implemented.
- Receivables/duplicatas HTTP integration (`duplicata.service.ts`) — separate PRD.
- Wallet creation and passkey flows — separate feature.
- Admin seller list and status transitions (`admin.service.ts`, `PATCH /v1/sellers/:id/status`).
- Replacing `SellerCompany` type entirely — adapter/mapper approach preferred unless Tech Spec proves a domain type split is cleaner.
- Automated tests (Vitest/E2E) — post-MVP; manual checklist + typecheck gate for now.
- Backend changes (new endpoints, analyst review API, document storage).

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Should `profileId` from JWT be persisted in the auth session snapshot, or decoded on demand from the access token when fetching seller profile? | Frontend | **Open** — must be resolved in Tech Spec; backend already includes `profileId` for sellers |
| Exact mapping table: backend `SellerPublicView.status` + metadata completeness → `validationStatus`, `kycStatus`, `documentsProgress`, `onboardingStep` | Product / Frontend | **Open** — define in Integration Spec; goal is UX parity, not 1:1 field parity |
| Should `updateSellerValidationStatus` remain the public API for pages, or split into explicit `updateSellerMetadata` + `submitSellerForReview` in the service layer? | Frontend | **Open** — Tech Spec decision; HTTP impl likely needs distinct backend calls |
| On validation page, does "KYC approved" mock action map to PATCH metadata, POST submit, or both depending on completeness? | Product | **Open** — may simplify to "submit for review" only in HTTP mode |
| When seller status is `active`, should duplicata registration gate open even if duplicata list is still mock data? | Product | **Open** — recommended yes for demo continuity |
| Is `GET /v1/sellers/me` needed, or is `GET /v1/sellers/:id` with JWT `profileId` sufficient for MVP? | Backend / Frontend | **TBD** — `:id` + `profileId` is sufficient per current backend; aggregated `/me` deferred |
