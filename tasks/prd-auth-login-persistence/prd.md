# Product Requirements Document — Auth Login & Session Persistence

**Status:** Draft — backend auth contract confirmed (HttpOnly refresh cookie `dupply_rt`; `GET /v1/accounts/me` available)

## Overview

The Dupply frontend currently provides a visual login flow and route guards, but authentication lives only in React state — a page reload (F5) clears the session. Login is not yet wired to the real backend (`POST /v1/auth/login`), and route protection uses inconsistent path strings outside the centralized route constants. Three conflicting sources of truth (`user`, `isAuthenticated`, `selectedProfile`) make guards fragile.

With the backend now delivering a stable auth contract — access tokens in the response body, refresh tokens exclusively in an HttpOnly cookie, and account hydration via `GET /v1/accounts/me` — the frontend must implement functional login, session persistence across reloads, and consistent guest/protected routing. Mock mode must remain the default for local demo work without regression.

This feature changes how users sign in and stay signed in; it does not replace persona-specific business flows (duplicatas, onboarding, etc.).

## Goals

- Enable functional login against the backend (or mock adapter) with email and password.
- Persist authenticated sessions across page reloads, including selected profile when applicable.
- Align login, profile selection, and route guards with centralized route constants and a single session source of truth.
- Preserve mock mode as the default (`VITE_USE_MOCKS=true`) so local demo behavior is unchanged.
- Integrate with the backend refresh-token cookie model without exposing the refresh token to JavaScript.

**Success metrics:**

- A user who logs in successfully remains authenticated after F5, with their selected profile restored when applicable.
- Login against a local backend with seed users (e.g. seller, risk analyst) completes end-to-end without manual token handling.
- Unauthenticated access to protected routes redirects to login; authenticated users on the login page are redirected to profile selection or their dashboard.
- Mock mode (`VITE_USE_MOCKS=true`) behaves identically to the current demo flow (three profile cards, no HTTP).
- `npm run typecheck` passes with zero errors after implementation.

## User Stories

- As a **seller**, I want to log in with email and password so that I can access my duplicata flows with a valid session.
- As an **admin**, I want my session to survive a page reload so that I do not have to re-authenticate on every visit.
- As a **risk analyst**, I want to see only the profile options my role allows so that I am not presented with inaccessible personas.
- As any **authenticated user**, I want to be redirected correctly between public and protected routes so that I never land on the wrong screen for my session state.
- As any **authenticated user**, I want to be logged out when my session expires on the server so that stale credentials do not grant access.
- As any **user**, I want clear error messages in Portuguese when login fails so that I understand what went wrong without security leaks.

**Main flow:**

1. User opens the login page and submits email and password.
2. On success, the system stores the access token and a minimal user/profile snapshot; the browser stores the refresh token cookie automatically.
3. User selects a profile (or is auto-routed when only one profile is allowed) and reaches the correct dashboard.
4. On page reload, the system restores the session silently; if the access token expired, it attempts a silent refresh via the cookie before logging out.
5. On logout, the system invalidates the server session, clears local storage, and returns the user to the guest state.

## Core Features

1. **Login via service layer (mock or HTTP)**
   - What it does: Accepts email and password, validates input, and delegates authentication to a service that calls either the mock adapter or `POST /v1/auth/login` depending on environment configuration.
   - Why it matters: Unblocks all authenticated flows and enforces separation between UI and network I/O.

2. **Session persistence across reloads**
   - What it does: Persists access token and a minimal session snapshot (user id, email, platform role, selected profile) in session storage; restores auth state on app boot.
   - Why it matters: Resolves the documented blocker where F5 wipes authentication — critical for demo and real usage.

3. **Silent token refresh via HttpOnly cookie**
   - What it does: When the access token is expired but a valid refresh cookie may exist, attempts `POST /v1/auth/refresh` with browser credentials before treating the session as invalid.
   - Why it matters: Aligns with the backend cookie model; users stay logged in without JavaScript ever reading the refresh token.

4. **Route guards and navigation consistency**
   - What it does: Protects persona routes, redirects guests to login (preserving intended destination), redirects authenticated users away from login, and uses centralized route constants everywhere.
   - Why it matters: Eliminates guard drift and broken deep links.

5. **Profile selection aligned with backend roles**
   - What it does: In HTTP mode, shows only profiles the user's platform role allows; auto-skips selection when exactly one profile is available; persists selected profile in the session snapshot.
   - Why it matters: Replaces the hackathon behavior where any profile card could be chosen regardless of role.

6. **Logout and session invalidation**
   - What it does: Manual logout calls the backend logout endpoint with credentials, clears local session data, and resets UI to guest. Global 401 handling after failed refresh clears session and returns user to login.
   - Why it matters: Users can always end their session; expired or revoked tokens do not leave the app in a inconsistent state.

7. **User hydration from account API (optional enhancement)**
   - What it does: When available, prefers `GET /v1/accounts/me` for display name and email over client-side JWT decoding.
   - Why it matters: Improves UX accuracy; endpoint is available on the backend.

## Functional Requirements

1. FR-1: The login form must validate email and password before submission, with user-facing validation messages in Portuguese.
2. FR-2: In mock mode, login must succeed without HTTP calls, preserving current demo behavior (simulated latency, any password when email is filled).
3. FR-3: In HTTP mode, login must call `POST /v1/auth/login` with `{ email, password }` and `credentials: "include"` so the browser receives and stores the `dupply_rt` refresh cookie.
4. FR-4: On successful login, the system must persist the access token and a session snapshot; it must never read or store the refresh token in JavaScript-accessible storage.
5. FR-5: On login failure, the system must display a user-friendly message in Portuguese and must not mutate authenticated state. Invalid credentials must use a generic message that does not reveal whether the email exists.
6. FR-6: Login error mapping must cover at minimum: invalid credentials (401), inactive account (403), validation errors (400), unavailable payer persona, and network/unavailable service errors.
7. FR-7: On app startup, the system must attempt to restore a previously persisted session before rendering route guards as final.
8. FR-8: During session restore, the UI must expose a loading state so guards do not flash incorrect redirects.
9. FR-9: When the access token is expired, the system must attempt silent refresh via `POST /v1/auth/refresh` (no body, `credentials: "include"`) before clearing the session.
10. FR-10: When refresh fails (missing cookie, 401, or network error after retry policy), the system must clear local session data and start in guest state without showing an error for silent restore failure.
11. FR-11: On manual logout, the system must call `POST /v1/auth/logout` with `credentials: "include"` (best-effort), clear access token and session snapshot, and reset to guest state.
12. FR-12: Unauthenticated users accessing protected routes must be redirected to login, preserving the original URL for post-login return when supported.
13. FR-13: Authenticated users accessing the login route must be redirected to profile selection or the dashboard of their active profile.
14. FR-14: Authenticated users without a selected profile accessing persona-guarded routes must be redirected to profile selection.
15. FR-15: Authenticated users with an incompatible selected profile for a route must be redirected to profile selection.
16. FR-16: All router paths must use centralized route constants — no duplicated literal path strings.
17. FR-17: In HTTP mode, profile selection must show only profiles allowed for the user's platform role (`seller`, `admin`, `risk_analyst` / `risk_analyst_agent` mapped to frontend personas).
18. FR-18: When exactly one profile is allowed, the system must auto-select it and skip the profile selection screen.
19. FR-19: In mock mode, profile selection must continue showing all three demo profile cards.
20. FR-20: Selecting a profile must persist the choice in the session snapshot and survive page reload.
21. FR-21: Users with backend role `payer` must be blocked at login with a friendly Portuguese message explaining the persona is not yet available in the platform.
22. FR-22: When an authenticated API request receives 401 after refresh has failed, the system must clear session data, log the user out, and redirect to login; an optional "session expired" toast in Portuguese may be shown.
23. FR-23: Auth-related network calls to `/v1/auth/*` must always use `credentials: "include"`.
24. FR-24: Subsequent authenticated API calls must send `Authorization: Bearer <accessToken>`.
25. FR-25: When `GET /v1/accounts/me` is used, user display data must come from the API response; JWT decode remains an acceptable fallback when the endpoint is not used.

## Personas & Scope

- **Personas affected:** all (`seller`, `admin`, `riskAnalyst`) — cross-cutting authentication infrastructure
- **Pages/routes touched:** login, profile selection, all persona-protected dashboards and flows guarded today
- **Integration with backend:** yes — requires integration with confirmed auth endpoints:
  - `POST /v1/auth/login`
  - `POST /v1/auth/refresh` (cookie-based, no body)
  - `POST /v1/auth/logout` (cookie-based, no Bearer required)
  - `GET /v1/accounts/me` (optional hydration, Bearer required)
- **Depends on:** shared HTTP infrastructure (api client, token storage, environment/mode resolution) from the api-integration feature

## Technical Constraints

- No new external libraries unless justified and approved.
- Must pass `npm run typecheck` with zero errors.
- Must preserve existing auth entry points, profile selection UX in mock mode, and navigation flows for seller registration and other public routes.
- Must follow the project's service adapter pattern (mock vs HTTP resolved by environment) for all auth I/O.
- UI and context layers must not perform direct HTTP calls or read/write session storage — auth I/O belongs in the service layer.
- Refresh token must never be accessible to JavaScript; only the HttpOnly cookie managed by the browser.
- User-facing auth errors must be in Portuguese.
- Component and file-level design details belong in the Tech Spec, not this PRD.

## Out of Scope

- OAuth, SSO, or magic-link authentication.
- Wallet / passkey authentication (separate feature).
- HTTP integration for duplicatas, seller registration, or review flows (separate features/services).
- Multi-tab silent refresh coordination.
- Automated tests (Vitest/E2E) — post-demo; manual checklist + typecheck gate for now.
- Removing demo credentials pre-filled in the login form (post-demo / DEV flag).
- Backend changes — backend auth contract is already implemented.
- `PATCH` profile sync to backend — adapter may be added later when endpoint is confirmed; not required for MVP.

## Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| Should deep-link return (`state.from`) apply immediately after login when profile is auto-selected, or only after explicit profile selection? | Product / Frontend | **Open** — spec suggests return after profile is resolved |
| Is `PATCH /users/me/profile` or equivalent needed in P0.2 to sync selected profile server-side? | Backend / Product | **TBD** — not blocking MVP; local snapshot persistence is sufficient for demo |
| Should session-expired toast (FR-22) be shown on every 401 logout or only on user-initiated actions? | Product / UX | **Open** — optional per spec |
| Prefer `GET /v1/accounts/me` hydration in MVP or defer to post-MVP (P3)? | Frontend | **Open** — endpoint available; JWT decode fallback acceptable for MVP |
