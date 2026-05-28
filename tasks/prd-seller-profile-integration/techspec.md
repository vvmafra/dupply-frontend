# Tech Spec — Seller Profile Integration (Slice A)

## Overview

This spec wires the authenticated seller's real profile into the existing seller persona UI (dashboard, validation, duplicata entry gate) using the project's service adapter pattern. In HTTP mode, `fetchCurrentSeller()` resolves the seller ID from the JWT `profileId` claim and calls `GET /v1/sellers/:id`; metadata updates and submit-for-review call the corresponding PATCH/POST endpoints. Backend `SellerPublicView` is mapped to the existing `SellerCompany` domain type so pages do not import DTOs or rewrite validation components.

**In scope:** dual-mode `seller.service.ts`, DTO file, domain mapper, JWT `profileId` resolution, seller error mapping (PT), page loading/error handling, validation page submit wiring in HTTP mode.

**Out of scope:** public registration HTTP, analyst review, document uploads, wallet, receivables/duplicatas HTTP, admin seller management, automated tests, backend changes.

Mock mode (`VITE_USE_MOCKS=true`) remains the default with identical demo behavior.

Reference: [prd.md](./prd.md) · [integration-spec.md](./integration-spec.md)

---

## Architecture overview

```
UI (pages/seller/ + components/seller/)
  └── fetchCurrentSeller(), submitSellerForReview() — no fetch, no DTOs
Services (services/seller.service.ts + seller.dto.ts)
  └── resolveApiMode() → mock impl | apiRequest() + DTO mapping
Domain (domain/seller/*)
  └── SellerCompany types, seller-profile.mapper.ts, canSellerRegisterDuplicatas — no React, no I/O
Lib (lib/)
  └── api-client (Bearer + 401 refresh), token-storage, env (resolveApiMode)
  └── auth-jwt (decodeJwtPayload extended with profileId)
```

**Layer boundaries:**

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| Pages | service functions, domain helpers, toast | `fetch`, `apiRequest`, DTO imports |
| seller.service | mock/HTTP orchestration, error mapping | JSX, hooks |
| domain/seller | pure types, mappers, `can*` helpers | React, api-client, storage |
| seller.dto.ts | transport types only | domain logic |

---

## Component design

### 1. JWT payload extension (`src/domain/auth/auth-jwt.ts`)

**Change:** Add optional `profileId` to the decoded payload type and validation.

**Why:** FR-2 requires resolving seller ID from the session. Decoding on demand from the access token avoids migrating `PersistedAuthSnapshot` and keeps a single source of truth (the JWT already carries `profileId` for seller accounts per backend contract).

**FR coverage:** FR-2, FR-3; resolves PRD open question on snapshot vs on-demand decode.

```ts
// Before
type JwtPayload = {
  sub: string;
  role: string;
  exp?: number;
};

// After
type JwtPayload = {
  sub: string;
  role: string;
  profileId?: string;
  exp?: number;
};

export function getSellerProfileIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.role !== "seller" || !payload.profileId) return null;
  return payload.profileId;
}
```

---

### 2. Seller DTOs (`src/services/seller.dto.ts`)

**Change:** New file with transport types from [integration-spec.md](./integration-spec.md) — `SellerPublicViewDTO`, `UpdateSellerMetadataRequestDTO`, `SellerErrorBodyDTO`.

**Why:** DTOs stay out of `src/domain/` per project conventions.

**FR coverage:** FR-4, FR-8, FR-12, FR-14.

---

### 3. Domain mapper (`src/domain/seller/seller-profile.mapper.ts`)

**Change:** New pure module — `mapSellerDtoToCompany()`, `computeMetadataCompleteness()`, `deriveValidationFields()`.

**Why:** FR-5 and FR-6 require translating backend lifecycle status + metadata into existing UI fields (`validationStatus`, `kycStatus`, `analystDuplicatasAccess`, `documentsProgress`, `onboardingStep`) without persisting fiction in HTTP mode.

**Status mapping (confirmed):**

| Backend `status` | `validationStatus` | `kycStatus` | `analystDuplicatasAccess` |
|------------------|-------------------|-------------|---------------------------|
| `created` (incomplete) | `NOT_STARTED` / `DOCUMENTS_PENDING` | `PENDING` | `PENDING` |
| `created` (complete) | `KYC_PENDING` | `PENDING` | `PENDING` |
| `in_review` | `UNDER_REVIEW` | `APPROVED` | `UNDER_REVIEW` |
| `active` | `APPROVED` | `APPROVED` | `APPROVED` |
| `inactive` | `REJECTED` | `REJECTED` | `REJECTED` |

**FR-6:** `canSellerRegisterDuplicatas()` continues to work unchanged — when backend status is `active`, mapped fields satisfy all three checks, opening the duplicata gate even though duplicata list data remains mock (PRD recommendation: yes for demo continuity).

```ts
export function deriveValidationFields(
  status: SellerStatusDTO,
  completeness: MetadataCompleteness,
): Pick<SellerCompany, "validationStatus" | "kycStatus" | "analystDuplicatasAccess"> {
  switch (status) {
    case "created":
      return {
        validationStatus: completeness.percent === 0
          ? "NOT_STARTED"
          : completeness.isComplete
            ? "KYC_PENDING"
            : "DOCUMENTS_PENDING",
        kycStatus: "PENDING",
        analystDuplicatasAccess: "PENDING",
      };
    case "in_review":
      return { validationStatus: "UNDER_REVIEW", kycStatus: "APPROVED", analystDuplicatasAccess: "UNDER_REVIEW" };
    case "active":
      return { validationStatus: "APPROVED", kycStatus: "APPROVED", analystDuplicatasAccess: "APPROVED" };
    case "inactive":
      return { validationStatus: "REJECTED", kycStatus: "REJECTED", analystDuplicatasAccess: "REJECTED" };
  }
}
```

**FR coverage:** FR-4, FR-5, FR-6, FR-12.

---

### 4. Seller profile error type (`src/domain/seller/seller-profile.errors.ts`)

**Change:** Typed error for seller profile operations with Portuguese `message`.

```ts
export type SellerProfileErrorCode =
  | "missing_session"
  | "missing_seller_profile"
  | "seller_not_found"
  | "forbidden"
  | "metadata_locked"
  | "incomplete_metadata"
  | "invalid_status_for_submit"
  | "invalid_status_transition"
  | "validation_error"
  | "network"
  | "unknown";

export class SellerProfileError extends Error {
  constructor(
    readonly code: SellerProfileErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SellerProfileError";
  }
}
```

**FR coverage:** FR-3, FR-10, FR-11.

---

### 5. Seller service adapter (`src/services/seller.service.ts`)

**Change:** Refactor into mock/HTTP dual mode following `auth.service.ts` patterns.

**Structure:**

```ts
// Mock implementations (extracted)
async function fetchCurrentSellerMock(): Promise<SellerCompany> { ... }
async function updateSellerValidationStatusMock(...): Promise<void> { ... }

// HTTP helpers
function resolveSellerIdFromSession(): string { ... }
function mapSellerApiError(error: unknown): SellerProfileError { ... }

// Public API
export async function fetchCurrentSeller(): Promise<SellerCompany> {
  if (resolveApiMode() === "mock") return fetchCurrentSellerMock();
  try {
    const sellerId = resolveSellerIdFromSession();
    const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
    return mapSellerDtoToCompany(dto);
  } catch (error) {
    throw mapSellerApiError(error);
  }
}

export async function updateSellerMetadata(
  sellerId: string,
  patch: UpdateSellerMetadataRequestDTO,
): Promise<SellerCompany> { ... }

export async function submitSellerForReview(sellerId: string): Promise<void> { ... }

export async function updateSellerValidationStatus(
  sellerId: string,
  updates: Partial<SellerCompany>,
): Promise<void> {
  if (resolveApiMode() === "mock") {
    return updateSellerValidationStatusMock(sellerId, updates);
  }
  // HTTP: validation page "KYC approved" → submit for review
  if (updates.validationStatus === "UNDER_REVIEW") {
    await submitSellerForReview(sellerId);
    return;
  }
  throw new SellerProfileError("unknown", "Operação não suportada neste modo.");
}
```

**Service API decision (PRD open question):** Split explicit HTTP functions (`updateSellerMetadata`, `submitSellerForReview`) while keeping `updateSellerValidationStatus` as the mock-compatible shim pages already call. Validation page changes minimally — still calls `updateSellerValidationStatus`, which delegates to `submitSellerForReview` in HTTP mode.

**FR coverage:** FR-1, FR-2, FR-7, FR-8, FR-9, FR-14, FR-15.

`approveAnalystDuplicatasAccess()` remains mock-only — out of scope (Slice C).

---

### 6. Seller dashboard page (`src/pages/seller/SellerDashboardPage.tsx`)

**Change:** Wrap `fetchCurrentSeller()` in try/catch; show toast on error; do not render seller cards with stale/null data on failure.

**Why:** FR-13 — no flash of mock data in HTTP mode (loading skeleton already gates render until fetch completes).

```tsx
useEffect(() => {
  async function load() {
    try {
      const s = await fetchCurrentSeller();
      const d = await fetchDuplicatasBySeller(s.id);
      setSeller(s);
      setDuplicatas(d);
    } catch (err) {
      toast.error(
        err instanceof SellerProfileError
          ? err.message
          : "Não foi possível carregar os dados do vendedor.",
      );
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);
```

**FR coverage:** FR-3, FR-13.

---

### 7. Seller validation page (`src/pages/seller/SellerValidationPage.tsx`)

**Change:**

1. Same fetch error handling as dashboard.
2. `handleKycApproved`: in HTTP mode, calls `updateSellerValidationStatus` → `submitSellerForReview`; on success, refetch seller via `fetchCurrentSeller()` instead of optimistic local patch.
3. Handle `metadata_locked` and `incomplete_metadata` via toast (FR-10, FR-11).

```tsx
async function handleKycApproved() {
  if (!seller) return;
  try {
    await updateSellerValidationStatus(seller.id, {
      validationStatus: "UNDER_REVIEW",
      kycStatus: "APPROVED",
    });
    const refreshed = await fetchCurrentSeller();
    setSeller(refreshed);
    toast.success("Cadastro enviado para análise.");
  } catch (err) {
    toast.error(
      err instanceof SellerProfileError
        ? err.message
        : "Não foi possível enviar o cadastro para análise.",
    );
  }
}
```

**HTTP mode UX (PRD open question):** The mock KYC simulation (`SellerKycCard`) remains for demo in mock mode. In HTTP mode, the card's "Iniciar verificação" action represents **submit for review** — the backend validates metadata completeness. If metadata is incomplete, the seller sees the `incomplete_metadata` message. Full metadata edit forms via PATCH are deferred unless a form already exists on this page.

**FR coverage:** FR-9, FR-10, FR-11, FR-13.

---

### 8. New duplicata page (`src/pages/seller/NewDuplicataPage.tsx`)

**Change:** Import `SellerProfileError`; show toast on fetch failure (currently silent catch).

**FR coverage:** FR-3, FR-13.

---

### 9. Seller duplicatas list page (`src/pages/seller/SellerDuplicatasPage.tsx`)

**Change:** Add error toast on `fetchCurrentSeller()` failure (seller fetch only; list stays mock).

**FR coverage:** FR-3, FR-13.

---

### 10. Seller KYC card (`src/components/seller/SellerKycCard.tsx`) — optional minor change

**Change (optional):** Accept `mode?: "mock" | "http"` prop or detect via env helper to adjust copy in HTTP mode ("Enviar cadastro para análise" instead of "Iniciar verificação"). Not strictly required for MVP if validation page handler alone suffices.

**FR coverage:** UX clarity for HTTP submit path.

---

## Data flow

```
Seller opens /seller or /seller/validation
  → Page useEffect
      → fetchCurrentSeller() [seller.service.ts]
          → mock: sleep + MOCK_SELLERS[0]
          → http: getAccessToken() → decode profileId → GET /v1/sellers/:id
              → mapSellerDtoToCompany() → SellerCompany
      → setSeller(data) | toast.error(PT message)
      → fetchDuplicatasBySeller(id) [still mock]

Seller clicks "Iniciar verificação" on validation page (HTTP mode)
  → handleKycApproved()
      → updateSellerValidationStatus() → submitSellerForReview()
          → POST /v1/sellers/:id/submit → 204
      → fetchCurrentSeller() refetch
      → setSeller(refreshed) — status now mapped to UNDER_REVIEW
```

---

## Files changed

| File | Change type |
|------|-------------|
| `src/services/seller.dto.ts` | Added |
| `src/services/seller.service.ts` | Modified |
| `src/domain/seller/seller-profile.mapper.ts` | Added |
| `src/domain/seller/seller-profile.errors.ts` | Added |
| `src/domain/auth/auth-jwt.ts` | Modified |
| `src/pages/seller/SellerDashboardPage.tsx` | Modified |
| `src/pages/seller/SellerValidationPage.tsx` | Modified |
| `src/pages/seller/NewDuplicataPage.tsx` | Modified |
| `src/pages/seller/SellerDuplicatasPage.tsx` | Modified |
| `src/components/seller/SellerKycCard.tsx` | Modified (optional copy tweak) |

---

## Impact analysis

- **Auth/navigation:** No guard changes. Seller routes already require seller profile selection. Missing `profileId` or wrong role surfaces as fetch error — no redirect unless 401 from api-client triggers global logout.
- **Other personas:** `approveAnalystDuplicatasAccess` unchanged (mock). Analyst/admin pages unaffected.
- **Service adapter:** `resolveApiMode()` gate on every public function; mock remains default. HTTP path requires auth session with valid Bearer token.
- **TypeScript:** No `any`. DTO mapping is explicit. `SellerPublicViewDTO.createdAt` is `string` (JSON); domain `SellerCompany.createdAt` stays `string`.
- **Duplicata gate:** Active sellers can register duplicatas in HTTP mode even with mock duplicata list — intentional for demo continuity.
- **Monetary fields:** PATCH sends reais as `number`; mapper reads reais from GET. Form parsing (if added later) must strip BRL formatting before service call.

---

## Test strategy

_(No automated test runner configured — manual verification steps.)_

### Manual — Mock mode regression

| Step | Expected result |
|------|-----------------|
| Set `VITE_USE_MOCKS=true` | Default |
| Login as seller, open dashboard | Shows `MOCK_SELLERS[0]` data with skeleton then content |
| Open validation, click KYC simulate | Status updates to UNDER_REVIEW locally |
| Open new duplicata | Gate open for approved mock seller |

### Manual — HTTP mode seller profile

| Step | Expected result |
|------|-----------------|
| Set `VITE_USE_MOCKS=false`, `VITE_API_BASE_URL=http://localhost:3000` | Backend running |
| Register/login seller account | JWT contains `profileId` |
| Open dashboard | Shows **logged-in seller's** company data, not `MOCK_SELLERS[0]` |
| Seller with `status=created`, incomplete metadata, submit | Toast: incomplete metadata message (PT) |
| Complete metadata via PATCH (API or future form), submit | Status becomes `in_review`; UI shows "Em análise" |
| Admin approves seller to `active` (backend) | Duplicata registration gate opens |
| PATCH after submit | Toast: metadata locked message (PT) |

### Manual — Error states

| Step | Expected result |
|------|-----------------|
| Clear token, navigate to /seller | 401 → logout or error toast; no mock flash |
| Login as admin, select seller profile, fetch seller | Graceful PT error (missing/wrong seller profile) |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| Persist `profileId` in auth snapshot vs decode JWT on demand? | **Decode on demand** from access token via extended `decodeJwtPayload` + `getSellerProfileIdFromToken()`. Avoids snapshot migration; JWT is source of truth. |
| Backend status → UI field mapping table? | Defined in [integration-spec.md](./integration-spec.md) and `seller-profile.mapper.ts`. Derived fields; no 1:1 backend columns for hackathon-only enums. |
| Keep `updateSellerValidationStatus` or split API? | **Split** HTTP functions (`updateSellerMetadata`, `submitSellerForReview`); keep `updateSellerValidationStatus` as mock shim that delegates submit in HTTP mode. Pages change minimally. |
| KYC mock action in HTTP mode — PATCH, submit, or both? | **Submit only** for MVP. PATCH wired in service for future forms; validation page submit triggers `POST .../submit`. |
| `active` seller + mock duplicata list — open gate? | **Yes.** Mapped `analystDuplicatasAccess=APPROVED` etc. allows registration; list data stays mock until receivables PRD. |
| `GET /v1/sellers/me` needed? | **No.** `profileId` + `GET /v1/sellers/:id` sufficient for MVP. |

---

## Functional requirements traceability

| FR | Addressed in |
|----|--------------|
| FR-1 | §5 seller.service mock path |
| FR-2 | §1 auth-jwt, §5 fetchCurrentSeller HTTP |
| FR-3 | §4 SellerProfileError, §6–9 page error handling |
| FR-4 | §3 mapper, §2 DTOs |
| FR-5 | §3 deriveValidationFields |
| FR-6 | §3 active → APPROVED mapping; `canSellerRegisterDuplicatas` unchanged |
| FR-7 | §5 updateSellerValidationStatusMock |
| FR-8 | §5 updateSellerMetadata |
| FR-9 | §5 submitSellerForReview, §7 validation page |
| FR-10 | §5 mapSellerApiError metadata_locked, §7 toast |
| FR-11 | §5 incomplete_metadata mapping, §7 toast |
| FR-12 | §2 DTO money types, §3 mapper |
| FR-13 | §6–9 loading gates + try/catch |
| FR-14 | §5 apiRequest only in service |
| FR-15 | resolveApiMode gate; no page-level env checks |
