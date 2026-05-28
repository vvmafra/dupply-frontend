# Integration Spec — Seller Registration

**Frontend service:** `src/services/seller-registration.service.ts`  
**Related services:** `src/services/auth.service.ts` (session persistence), `src/services/seller.service.ts` (PATCH / GET / submit — Slice A)  
**Backend base paths:** `/v1/auth/register`, `/v1/sellers`  
**Status:** Confirmed  
**Last updated:** 2026-05-26

---

## Overview

The public seller onboarding wizard at `/register/seller` collects credentials and structured company metadata across five steps. Today it calls a single mock `registerSeller()` at the end with no backend I/O.

This slice wires the wizard to the real backend in a **step-scoped pipeline**: register on step 1 (establishing an authenticated session), PATCH metadata on steps 2–4, skip document validation on step 5, then submit for review. Resume-after-login hydrates the form from `GET /v1/sellers/:id` (reuse Slice A DTOs and mappers). Registration I/O is **HTTP-only** — no mock path in `seller-registration.service.ts` (FR-19).

**Reuses from Slice A (do not duplicate):** `seller.dto.ts`, `SellerPublicViewDTO`, `UpdateSellerMetadataRequestDTO`, `mapSellerDtoToCompany()`, `computeMetadataCompleteness()`, `updateSellerMetadata()`, `submitSellerForReview()`, `fetchCurrentSeller()`, seller error mapping.

Reference: [prd.md](./prd.md) · Slice A: [../prd-seller-profile-integration/integration-spec.md](../prd-seller-profile-integration/integration-spec.md)

---

## Endpoint map

| # | Method | Path | Auth | Request body | Response body | Frontend function |
|---|--------|------|------|-------------|---------------|-------------------|
| 1 | POST | `/v1/auth/register` | None (cookie set) | `RegisterSellerRequestDTO` | `RegisterSellerResponseDTO` | `registerSellerAccess()` |
| 2 | PATCH | `/v1/sellers/:id` | Bearer | `UpdateSellerMetadataRequestDTO` (partial, step-scoped) | `SellerPublicViewDTO` | `saveSellerRegistrationStep()` → delegates `updateSellerMetadata()` |
| 3 | POST | `/v1/sellers/:id/submit` | Bearer | — | `204` (no body) | `finishSellerRegistration()` → delegates `submitSellerForReview()` |
| 4 | GET | `/v1/sellers/:id` | Bearer | — | `SellerPublicViewDTO` | `loadSellerRegistrationState()` → delegates `fetchCurrentSeller()` or direct GET by `sellerId` |

**Auth on register:** `credentials: "include"` so the HttpOnly refresh cookie `dupply_rt` is stored (`Path=/v1/auth`).

**Seller ID after register:** Response includes `sellerId`; JWT `accessToken` also carries `profileId === sellerId` (confirmed in backend tests).

**Money convention:** `shareCapital` and `annualRevenue` sent as **numbers in reais** with up to 2 decimal places (e.g. `150000.00`). Same as Slice A.

**Documents:** No document endpoints. Step 5 is UI-only; submit relies on backend metadata completeness only.

---

## DTO definitions

Register transport types extend existing auth DTOs. Seller PATCH/GET types live in `src/services/seller.dto.ts` (Slice A — do not duplicate).

```ts
// src/services/seller-registration.dto.ts (new)

export type RegisterSellerRequestDTO = {
  email: string;
  password: string;
  name: string;
  role: "seller";
};

/** 201 — extends login token body with seller id */
export type RegisterSellerResponseDTO = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  sellerId: string;
};

export type RegisterErrorBodyDTO = {
  error:
    | "email_already_exists"
    | "validation_error"
    | "unauthorized"
    | string;
  message?: string;
};
```

**Placement:** `src/services/seller-registration.dto.ts`

**PATCH bodies (per step)** — built from form values via domain mapper; reuse `UpdateSellerMetadataRequestDTO`:

| Wizard step | PATCH body shape |
|-------------|------------------|
| 2 — Company | `{ name?: string, companyMetaData: Partial<CompanyMetaDataDTO> }` |
| 3 — Representative | `{ legalRepresentativeMetaData: Partial<LegalRepresentativeMetaDataDTO> }` |
| 4 — Relations | `{ businessRelationsMetaData: Partial<BusinessRelationsMetaDataDTO> }` |

Only non-empty counterparties (client/supplier with `legalName` + `cnpj`) are sent; empty slots in the 5-row UI are omitted.

---

## DTO → Domain mapping

### Register response → session

Same as login: `accessToken` → `buildSessionFromLogin(email, accessToken)` + `setAccessToken()` + `setAuthSnapshot()`. No separate domain type — returns `{ sellerId: string; session: AuthSession }` to the wizard.

### SellerPublicViewDTO → registration form (`SellerRegistrationFormValues`)

Pure mapping in `src/domain/seller/seller-registration.mapper.ts` (inverse of form → PATCH):

| Form field | DTO path |
|------------|----------|
| `responsibleName` | `dto.name` (register name; may differ from `companyMetaData.legalName`) |
| `legalName` | `dto.companyMetaData.legalName` |
| `taxId` | `dto.companyMetaData.cnpj` (display with mask; store digits in PATCH) |
| `foundationDate` | `dto.companyMetaData.foundingDate` |
| `shareCapital` | format `dto.companyMetaData.shareCapital` as BRL string for inputs |
| `revenueLast12Months` | format `dto.companyMetaData.annualRevenue` as BRL string |
| `corporateEmail`, `phone`, address fields, `businessDescription` | `dto.companyMetaData.*` |
| `representativeName` | `dto.legalRepresentativeMetaData.fullName` |
| `representativeCpf` | `dto.legalRepresentativeMetaData.cpf` |
| `representativeEmail` | `dto.legalRepresentativeMetaData.email` |
| `representativePhone` | `dto.legalRepresentativeMetaData.phone` |
| `representativeRole` *(new)* | `dto.legalRepresentativeMetaData.role` |
| `clients[].legalName`, `taxId`, `averageShare` | `dto.businessRelationsMetaData.clients[]` → `sharePercentage` optional number |
| `suppliers[]` | same pattern |

Pad `clients` / `suppliers` arrays to length 5 with empty rows for the UI.

### Form → PATCH (normalization before API)

| Input | Normalization | DTO field |
|-------|---------------|-----------|
| CNPJ, CPF, phone, CEP | strip non-digits | `cnpj`, `cpf`, `phone`, `zipCode` |
| `foundationDate` | ISO date `YYYY-MM-DD` | `foundingDate` |
| `shareCapital`, `revenueLast12Months` | parse BRL string → `number` (reais, 2 dp) | `shareCapital`, `annualRevenue` |
| `averageShare` | parse percentage string → `number` or omit | `sharePercentage` |

```ts
// src/domain/seller/seller-registration.mapper.ts
export function mapFormToCompanyPatch(
  values: SellerRegistrationCompanyValues,
): UpdateSellerMetadataRequestDTO {
  return {
    companyMetaData: {
      legalName: values.legalName.trim(),
      cnpj: digitsOnly(values.taxId),
      foundingDate: values.foundationDate,
      shareCapital: parseReais(values.shareCapital),
      annualRevenue: parseReais(values.revenueLast12Months),
      corporateEmail: values.corporateEmail.trim(),
      phone: digitsOnly(values.phone),
      businessDescription: values.businessDescription.trim(),
      address: {
        zipCode: digitsOnly(values.zipCode),
        state: values.state.trim().toUpperCase(),
        street: values.street.trim(),
        number: values.number.trim(),
        complement: values.complement?.trim() || undefined,
        neighborhood: values.neighborhood.trim(),
        city: values.city.trim(),
      },
    },
  };
}
```

---

## Adapter pattern (per function)

Registration service is **HTTP-only** (no `resolveApiMode()` gate). Requires `VITE_API_BASE_URL` and running backend.

### `registerSellerAccess(payload: SellerRegistrationAccessValues)`

**Current mock:**
```ts
export async function registerSeller(_payload: SellerRegistrationFormValues): Promise<{ success: boolean }> {
  await sleep(900);
  return { success: true };
}
```

**HTTP adapter (replaces mock entirely):**
```ts
export async function registerSellerAccess(
  payload: SellerRegistrationAccessValues,
): Promise<{ sellerId: string; session: AuthSession }> {
  const response = await apiRequest<RegisterSellerResponseDTO>("/v1/auth/register", {
    method: "POST",
    auth: false,
    credentials: "include",
    body: {
      email: payload.email.trim(),
      password: payload.password,
      name: payload.responsibleName.trim(),
      role: "seller",
    },
  });

  const session = mapTokenResponseToSession(payload.email.trim(), response);
  setAccessToken(response.accessToken);
  setAuthSnapshot(buildSnapshot(session));

  return { sellerId: response.sellerId, session };
}
```

Session persistence mirrors `auth.service.ts` `httpLoginImpl` (FR-1, FR-2).

---

### `saveSellerRegistrationStep(stepId, sellerId, values)`

**HTTP adapter:**
```ts
export async function saveSellerRegistrationStep(
  stepId: Exclude<SellerRegistrationStepId, "access" | "documents">,
  sellerId: string,
  values: SellerRegistrationFormValues,
): Promise<SellerCompany> {
  const patch = mapStepToPatch(stepId, values);
  return updateSellerMetadata(sellerId, patch);
}
```

Steps 2–4 only. Called after step-level Zod validation passes (FR-3).

---

### `finishSellerRegistration(sellerId: string)`

**HTTP adapter:**
```ts
export async function finishSellerRegistration(sellerId: string): Promise<void> {
  await submitSellerForReview(sellerId);
}
```

No document API calls (FR-4, FR-5). Step 5 schema validation is skipped in HTTP mode.

---

### `loadSellerRegistrationState(sellerId?: string)`

**HTTP adapter:**
```ts
export async function loadSellerRegistrationState(
  sellerId?: string,
): Promise<{ dto: SellerPublicViewDTO; formValues: SellerRegistrationFormValues; stepIndex: number }> {
  const id = sellerId ?? resolveSellerIdFromSession();
  const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${id}`);
  const formValues = mapSellerDtoToRegistrationForm(dto);
  const stepIndex = resolveRegistrationWizardStepIndex(dto);
  return { dto, formValues, stepIndex };
}
```

Uses `computeMetadataCompleteness()` / step helpers from `seller-profile.mapper.ts` for resume (FR-12). `stepIndex` is 1–4 (wizard steps 2–5); access step skipped when session exists.

---

### `fetchSellerLifecycleStatus()`

Thin wrapper used by login redirect and guards:

```ts
export async function fetchSellerLifecycleStatus(): Promise<SellerStatusDTO> {
  const seller = await fetchCurrentSeller();
  // Prefer raw status from a cached GET or extend fetchCurrentSeller to expose backend status
  ...
}
```

**Recommendation:** Add `getSellerBackendStatus(dto: SellerPublicViewDTO): SellerStatusDTO` or expose `status` on a lightweight domain helper — `SellerCompany` does not carry backend `status` today; registration routing needs `created` | `in_review` | `active` | `inactive` explicitly (see Tech Spec).

---

## Auth & error handling

### Register (`POST /v1/auth/register`)

- **Access token:** stored via `setAccessToken()`; subsequent PATCH/submit use Bearer (automatic in `apiRequest`).
- **Refresh token:** HttpOnly cookie — `credentials: "include"`; never read in JS.
- **401:** N/A on register (unauthenticated).
- **409 `email_already_exists`:** Portuguese toast — "Este e-mail já está cadastrado."
- **400 `validation_error`:** toast with backend `message` or generic PT fallback.

### Seller routes (PATCH / submit / GET)

Reuse Slice A `SellerProfileError` and `mapSellerApiError()` from `seller.service.ts`.

Additional codes relevant to registration:

| Backend `error` | HTTP | User message (PT) |
|-----------------|------|-------------------|
| `email_already_exists` | 409 | Este e-mail já está cadastrado. |
| `metadata_locked` | 409 | Seu cadastro não pode mais ser editado — ele já foi enviado para análise. |
| `incomplete_metadata` | 400 | Complete todos os dados obrigatórios antes de enviar para análise. |
| `invalid_status_for_submit` | 409 | Seu cadastro já foi enviado ou não está elegível para envio. |
| `forbidden` | 403 | Você não tem permissão para acessar este cadastro. |
| `validation_error` | 400 | Verifique os dados informados e tente novamente. |

### Inactive seller (`status: inactive`)

After login, session restore, or profile fetch: if seller status is `inactive`, call `clearAuthStorage()` + logout and show:

> "Seu cadastro não foi aprovado. Entre em contato com o suporte para mais informações."

(FR-18; exact copy finalized in Tech Spec.)

**Product gap (PRD open question):** Backend login may not block `inactive` seller alone if only `account.status` is checked. Frontend enforces after `GET /v1/sellers/:id`.

```ts
// Page / auth redirect pattern
try {
  await registerSellerAccess(values);
  setCurrentStepIndex(1);
} catch (err) {
  toast.error(mapRegistrationError(err));
}
```

---

## Migration plan

| Phase | Action | Risk |
|-------|--------|------|
| A | Add `seller-registration.dto.ts` + `seller-registration.mapper.ts` — no runtime change | None |
| B | Extend Zod schemas (backend field names, `representativeRole`, digit transforms) | Low |
| C | Replace `registerSeller` mock with HTTP-only registration service functions | Medium |
| D | Wire wizard step handlers (register → PATCH → submit per step) | Medium |
| E | Resume hydration + login redirect for `created` status | Medium |
| F | Post-submit toast + completion page CTA into seller area | Low |
| G | `inactive` blocking + `in_review` banner in AppShell | Medium |
| H | Manual E2E against local backend + `npm run typecheck` | Medium |

No mock gate for registration — removing `sleep` mock is intentional (FR-19).

---

## Pages & components consuming this service

| File | Functions used | Notes |
|------|----------------|-------|
| `src/components/auth/SellerRegistrationWizard.tsx` | `registerSellerAccess`, `saveSellerRegistrationStep`, `finishSellerRegistration`, `loadSellerRegistrationState` | Step-scoped API calls; no direct HTTP |
| `src/pages/SellerRegistrationPage.tsx` | redirect rules for `created` / `in_review` / `active` / authenticated | Resume mount hydration |
| `src/pages/SellerRegistrationCompletePage.tsx` | — | CTA to seller dashboard with session |
| `src/components/auth/MockLoginForm.tsx` | `fetchSellerLifecycleStatus` (or post-login hook) | Redirect `created` → wizard |
| `src/contexts/AuthContext.tsx` or login flow | inactive check on restore | Clear session |
| `src/components/layout/AppShell.tsx` | seller status banner | Persistent `in_review` notice |

**Not changed for HTTP:** analyst/admin pages, document upload, duplicata list HTTP.

---

## Open items

- [x] Confirm `POST /v1/auth/register` body and 201 response (`accessToken`, `sellerId`, refresh cookie)
- [x] Confirm PATCH partial merge and submit 204
- [x] Confirm `SellerPublicView` shape (Slice A)
- [x] Confirm metadata completeness rules align with submit validation
- [x] Reuse Slice A seller service for PATCH/GET/submit — no duplicate mappers
- [ ] CORS — confirm `http://localhost:5173` in backend `CORS_ALLOWED_ORIGINS` for local testing
- [ ] Backend login blocking for `inactive` seller-only vs account-only — frontend compensates via profile fetch (PRD open question)
- [ ] Exact PT copy for `inactive` rejection vs `in_review` banner — Tech Spec
