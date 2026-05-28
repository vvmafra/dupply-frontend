# Product Requirements Document — Seller Registration Integration (Slice B)

**Status:** Draft — backend auth register and seller lifecycle endpoints confirmed; Seller Profile Integration (Slice A) complete

## Overview

The public seller onboarding wizard at `/register/seller` collects credentials and structured company data across five steps, but today it only simulates success with a single mock call at the end. New sellers cannot create a real account, persist metadata incrementally, or transition to platform review through the backend.

The backend already supports the intended lifecycle: `POST /v1/auth/register` creates an account and seller in `created` status; `PATCH /v1/sellers/:id` accepts partial metadata updates with deep merge while editable; `POST /v1/sellers/:id/submit` validates completeness and moves the seller to `in_review`. Seller Profile Integration (Slice A) is complete and provides HTTP profile fetch, DTO mapping, and status derivation for logged-in sellers.

This feature wires the registration wizard to that API in a step-by-step flow: register on step 1 (establishing an authenticated session), PATCH metadata on steps 2–4, skip real document validation on step 5 (documents remain UI-only until a future documents API), then submit for review. It also covers resume-after-login (hydrate form from `GET /v1/sellers/:id`), post-submission UX (toast + completion page + logged-in read-only seller area while `in_review`), and rejection handling when seller status is `inactive`.

## Goals

- Enable end-to-end public seller registration against the real backend without a single end-of-form mock submit.
- Persist registration progress per step so sellers can leave and continue later via login.
- Align wizard field names and validation rules with the backend contract (backend as source of truth).
- Transition sellers to `in_review` on successful final submission.
- After submission, keep the seller logged in with clear “under review” messaging and read-only access until `active`.
- Block rejected sellers (`inactive`) from using the platform and end their session.
- Remove mock-only registration behavior from this flow (HTTP integration only for this feature).
- Keep all registration I/O in the service layer; pages must not call HTTP directly.

**Success metrics:**

- A new seller can complete all wizard steps against a local backend and land in `in_review` with metadata visible on subsequent `GET /v1/sellers/:id`.
- A seller who completes step 1 and returns later can log in, resume the wizard at the correct step with fields pre-filled from the backend (no local draft storage).
- After final submit, the seller sees a Sonner success toast and a completion screen, then can enter the logged-in seller area with navigation visible and operational actions disabled while `in_review`.
- A seller with status `inactive` cannot log in or stay authenticated; they receive a Portuguese error and are logged out.
- When an admin transitions the seller to `active`, read-only restrictions lift and normal seller gates apply (duplicata listing HTTP integration remains a separate feature).
- User-facing errors from register, PATCH, and submit are shown in Portuguese.
- `npm run typecheck` passes with zero errors after implementation.

## User Stories

- As a **prospective seller**, I want to create my access credentials in step 1 so that my account exists before I enter company details.
- As a **prospective seller**, I want each wizard step to save my progress to the server so that I do not lose data if I close the browser.
- As a **prospective seller**, I want to log back in and continue registration where I left off so that I do not have to start over.
- As a **prospective seller**, I want to complete company, representative, and business-relation steps with validation feedback in Portuguese so that I fix errors before the API rejects my data.
- As a **prospective seller**, I want to finish registration without uploading real documents (for now) so that I can submit for review when the rest of my data is complete.
- As a **prospective seller**, I want confirmation that my registration was submitted and is under review (within 24 hours) so that I know what happens next.
- As a **seller under review**, I want to see the platform shell (menu, dashboard) but not perform operational actions so that I understand my account is pending approval.
- As a **rejected seller**, I want to be prevented from logging in so that I know my registration was not approved.

**Main flow:**

1. User opens `/register/seller` and completes step 1 (access: name, email, password).
2. On “Continue”, the system calls `POST /v1/auth/register`, persists the authenticated session (access token and session snapshot, same model as login), and advances to step 2.
3. User completes step 2 (company metadata) → “Continue” triggers `PATCH /v1/sellers/:id` with partial `companyMetaData` (and `name` if applicable).
4. User completes step 3 (legal representative, including role) → PATCH with `legalRepresentativeMetaData`.
5. User completes step 4 (clients and suppliers) → PATCH with `businessRelationsMetaData`.
6. User reaches step 5 (documents): UI may remain, but HTTP mode does not require document upload or document validation; user can proceed to finalize.
7. On “Finish registration”, the system calls `POST /v1/sellers/:id/submit`; on success the seller status becomes `in_review`.
8. System shows a Sonner success toast (registration complete, under review, response within 24 hours) and navigates to the completion page.
9. User chooses the primary CTA to enter the logged-in seller area; session remains active; sidebar/navigation is visible; operational buttons are disabled with a persistent “under review” notice until status becomes `active`.

**Resume flow:**

1. User previously registered (step 1+) but did not finish; seller status is still `created`.
2. User logs in with email and password.
3. System detects seller `created` and redirects to `/register/seller` (not the dashboard).
4. Wizard loads `GET /v1/sellers/:id`, maps response into the form, resets fields, and opens the first incomplete step (step 2–5 resolver based on metadata completeness, not local storage).

**Rejected seller flow:**

1. Seller status is `inactive` (registration rejected by admin).
2. On login attempt or session restore, the system detects `inactive`, clears the session, and shows a Portuguese message that the account is not available — no access to seller routes.

## Core Features

1. **Step-scoped HTTP registration service**
   - What it does: Orchestrates register (step 1), per-step PATCH (steps 2–4), and submit (after step 5) through a dedicated registration service using the shared HTTP client and seller DTOs/mappers from Slice A.
   - Why it matters: Replaces the single mock `registerSeller` call with a backend-aligned, resumable pipeline.

2. **Backend-aligned form model and Zod validation**
   - What it does: Renames wizard fields to match backend metadata (e.g. `cnpj`, `foundingDate`, `fullName`, `role`, `sharePercentage`); validates per step with Zod (digits-only CNPJ/CPF/phone/CEP, ISO dates, monetary transforms) before each API call.
   - Why it matters: Reduces avoidable `validation_error` and `incomplete_metadata` responses; keeps UI and API in sync.

3. **Session establishment after step 1**
   - What it does: After successful register, persists access token and auth snapshot so steps 2–5 and submit use Bearer authentication.
   - Why it matters: PATCH and submit require JWT; without this, multi-step registration cannot work.

4. **Resume via GET + step resolver**
   - What it does: On wizard mount (logged-in seller with `created` status) or post-login redirect, fetches seller profile, hydrates the form, and computes the first incomplete step from metadata completeness rules aligned with submit validation.
   - Why it matters: Backend is the single source of truth; no parallel draft in browser storage.

5. **Documents step deferred**
   - What it does: Keeps the documents step in the UI for future upload integration; in HTTP mode does not validate or upload documents; submit relies only on metadata completeness enforced by the backend.
   - Why it matters: Backend has no documents module yet; unblocks registration integration now.

6. **Post-submit confirmation (toast + completion page)**
   - What it does: On successful submit, shows Sonner success toast with 24-hour review messaging and navigates to the completion route; completion page reinforces the message and offers a primary CTA into the logged-in seller area.
   - Why it matters: Clear closure of the registration journey without forcing logout.

7. **Read-only seller experience while `in_review`**
   - What it does: After registration (or any login while `in_review`), seller sees normal navigation but operational actions (create/edit/submit flows) are disabled; a persistent banner explains the account is under review (response within 24 hours).
   - Why it matters: Matches product expectation: “logged in but frozen” until approval.

8. **Rejected seller session blocking**
   - What it does: When seller lifecycle status is `inactive`, login fails from the user’s perspective (clear session, Portuguese error); an existing session is terminated on detection (login, restore, or profile fetch).
   - Why it matters: Rejected users must not access seller routes or appear logged in.

## Functional Requirements

1. FR-1: Step 1 “Continue” must call `POST /v1/auth/register` with `{ email, password, name, role: "seller" }` and `credentials: "include"` so the refresh cookie is stored.
2. FR-2: On successful register, the system must persist the access token and auth session snapshot before advancing to step 2.
3. FR-3: Steps 2–4 “Continue” must call `PATCH /v1/sellers/:id` with the partial body for that step only, after step-level Zod validation passes.
4. FR-4: Step 5 must not require document upload or document API calls in HTTP mode; optional UI checkboxes may remain for future use but must not block submit.
5. FR-5: “Finish registration” must call `POST /v1/sellers/:id/submit`; on success the seller status must become `in_review`.
6. FR-6: On successful submit, the system must show a Sonner success toast in Portuguese stating registration is complete and under review (response within 24 hours).
7. FR-7: On successful submit, the system must navigate to the registration completion route and show a completion screen consistent with the toast messaging.
8. FR-8: The completion screen primary CTA must take the user to the logged-in seller area while keeping the session active (no forced logout).
9. FR-9: While seller status is `in_review`, the seller area must show a persistent under-review notice and disable operational actions; navigation and read-only views remain available.
10. FR-10: When seller status becomes `active`, read-only restrictions must be removed and existing seller capability gates (e.g. duplicata registration eligibility) apply per mapped profile rules.
11. FR-11: While seller status is `created`, login must redirect the user to `/register/seller` to resume registration instead of the dashboard.
12. FR-12: On wizard load for a logged-in seller with status `created`, the system must `GET /v1/sellers/:id`, map the response into the form, and open the first incomplete step (steps 2–5) using a completeness resolver — not browser draft storage.
13. FR-13: Wizard form field names and structures must align with backend metadata (`companyMetaData`, `legalRepresentativeMetaData`, `businessRelationsMetaData`); legal representative step must include `role`.
14. FR-14: Client-side validation must normalize user input (e.g. strip masks from CNPJ, CPF, phone, CEP) before PATCH/submit so values match backend digit and format rules.
15. FR-15: Monetary fields must be sent as numbers in reais with up to two decimal places per backend convention.
16. FR-16: Registration HTTP failures must surface Portuguese user messages via Sonner error toasts (and inline form errors where applicable), including `email_already_exists`, `validation_error`, `incomplete_metadata`, `metadata_locked`, and `forbidden`.
17. FR-17: If the user is already logged in with seller status `in_review` or `active`, `/register/seller` must not offer an editable registration wizard; redirect per product rules (dashboard or validation).
18. FR-18: If seller status is `inactive`, login and session restore must not leave the user authenticated; the system must clear the session and show a Portuguese rejection/unavailable message.
19. FR-19: This feature must not introduce a mock implementation path in the registration service; registration I/O is HTTP-only (requires configured API base URL and running backend).
20. FR-20: Pages and wizard components must not call HTTP directly; all register/PATCH/submit and profile hydration go through the service and domain layers.
21. FR-21: Reuse Seller Profile Integration (Slice A) DTOs, mappers, and `GET /v1/sellers/:id` for hydration and post-login status checks — do not duplicate mapping logic.

## Personas & Scope

- **Personas affected:** `seller` (prospective and newly registered); no analyst/admin changes
- **Pages/routes touched:**
  - Public registration wizard (`/register/seller`)
  - Registration completion (`/register/seller/complete`)
  - Login redirect behavior for sellers in `created`, `in_review`, and `inactive`
  - Logged-in seller shell (dashboard, validation, and other seller routes) for read-only `in_review` behavior and `inactive` blocking
- **Integration with backend:** yes — requires integration spec (`integration-spec.md`) covering:
  - `POST /v1/auth/register`
  - `PATCH /v1/sellers/:id`
  - `POST /v1/sellers/:id/submit`
  - `GET /v1/sellers/:id` (resume and status gates; shared with Slice A)
- **Depends on:**
  - Auth session persistence (token storage, refresh cookie, session snapshot)
  - Seller Profile Integration (Slice A) — complete
  - Shared HTTP infrastructure (`api-client`, token storage)

## Technical Constraints

- No new external libraries unless justified and approved.
- Must pass `npm run typecheck` with zero errors.
- Must preserve centralized route constants and existing auth/profile selection patterns except where this PRD explicitly changes seller post-login routing.
- User-facing registration and gate messages must be in Portuguese.
- UI must use the existing Sonner toast pattern for success and error feedback.
- Component, schema, mapper, and service design details belong in the Tech Spec and Integration Spec, not this PRD.
- Backend contract changes are out of scope for MVP — adapt the frontend to the existing API; document any product–backend gaps in the Integration Spec.

## Out of Scope

- Document upload API and real document validation on step 5 — future feature (UI step may remain as placeholder).
- Duplicata/receivables list HTTP integration — separate PRD; read-only seller shell may show empty or existing mock list until integrated.
- Analyst/admin registration review queues and cadastral decisions — separate PRD (Slice C).
- Wallet and passkey flows.
- Admin seller status transitions (`PATCH /v1/sellers/:id/status`) — admin action only; frontend reacts to resulting `inactive` / `active`.
- Mock mode (`VITE_USE_MOCKS`) for registration — removed for this flow; global mock cleanup in other services may be a separate cleanup effort.
- Automated E2E tests — post-MVP; manual validation checklist + typecheck gate.
- Backend changes (documents module, login-time seller status check, new registration-specific endpoints).

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Should admin rejection set only `seller.status = inactive` or also `account.status = inactive`? Login currently blocks inactive accounts, not inactive sellers alone. | Product / Backend | **Open** — FR-18 requires frontend enforcement after profile fetch; backend login enhancement is optional follow-up |
| Exact Portuguese copy for `inactive` rejection vs `in_review` banner | Product | **Open** — define in Tech Spec |
| On completion CTA, default landing route: seller dashboard vs validation page | Product | **Open** — recommend dashboard with banner |
| Should step 5 remain visible in the step indicator or be labeled “optional / coming soon” for documents? | Product / Design | **Open** — UX polish |
| Global removal of `VITE_USE_MOCKS` from auth and other services: same release or follow-up cleanup PR? | Engineering | **Open** — registration is HTTP-only; other modules may still reference mocks until cleaned |
