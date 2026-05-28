# Product Requirements Document — Seller Session Status Sync

**Status:** Draft — follows Seller Registration Integration (Slice B) and Auth Login Persistence; addresses stale seller lifecycle status after session restore and admin approval

## Overview

Seller Registration Integration (Slice B) introduced lifecycle-aware login, session restore, and read-only behavior while a seller is `in_review`. In HTTP mode, sellers whose status transitions to `active` (admin approval) should immediately gain full operational access without requiring a hard browser refresh or a new login attempt.

Investigation showed the backend does not cache seller status — it reads fresh data from the database on each request. The perceived "cached status" problem is frontend-only: the auth session is persisted in browser storage without seller lifecycle status, session restore reuses a valid JWT without re-evaluating the full seller lifecycle, and seller-facing pages load profile data once on mount and keep derived capability flags (e.g. whether receivables can be registered) in local React state. As a result, a seller approved while already logged in may still see under-review restrictions or disabled actions even though the backend already returns `active`.

This feature ensures seller lifecycle status and derived capability gates stay synchronized with the backend across session restore, login, and in-session admin approval — without changing backend API contracts.

## Goals

- Eliminate stale seller lifecycle status after session restore and during an active browser session.
- Ensure sellers approved to `active` can use operational features without hard refresh or re-login.
- Centralize seller status and profile refresh so login, restore, shell layout, and seller pages share one source of truth.
- Extend existing session hydration to honor account-level inactive status from the backend.
- Preserve all existing seller lifecycle routing rules (`created`, `in_review`, `active`, `inactive`).
- Keep mock mode behavior unchanged for non-HTTP demos.

**Success metrics:**

- A seller who was `in_review` and is approved to `active` while logged in sees restrictions lift within a reasonable polling window without manual page reload.
- A seller who returns to the app after admin approval (session restored from browser storage) lands in the correct seller area with full operational access when backend status is `active`.
- A seller with backend status `inactive` is never left authenticated after login or session restore.
- A seller with backend status `created` is redirected to resume registration after login or restore, consistent with Slice B rules.
- An account with backend status `inactive` (via account hydration) ends the session on restore.
- Seller capability gates (e.g. receivable registration eligibility) reflect current backend status, not a stale page-local snapshot.
- `npm run typecheck` passes with zero errors after implementation.

## User Stories

- As a **seller under review**, I want the platform to detect when my account is approved so that I can start using operational features without logging out and back in.
- As a **seller under review**, I want to return to the app after approval and continue with full access so that I am not stuck in a read-only state from an old session.
- As a **newly approved seller**, I want action buttons (e.g. register receivable) to become available as soon as my status is `active` so that I do not need to refresh the browser manually.
- As a **rejected seller**, I want my session cleared on restore if my status is `inactive` so that I cannot access seller routes with an old token.
- As a **seller with incomplete registration**, I want session restore to send me back to the registration wizard when my status is still `created` so that I can finish onboarding.
- As a **seller trying to log in**, I want clear behavior when an old session is still active so that I understand why I am redirected instead of seeing the login form again.

**Main flow — approval while logged in:**

1. Seller is authenticated with status `in_review`; under-review notice and read-only restrictions are visible.
2. Admin approves the seller; backend `sellers.status` becomes `active`.
3. The frontend periodically re-fetches seller lifecycle status (existing under-review polling behavior, extended to propagate changes).
4. When status becomes `active`, under-review restrictions and overlay are removed.
5. Seller profile and derived capability flags are refreshed centrally.
6. Operational actions (e.g. register receivable) become enabled without hard refresh.

**Main flow — return after approval (session restore):**

1. Seller previously logged in during `in_review`; browser still holds a valid access token and auth snapshot.
2. Admin approves the seller to `active` while the seller is away.
3. Seller opens the app; session restore runs and revalidates seller lifecycle status from the backend.
4. System detects `active`, establishes authenticated seller session, and routes to the seller area.
5. Seller profile is loaded fresh; operational gates reflect `active` immediately.

**Rejected seller flow (unchanged intent, extended coverage):**

1. Seller status is `inactive`.
2. On login or session restore, the system detects `inactive`, clears the session, and shows the existing Portuguese rejection message.

## Core Features

1. **Full seller lifecycle revalidation on session restore**
   - What it does: After auth session restore in HTTP mode, always fetch current seller lifecycle status from the backend and apply routing and session rules for all statuses (`created`, `in_review`, `active`, `inactive`) — not only `inactive`.
   - Why it matters: Session restore today may succeed with a valid JWT while seller status on the server has already changed; only blocking `inactive` is insufficient.

2. **Account inactive detection on restore**
   - What it does: When account hydration succeeds during restore, if the account status is `inactive`, clear the session and do not leave the user authenticated.
   - Why it matters: Account status is already returned by the existing account hydration endpoint but is currently discarded; inactive accounts should not remain authenticated via a stale token.

3. **Shared seller status and profile state**
   - What it does: Introduce a single application-level source for current seller lifecycle status and mapped seller profile data, refreshed on boot, login, and explicit refresh — consumed by the seller shell and seller pages instead of isolated per-page fetches on mount only.
   - Why it matters: Eliminates divergent status between layout overlay, dashboard gates, and form pages.

4. **Live transition handling (`in_review` → `active`)**
   - What it does: When periodic status checks detect a transition to `active`, propagate the change to shared seller state and refresh derived capability flags across the seller area.
   - Why it matters: Fulfills Slice B FR-10 in practice — read-only restrictions must lift when status becomes `active`, not only on full page reload.

5. **Consistent post-auth routing by lifecycle status**
   - What it does: Login and session restore use the same lifecycle-aware destination rules for sellers (`created` → registration wizard; `in_review` / `active` → seller area; `inactive` → blocked).
   - Why it matters: Avoids different behavior depending on whether the user "logged in" vs "had session restored".

6. **Improved login page behavior when session already exists (P2)**
   - What it does: When a user navigates to login but an authenticated session is restored, provide clearer UX (e.g. continue to app or explicitly log out and sign in again) instead of a silent redirect that feels like login failure.
   - Why it matters: Reduces confusion reported as "cannot log in after approval" when the issue is session restore, not credentials.

## Functional Requirements

### Session boot and hydration

1. FR-1: In HTTP mode, after successful session restore for a seller-role account, the system must fetch current seller lifecycle status from the backend before marking the user as authenticated in application state.
2. FR-2: If seller lifecycle status is `inactive` after restore, the system must clear auth storage, end the session, and show the existing Portuguese rejection message — same behavior as login.
3. FR-3: If seller lifecycle status is `created` after restore, the system must keep the authenticated session and route the user to the registration wizard per existing Slice B rules.
4. FR-4: If seller lifecycle status is `in_review` or `active` after restore, the system must keep the authenticated session and route the user to the appropriate seller destination per existing Slice B rules.
5. FR-5: When account hydration during restore returns account status `inactive`, the system must clear auth storage and not leave the user authenticated.
6. FR-6: Account hydration failure during restore must not break session restore; existing fallback behavior (JWT-derived user from snapshot) must remain.

### Shared seller state

7. FR-7: The application must expose a shared, refreshable seller lifecycle status for authenticated sellers in HTTP mode, distinct from the auth session snapshot (which does not store seller status).
8. FR-8: The shared seller state must include mapped seller profile data sufficient for existing capability gates (e.g. receivable registration eligibility derived from lifecycle status).
9. FR-9: Shared seller state must be initialized during session restore and login for seller-role accounts in HTTP mode.
10. FR-10: Seller-facing pages that currently load seller profile once on mount must consume shared seller state (or trigger shared refresh) so capability gates reflect the latest backend status without requiring hard refresh.

### Live status transition

11. FR-11: While seller lifecycle status is `in_review`, the system must continue periodic backend status checks (existing behavior) and update shared seller state when the status changes.
12. FR-12: When periodic or explicit refresh detects a transition from `in_review` to `active`, the system must remove under-review restrictions and overlay without requiring navigation or hard refresh.
13. FR-13: When status becomes `active`, derived capability flags across the seller area must update to match mapped `active` rules (equivalent to existing Slice B / profile integration mapping).
14. FR-14: Polling interval while `in_review` may be tuned for responsiveness but must not exceed the current maximum interval without product justification documented in the Tech Spec.

### Login consistency

15. FR-15: HTTP seller login must use the same lifecycle-aware routing rules as session restore for all seller statuses.
16. FR-16: Login and restore must not duplicate conflicting status-fetch logic; both must rely on the same shared refresh mechanism or domain routing helpers.

### Mock mode and non-seller personas

17. FR-17: Mock mode behavior for auth and seller demo flows must remain unchanged; this feature applies to HTTP mode unless explicitly extended in the Tech Spec.
18. FR-18: Non-seller personas (admin, risk analyst, payer) must not be affected by seller status synchronization.

### Errors and UX

19. FR-19: Failure to fetch seller status during restore must not silently treat the seller as `active`; behavior on fetch failure must be defined in the Tech Spec (conservative default: allow restore but show recoverable error / retry, or restrict to read-only — TBD in Open Questions).
20. FR-20: All user-facing messages for blocked or restored sessions must remain in Portuguese and reuse existing copy where applicable.
21. FR-21: (P2) When the login route is visited and session restore succeeds, the user must receive clear feedback that a session is already active, with a path to continue or log out — not a silent redirect that mimics a failed login.

## Personas & Scope

- **Personas affected:** `seller` only
- **Pages/routes touched:**
  - Session bootstrap (auth provider initialization)
  - Login flow and guest-route behavior
  - Seller shell layout (under-review overlay and header behavior)
  - Seller dashboard, validation, receivables list, and new receivable flows (capability gates)
  - Registration wizard entry redirect when status is `created` on restore
- **Integration with backend:** yes — uses existing endpoints only; no backend contract changes required for MVP:
  - `GET /v1/accounts/me` (account hydration; honor `status`)
  - `GET /v1/sellers/:id` (seller lifecycle status and profile mapping)
  - Existing auth endpoints (`POST /v1/auth/login`, `POST /v1/auth/refresh`) unchanged
- **Depends on:**
  - Auth Login Persistence (session snapshot, token storage, restore, account hydration)
  - Seller Profile Integration (Slice A) — DTOs, mappers, `fetchCurrentSeller` mapping
  - Seller Registration Integration (Slice B) — lifecycle routing helpers, inactive blocking, under-review UX

## Technical Constraints

- No new external libraries unless justified and approved.
- Must pass `npm run typecheck` with zero errors.
- Must preserve centralized route constants, profile selection, and existing auth guard patterns except where this PRD explicitly changes seller restore/login routing behavior.
- Must follow the service adapter pattern (`resolveApiMode()`) for any service-layer changes.
- User-facing messages must remain in Portuguese.
- UI must use existing Sonner toast patterns for errors.
- Component, context, hook, and service design details belong in the Tech Spec — not this PRD.
- No backend API or JWT contract changes in scope for this PRD.

## Out of Scope

- Backend aggregated session endpoint (e.g. `GET /v1/me`) — separate backend PRD; frontend may adopt later to reduce round-trips.
- Backend enforcement of seller `inactive` at login/refresh — separate backend PRD; frontend remains responsible for blocking in HTTP mode.
- Including seller lifecycle status in JWT claims or session snapshot persistence.
- WebSocket, SSE, or push notifications for status changes.
- Admin seller approval UI or admin status transition API.
- Changes to receivables, wallet, or analyst/admin personas.
- Automated E2E tests — post-MVP; manual validation checklist + typecheck gate.
- Global mock mode removal — separate cleanup effort.

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| On seller status fetch failure during restore, should the session be allowed (with retry UI), denied entirely, or restricted to read-only? | Product / Engineering | **Open** — FR-19 |
| Should session restore always force `POST /v1/auth/refresh` instead of reusing a non-expired access token, in addition to seller status fetch? | Engineering | **Open** — improves account revalidation; optional complement to FR-1 |
| Target polling interval while `in_review` (keep 30s, reduce to 10s, or exponential backoff)? | Product | **Open** — FR-14 |
| P2 login UX: show inline banner on login page vs dedicated "session active" interstitial? | Product / Design | **Open** — FR-21 |
| Should shared seller state replace all per-page `fetchCurrentSeller` calls in seller routes, or only pages with capability gates? | Engineering | **Open** — recommend all seller routes for consistency |
| Exact Portuguese copy if account is `inactive` on restore (reuse login inactive message or new copy)? | Product | **Open** |
