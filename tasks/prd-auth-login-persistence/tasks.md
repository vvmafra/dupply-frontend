# Tasks — Auth Login & Session Persistence

**PRD:** [prd.md](./prd.md) · **Tech Spec:** [techspec.md](./techspec.md) · **Integration:** [integration-spec.md](./integration-spec.md)

Most domain, context, guards, and UI work is **already implemented** (see techspec status). Remaining tasks complete the HTTP session lifecycle (credentials, refresh, logout, 401 handling) and optional polish.

## Tasks

- [x] 1.0 Extract auth transport DTOs into `auth.dto.ts`
- [x] 2.0 Add `credentials` support to the API client
- [x] 3.0 Complete auth service HTTP session lifecycle (login credentials, refresh, restore, logout)
- [x] 4.0 Wire 401 handler to attempt silent refresh before logout
- [x] 5.0 (Optional P3) Add account hydration via `GET /v1/accounts/me`
- [x] 6.0 Migrate remaining literal route paths to `ROUTES` constants
