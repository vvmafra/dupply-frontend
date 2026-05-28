# Integration Spec — Seller Profile

**Frontend service:** `src/services/seller.service.ts`  
**Backend base path:** `/v1/sellers`  
**Status:** Confirmed  
**Last updated:** 2026-05-26

---

## Overview

The seller profile domain loads the authenticated seller's company data, allows metadata updates while onboarding is editable, and submits the profile for platform review. Today the frontend is **mock-only**: `fetchCurrentSeller()` always returns `MOCK_SELLERS[0]` with simulated latency, and `updateSellerValidationStatus()` mutates in-memory mock rows.

When HTTP is enabled (`VITE_USE_MOCKS=false`), the service resolves the seller ID from the JWT `profileId` claim, calls the backend seller endpoints, maps `SellerPublicView` to the existing `SellerCompany` domain type, and surfaces backend error codes as Portuguese user messages. Pages keep consuming the same service functions — no direct HTTP or DTO imports in UI.

**Out of scope for this spec:** public registration (`seller-registration.service.ts`), analyst/admin review queues, document uploads, wallet, receivables/duplicatas HTTP, admin status transitions.

Reference: [prd.md](./prd.md)

---

## Endpoint map

| # | Method | Path | Auth | Request body | Response body | Frontend function |
|---|--------|------|------|-------------|---------------|-------------------|
| 1 | GET | `/v1/sellers/:id` | Bearer | — | `SellerPublicViewDTO` | `fetchCurrentSeller()` |
| 2 | PATCH | `/v1/sellers/:id` | Bearer | `UpdateSellerMetadataRequestDTO` (partial) | `SellerPublicViewDTO` | `updateSellerMetadata()` |
| 3 | POST | `/v1/sellers/:id/submit` | Bearer | — | `204` (no body) | `submitSellerForReview()` |

**Not used in this slice:**

| Method | Path | Notes |
|--------|------|-------|
| GET | `/v1/sellers` | Analyst/admin list — Slice C |
| PATCH | `/v1/sellers/:id/status` | Admin transitions — out of scope |
| DELETE | `/v1/sellers/:id` | Admin soft-delete — out of scope |
| GET | `/v1/sellers/me` | **Deferred** — `profileId` from JWT + `GET /v1/sellers/:id` is sufficient for MVP |

**Auth resolution:** seller ID comes from JWT claim `profileId` (real `seller.id` for seller accounts). Access token is read via `getAccessToken()` and decoded in the service/domain layer — not persisted separately in the auth snapshot.

**Money convention:** `shareCapital` and `annualRevenue` are sent and returned in **reais with up to 2 decimal places** (e.g. `150000.00`). Stored internally as cents on the backend; conversion is transparent to the frontend DTO layer.

---

## DTO definitions

Transport types live in `src/services/seller.dto.ts` (create). They mirror the backend `SellerPublicView` contract confirmed in `dupply-backend/src/domain/seller/types.ts`.

```ts
// Response — shared by GET and PATCH
export type SellerStatusDTO = "created" | "in_review" | "active" | "inactive";

export type CompanyAddressDTO = {
  zipCode: string;
  state: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
};

export type CompanyMetaDataDTO = {
  legalName: string;
  cnpj: string;
  foundingDate: string;
  shareCapital: number;       // reais, 2 decimal places
  annualRevenue: number;    // reais, 2 decimal places
  corporateEmail: string;
  phone: string;            // digits only, e.g. "41999449944"
  businessDescription: string;
  address: CompanyAddressDTO;
};

export type LegalRepresentativeMetaDataDTO = {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  role: string;
};

export type BusinessRelationDTO = {
  legalName: string;
  cnpj: string;
  sharePercentage?: number;
};

export type BusinessRelationsMetaDataDTO = {
  clients: BusinessRelationDTO[];
  suppliers: BusinessRelationDTO[];
};

export type SellerPublicViewDTO = {
  id: string;
  status: SellerStatusDTO;
  name: string;
  companyMetaData: CompanyMetaDataDTO;
  legalRepresentativeMetaData: LegalRepresentativeMetaDataDTO;
  businessRelationsMetaData: BusinessRelationsMetaDataDTO;
  accountId: string;
  walletId: string | null;
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
};

// Request — PATCH body (all fields optional, partial merge on backend)
export type UpdateSellerMetadataRequestDTO = {
  name?: string;
  companyMetaData?: Partial<CompanyMetaDataDTO>;
  legalRepresentativeMetaData?: Partial<LegalRepresentativeMetaDataDTO>;
  businessRelationsMetaData?: Partial<BusinessRelationsMetaDataDTO>;
};

// Error body (non-2xx on seller routes)
export type SellerErrorBodyDTO = {
  error:
    | "seller_not_found"
    | "forbidden"
    | "metadata_locked"
    | "validation_error"
    | "incomplete_metadata"
    | "invalid_status_transition"
    | "invalid_status_for_submit"
    | "seller_not_active"
    | "unauthorized";
  message?: string; // optional — backend primarily sends `error` code
};
```

**Placement:** `src/services/seller.dto.ts`

---

## DTO → Domain mapping

The frontend domain type `SellerCompany` (`src/domain/seller/seller.types.ts`) is a **UI-oriented model** with hackathon fields (`validationStatus`, `kycStatus`, `documentsProgress`, `analystDuplicatasAccess`, `onboardingStep`) that do not exist on the backend. Mapping lives in `src/domain/seller/seller-profile.mapper.ts` (pure functions, no React, no I/O).

### Field mapping (SellerPublicViewDTO → SellerCompany)

| Domain field | Source |
|--------------|--------|
| `id` | `dto.id` |
| `legalName` | `dto.companyMetaData.legalName` (fallback: `dto.name`) |
| `taxId` | `dto.companyMetaData.cnpj` |
| `email` | `dto.companyMetaData.corporateEmail` |
| `phone` | `dto.companyMetaData.phone` |
| `representativeName` | `dto.legalRepresentativeMetaData.fullName` |
| `representativeCpf` | `dto.legalRepresentativeMetaData.cpf` |
| `createdAt` | `dto.createdAt` |
| `validationStatus` | derived — see status table below |
| `kycStatus` | derived — see status table below |
| `analystDuplicatasAccess` | derived — see status table below |
| `documentsProgress` | computed from metadata completeness (0–100) |
| `onboardingStep` | computed from metadata completeness + status (1–4) |

### Backend status → frontend derived fields

Goal: UX parity with mock demo, not 1:1 field parity. Labels remain Portuguese via existing helpers in `seller.validation.ts` and `seller-duplicata-access.ts`.

| Backend `status` | Metadata completeness | `validationStatus` | `kycStatus` | `analystDuplicatasAccess` |
|------------------|----------------------|--------------------|-------------|---------------------------|
| `created` | incomplete | `NOT_STARTED` or `DOCUMENTS_PENDING`* | `PENDING` | `PENDING` |
| `created` | complete (all required fields) | `KYC_PENDING` | `PENDING` | `PENDING` |
| `in_review` | any | `UNDER_REVIEW` | `APPROVED`** | `UNDER_REVIEW` |
| `active` | any | `APPROVED` | `APPROVED` | `APPROVED` |
| `inactive` | any | `REJECTED` | `REJECTED` | `REJECTED` |

\* Use `NOT_STARTED` when metadata is empty/default; `DOCUMENTS_PENDING` when partially filled (< 100% completeness).  
\** KYC is treated as satisfied once the seller has submitted for review — the mock KYC card simulation does not apply in HTTP mode.

### Metadata completeness

Reuse backend required-field rules (aligned with `assertCompleteSellerMetadata` on the backend):

- **Company:** `legalName`, `cnpj`, `foundingDate`, `shareCapital`, `annualRevenue`, `corporateEmail`, `phone`, `businessDescription`, full `address`
- **Legal representative:** `fullName`, `cpf`, `email`, `phone`, `role`
- **Business relations:** at least one client and one supplier with `legalName` + `cnpj`

```ts
// src/domain/seller/seller-profile.mapper.ts
import type { SellerCompany } from "./seller.types";
import type { SellerPublicViewDTO } from "@/services/seller.dto";

export function mapSellerDtoToCompany(dto: SellerPublicViewDTO): SellerCompany {
  const completeness = computeMetadataCompleteness(dto);
  const derived = deriveValidationFields(dto.status, completeness);

  return {
    id: dto.id,
    legalName: dto.companyMetaData.legalName || dto.name,
    taxId: dto.companyMetaData.cnpj,
    email: dto.companyMetaData.corporateEmail,
    phone: dto.companyMetaData.phone,
    representativeName: dto.legalRepresentativeMetaData.fullName,
    representativeCpf: dto.legalRepresentativeMetaData.cpf,
    validationStatus: derived.validationStatus,
    kycStatus: derived.kycStatus,
    analystDuplicatasAccess: derived.analystDuplicatasAccess,
    documentsProgress: completeness.percent,
    onboardingStep: completeness.step,
    createdAt: dto.createdAt,
  };
}
```

### Domain → DTO mapping (PATCH requests)

When pages eventually send metadata updates, map form/domain values to `UpdateSellerMetadataRequestDTO`:

| Domain / form field | DTO path |
|---------------------|----------|
| `legalName` | `companyMetaData.legalName` |
| `taxId` (CNPJ) | `companyMetaData.cnpj` |
| `email` | `companyMetaData.corporateEmail` |
| `phone` | `companyMetaData.phone` (digits only) |
| `representativeName` | `legalRepresentativeMetaData.fullName` |
| `representativeCpf` | `legalRepresentativeMetaData.cpf` |
| Monetary fields | `companyMetaData.shareCapital` / `annualRevenue` as `number` in reais |

**Money (FR-12):** DTOs use reais (`number`). If forms use formatted strings (e.g. `"150.000,00"`), parse in the page or a domain helper before calling the service — the service sends numeric reais to the API.

---

## Adapter pattern (per function)

### `fetchCurrentSeller()`

**Current mock:**
```ts
export async function fetchCurrentSeller(): Promise<SellerCompany> {
  await sleep(300);
  return { ...MOCK_SELLERS[0] };
}
```

**With HTTP adapter:**
```ts
export async function fetchCurrentSeller(): Promise<SellerCompany> {
  if (resolveApiMode() === "mock") return fetchCurrentSellerMock();

  const sellerId = resolveSellerIdFromSession();
  const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
  return mapSellerDtoToCompany(dto);
}
```

**Seller ID resolution (FR-2, FR-3):**
```ts
function resolveSellerIdFromSession(): string {
  const token = getAccessToken();
  if (!token) throw new SellerProfileError("missing_session");

  const payload = decodeJwtPayload(token); // extended with profileId
  if (!payload?.profileId || payload.role !== "seller") {
    throw new SellerProfileError("missing_seller_profile");
  }
  return payload.profileId;
}
```

---

### `updateSellerMetadata(sellerId, patch)`

New explicit function for HTTP mode (replaces mock-only `updateSellerValidationStatus` for real metadata writes).

**Current mock:** N/A — mock continues via `updateSellerValidationStatus`.

**With HTTP adapter:**
```ts
export async function updateSellerMetadata(
  sellerId: string,
  patch: UpdateSellerMetadataRequestDTO,
): Promise<SellerCompany> {
  if (resolveApiMode() === "mock") {
    throw new Error("updateSellerMetadata is HTTP-only; use updateSellerValidationStatus in mock mode");
  }

  const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`, {
    method: "PATCH",
    body: patch,
  });
  return mapSellerDtoToCompany(dto);
}
```

---

### `submitSellerForReview(sellerId)`

**Current mock:** N/A — mock uses `updateSellerValidationStatus` to set `UNDER_REVIEW`.

**With HTTP adapter:**
```ts
export async function submitSellerForReview(sellerId: string): Promise<void> {
  if (resolveApiMode() === "mock") {
    await updateSellerValidationStatusMock(sellerId, {
      validationStatus: "UNDER_REVIEW",
      kycStatus: "APPROVED",
    });
    return;
  }

  await apiRequest<void>(`/v1/sellers/${sellerId}/submit`, { method: "POST" });
}
```

---

### `updateSellerValidationStatus(sellerId, updates)` — mock shim

**Keep for mock mode (FR-7).** In HTTP mode, pages should call `updateSellerMetadata` / `submitSellerForReview` instead. Optionally log a dev warning if called in HTTP mode.

```ts
export async function updateSellerValidationStatus(
  sellerId: string,
  updates: Partial<SellerCompany>,
): Promise<void> {
  if (resolveApiMode() === "mock") {
    return updateSellerValidationStatusMock(sellerId, updates);
  }
  // HTTP: map known update shapes to submit (see Tech Spec — Validation page)
  if (updates.validationStatus === "UNDER_REVIEW") {
    await submitSellerForReview(sellerId);
    return;
  }
  throw new SellerProfileError("unsupported_mock_update_in_http_mode");
}
```

---

## Auth & error handling

- **Access token:** Bearer from `getAccessToken()` — handled automatically by `apiRequest` when `auth: true` (default).
- **Seller routes:** no cookie required (unlike `/v1/auth/*`).
- **401 on authenticated request:** silent refresh via `POST /v1/auth/refresh` (handled by `api-client`); then `clearAuthStorage()` + logout handler.
- **Backend error shape:** `{ error: "<code>" }` — map via `ApiError.body.error`, not `message` alone.

### Error code → Portuguese message (FR-10, FR-11)

| Backend `error` | HTTP | User message (PT) |
|-----------------|------|-------------------|
| `seller_not_found` | 404 | Não encontramos seu cadastro de vendedor. |
| `forbidden` | 403 | Você não tem permissão para acessar este cadastro. |
| `metadata_locked` | 409 | Seu cadastro não pode mais ser editado — ele já foi enviado para análise. |
| `incomplete_metadata` | 400 | Complete todos os dados obrigatórios antes de enviar para análise. |
| `invalid_status_for_submit` | 409 | Seu cadastro já foi enviado ou não está elegível para envio. |
| `invalid_status_transition` | 409 | Esta operação não é permitida no status atual do cadastro. |
| `validation_error` | 400 | Verifique os dados informados e tente novamente. |
| `unauthorized` | 401 | Sua sessão expirou. Faça login novamente. |

```ts
// src/services/seller.service.ts — pattern (mirrors auth.service)
function mapSellerApiError(error: unknown): SellerProfileError {
  if (error instanceof ApiError) {
    const code = (error.body as SellerErrorBodyDTO | undefined)?.error;
    const message = SELLER_ERROR_MESSAGES[code ?? ""] ?? "Não foi possível atualizar seu cadastro. Tente novamente.";
    return new SellerProfileError(code ?? "unknown", message);
  }
  return new SellerProfileError("network", "Não foi possível conectar. Tente novamente.");
}
```

**Page pattern:**
```ts
try {
  const seller = await fetchCurrentSeller();
  setSeller(seller);
} catch (err) {
  const message =
    err instanceof SellerProfileError
      ? err.message
      : "Não foi possível carregar os dados do vendedor.";
  toast.error(message);
}
```

---

## Migration plan

| Phase | Action | Risk |
|-------|--------|------|
| A | Create `seller.dto.ts` + `seller-profile.mapper.ts` — zero runtime change | None |
| B | Extend `decodeJwtPayload` with `profileId`; add `SellerProfileError` | Low |
| C | Extract mock logic to `*Mock()` functions in `seller.service.ts` | Low |
| D | Add HTTP adapters with `resolveApiMode()` gate — mock still default | Low |
| E | Update seller pages: error handling, HTTP submit path on validation page | Medium |
| F | Enable HTTP in `.env.local` (`VITE_USE_MOCKS=false`) — manual E2E test | Medium |
| G | Confirm + close open items | Low |

---

## Pages & components consuming this service

| File | Functions used | Notes |
|------|----------------|-------|
| `src/pages/seller/SellerDashboardPage.tsx` | `fetchCurrentSeller()` | Loading skeleton already present; add error toast |
| `src/pages/seller/SellerValidationPage.tsx` | `fetchCurrentSeller()`, `updateSellerValidationStatus()` → `submitSellerForReview()` in HTTP | KYC card mock action maps to submit in HTTP mode |
| `src/pages/seller/NewDuplicataPage.tsx` | `fetchCurrentSeller()` | Gate via `canSellerRegisterDuplicatas`; add error toast |
| `src/pages/seller/SellerDuplicatasPage.tsx` | `fetchCurrentSeller()` | Seller fetch only; duplicata list stays mock |
| `src/pages/SellerReviewDetailPage.tsx` | `approveAnalystDuplicatasAccess()` | **Out of scope** — Slice C; unchanged |

---

## Open items

- [x] Confirm endpoint paths (`GET/PATCH /v1/sellers/:id`, `POST /v1/sellers/:id/submit`)
- [x] Confirm `SellerPublicView` response shape
- [x] Confirm error codes and HTTP status mapping
- [x] Confirm money fields in reais on the wire
- [x] Confirm `profileId` in JWT for seller accounts
- [x] Defer `GET /v1/sellers/me` — use `profileId` + `:id`
- [ ] CORS — confirm `http://localhost:5173` in backend `CORS_ALLOWED_ORIGINS` for local HTTP testing
- [ ] Validation page metadata edit forms — this slice may only wire submit; full PATCH form UX deferred if no edit UI exists yet
