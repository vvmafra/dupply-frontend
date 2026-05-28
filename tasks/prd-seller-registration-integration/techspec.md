# Tech Spec — Seller Registration Integration (Slice B)

## Overview

This spec wires the public seller registration wizard (`/register/seller`) to the real backend using a **step-scoped HTTP pipeline**: register on step 1, PATCH metadata on steps 2–4, skip document validation on step 5, submit for review, then show post-submit UX while keeping the seller logged in. Resume-after-login hydrates from `GET /v1/sellers/:id` (Slice A). Rejected sellers (`inactive`) are blocked at login/session restore.

**In scope:** HTTP-only `seller-registration.service.ts`, form/schema alignment with backend metadata, registration mappers, wizard step orchestration, login/resume redirects, completion page CTA, `in_review` read-only shell (banner + existing gates), `inactive` session blocking.

**Out of scope:** document upload API, analyst/admin review, duplicata list HTTP, wallet, mock mode for registration, automated E2E, backend changes.

Requires live HTTP (`VITE_API_BASE_URL` + backend running). Registration service has **no mock path** (FR-19).

Reference: [prd.md](./prd.md) · [integration-spec.md](./integration-spec.md) · Slice A: [../prd-seller-profile-integration/integration-spec.md](../prd-seller-profile-integration/integration-spec.md)

---

## Architecture overview

```
UI (SellerRegistrationWizard, SellerRegistrationPage, MockLoginForm, AppShell)
  └── seller-registration.service + auth.service (session) + seller.service (PATCH/GET/submit)
Services
  └── seller-registration.service.ts — HTTP-only orchestration
  └── auth.service.ts — register session persistence (shared helpers)
  └── seller.service.ts — reuse updateSellerMetadata, submitSellerForReview, fetchCurrentSeller
Domain (domain/seller/*)
  └── seller-registration.schema.ts — Zod per step + backend-aligned fields
  └── seller-registration.mapper.ts — form ↔ DTO, step resolver, parseReais/digitsOnly
  └── seller-registration.routing.ts — status-based redirects, inactive guard
  └── seller-profile.mapper.ts — computeMetadataCompleteness (reuse, no duplicate)
Lib
  └── api-client, token-storage, routes, formatters
```

**Layer boundaries:**

| Layer | Allowed | Forbidden |
|-------|---------|-----------|
| Pages / wizard | service functions, domain helpers, toast, navigate | `fetch`, `apiRequest`, DTO imports |
| seller-registration.service | orchestration, register HTTP, delegate to seller/auth | JSX; mock implementation |
| domain/seller | pure types, Zod, mappers, routing helpers | React, api-client, storage |
| seller.dto.ts / seller-registration.dto.ts | transport types only | domain logic |

---

## Component design

### 1. Registration DTOs (`src/services/seller-registration.dto.ts`)

**Change:** New file with `RegisterSellerRequestDTO`, `RegisterSellerResponseDTO`, `RegisterErrorBodyDTO` per [integration-spec.md](./integration-spec.md).

**Why:** Register response includes `sellerId` in addition to token fields; keep separate from generic `AuthTokenResponseDTO`.

**FR coverage:** FR-1, FR-21 (auth DTOs stay in `auth.dto.ts`; seller PATCH types reused from Slice A).

---

### 2. Registration mapper (`src/domain/seller/seller-registration.mapper.ts`)

**Change:** New pure module:

- `digitsOnly(value: string): string`
- `parseReais(formatted: string): number` — strip `R$`, thousand separators, comma decimal
- `formatReais(value: number): string` — for hydration display
- `mapFormToCompanyPatch()`, `mapFormToRepresentativePatch()`, `mapFormToRelationsPatch()`
- `mapSellerDtoToRegistrationForm(dto: SellerPublicViewDTO): SellerRegistrationFormValues`
- `resolveRegistrationWizardStepIndex(dto: SellerPublicViewDTO): number` — returns 1–4 (wizard steps 2–5)

**Step resolver logic (aligned with `computeMetadataCompleteness`):**

```ts
export function resolveRegistrationWizardStepIndex(dto: SellerPublicViewDTO): number {
  if (!isCompanyComplete(dto.companyMetaData)) return 1;
  if (!isLegalRepresentativeComplete(dto.legalRepresentativeMetaData)) return 2;
  if (!isBusinessRelationsComplete(dto)) return 3;
  return 4; // documents placeholder — submit allowed without doc validation
}
```

Export `isCompanyComplete`, `isLegalRepresentativeComplete`, `isBusinessRelationsComplete` from `seller-profile.mapper.ts` (currently private — make public or re-export) to avoid duplicating rules (FR-12, FR-13).

**FR coverage:** FR-13, FR-14, FR-15, FR-21.

---

### 3. Backend-aligned Zod schemas (`src/domain/seller/seller-registration.schema.ts`)

**Change:** Align field names and validation with backend contract:

| Current field | New / backend-aligned | Notes |
|---------------|----------------------|-------|
| `responsibleName` | keep (maps to register `name`) | Step 1 |
| `taxId` | keep UI label; normalize to digits in mapper → `cnpj` | min 14 digits after strip |
| `foundationDate` | keep; validate ISO `YYYY-MM-DD` | maps to `foundingDate` |
| `revenueLast12Months` | keep; parse to `annualRevenue` | monetary transform |
| `representativeName` etc. | keep; map to `fullName`, `cpf`, … | |
| — | **`representativeRole`** (new, required) | maps to `legalRepresentativeMetaData.role` |
| `clients[].taxId` | digits-only CNPJ | maps to `cnpj` |
| `clients[].averageShare` | optional; parse to `sharePercentage` | |
| `sellerRegistrationDocumentsSchema` | **`sellerRegistrationDocumentsSchemaHttp`** — optional checkboxes, no blocking | HTTP mode only |

**Representative schema addition:**

```ts
export const sellerRegistrationRepresentativeSchema = z.object({
  representativeName: z.string().trim().min(1, "Informe o nome do representante"),
  representativeCpf: z.string().trim().refine((v) => digitsOnly(v).length === 11, "Informe um CPF válido"),
  representativeEmail: z.string().trim().email("Informe um e-mail pessoal válido"),
  representativePhone: z.string().trim().refine((v) => digitsOnly(v).length >= 10, "Informe um telefone pessoal válido"),
  representativeRole: z.string().trim().min(1, "Informe o cargo do representante"),
});
```

**Documents step (HTTP):** Replace blocking `superRefine` with permissive schema when wiring wizard — documents never block submit (FR-4).

**FR coverage:** FR-13, FR-14, FR-15.

---

### 4. Seller lifecycle routing helper (`src/domain/seller/seller-registration.routing.ts`)

**Change:** New module for status-based navigation (needs raw backend status):

```ts
export type SellerLifecycleStatus = SellerStatusDTO;

export function getPostLoginSellerDestination(status: SellerLifecycleStatus): string {
  switch (status) {
    case "created":
      return ROUTES.sellerRegistration;
    case "in_review":
    case "active":
      return ROUTES.seller.dashboard;
    case "inactive":
      throw new SellerRegistrationBlockedError();
  }
}

export function getRegistrationPageRedirect(
  isAuthenticated: boolean,
  status: SellerLifecycleStatus | null,
): string | null {
  if (!isAuthenticated) return null;
  if (status === "created") return null; // allow wizard
  if (status === "in_review" || status === "active") return ROUTES.seller.dashboard;
  return ROUTES.login;
}
```

**FR-17:** Logged-in `in_review` or `active` sellers hitting `/register/seller` redirect to dashboard (not editable wizard).

**FR coverage:** FR-11, FR-17, FR-18.

---

### 5. Registration service (`src/services/seller-registration.service.ts`)

**Change:** Replace mock `registerSeller()` with HTTP-only functions:

```ts
export class SellerRegistrationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "SellerRegistrationError";
  }
}

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  email_already_exists: "Este e-mail já está cadastrado.",
  validation_error: "Verifique os dados informados e tente novamente.",
  network: "Não foi possível conectar. Tente novamente.",
};

export async function registerSellerAccess(
  payload: SellerRegistrationAccessValues,
): Promise<{ sellerId: string; session: AuthSession }> { ... }

export async function saveSellerRegistrationStep(
  stepId: "company" | "representative" | "relations",
  sellerId: string,
  values: SellerRegistrationFormValues,
): Promise<SellerCompany> { ... }

export async function finishSellerRegistration(sellerId: string): Promise<void> { ... }

export async function loadSellerRegistrationState(): Promise<{
  status: SellerStatusDTO;
  sellerId: string;
  formValues: SellerRegistrationFormValues;
  stepIndex: number;
}> {
  const sellerId = resolveSellerIdFromSession();
  const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
  if (dto.status === "inactive") throw new SellerRegistrationBlockedError();
  return {
    status: dto.status,
    sellerId,
    formValues: mapSellerDtoToRegistrationForm(dto),
    stepIndex: resolveRegistrationWizardStepIndex(dto),
  };
}

export async function fetchSellerBackendStatus(): Promise<SellerStatusDTO> {
  const sellerId = resolveSellerIdFromSession();
  const dto = await apiRequest<SellerPublicViewDTO>(`/v1/sellers/${sellerId}`);
  return dto.status;
}
```

Extract shared session helpers from `auth.service.ts` into a small internal module (e.g. `auth-session.persistence.ts`) **or** duplicate minimal `setAccessToken` + `setAuthSnapshot` calls to avoid circular imports — prefer extracting shared persistence helpers used by both login and register.

**No `resolveApiMode()` gate** — throws if `VITE_API_BASE_URL` missing (FR-19).

**FR coverage:** FR-1, FR-2, FR-3, FR-5, FR-19, FR-20, FR-21.

---

### 6. Representative step UI (`src/components/auth/seller-registration/RepresentativeStepFields.tsx`)

**Change:** Add `representativeRole` input field ("Cargo / função").

**FR coverage:** FR-13.

---

### 7. Registration wizard (`src/components/auth/SellerRegistrationWizard.tsx`)

**Change:** Step-scoped submit instead of single end-of-form mock:

```tsx
async function handleNext() {
  form.clearErrors();
  const isValid = await validateCurrentStep();
  if (!isValid) return;

  setSubmitting(true);
  try {
    if (currentStep.id === "access") {
      const { sellerId, session } = await registerSellerAccess(form.getValues());
      loginWithSession(session);
      setRegisteredSellerId(sellerId);
    } else if (registeredSellerId && isMetadataStep(currentStep.id)) {
      await saveSellerRegistrationStep(currentStep.id, registeredSellerId, form.getValues());
    }
    setCurrentStepIndex((i) => i + 1);
  } catch (err) {
    toast.error(mapRegistrationError(err));
  } finally {
    setSubmitting(false);
  }
}

async function handleSubmit() {
  if (currentStep.id !== "documents") return;
  setSubmitting(true);
  try {
    await finishSellerRegistration(registeredSellerId!);
    toast.success(
      "Cadastro concluído! Seu perfil está em análise. Responderemos em até 24 horas.",
    );
    navigate(ROUTES.sellerRegistrationComplete, {
      replace: true,
      state: { registrationComplete: true },
    });
  } catch (err) {
    toast.error(/* SellerProfileError or registration error */);
  } finally {
    setSubmitting(false);
  }
}
```

**Mount (resume):** If authenticated + seller `created`, call `loadSellerRegistrationState()`, `form.reset(formValues)`, `setCurrentStepIndex(stepIndex)`, store `sellerId`.

**Props/context:** Accept `initialSellerId` from page or read from JWT via service.

**Documents step:** Skip Zod document validation in submit path; optional UI checkboxes remain (FR-4).

**FR coverage:** FR-3, FR-4, FR-5, FR-6, FR-7, FR-12, FR-16, FR-20.

---

### 8. Registration page (`src/pages/SellerRegistrationPage.tsx`)

**Change:** Replace blunt `isAuthenticated → selectProfile` redirect with lifecycle-aware rules:

```tsx
export function SellerRegistrationPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [gate, setGate] = useState<"loading" | "wizard" | "redirect">("loading");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setGate("wizard");
      return;
    }
    void (async () => {
      try {
        const { status } = await loadSellerRegistrationState();
        const dest = getRegistrationPageRedirect(true, status);
        if (dest) {
          setRedirectTo(dest);
          setGate("redirect");
        } else {
          setGate("wizard");
        }
      } catch (err) {
        if (err instanceof SellerRegistrationBlockedError) {
          /* logout handled by caller */
        }
        setGate("wizard");
      }
    })();
  }, [isAuthenticated, isLoading]);

  if (gate === "loading") return <AuthBootstrapFallback />;
  if (gate === "redirect" && redirectTo) return <Navigate to={redirectTo} replace />;
  return (/* PublicShell + Wizard */);
}
```

**FR coverage:** FR-11, FR-12, FR-17.

---

### 9. Completion page (`src/pages/SellerRegistrationCompletePage.tsx`)

**Change:**

- Update copy: remove "when you receive approval, log in" — seller **stays logged in** (FR-8).
- Primary CTA: "Acessar minha área" → `ROUTES.seller.dashboard` with `setProfile("seller")` if not already selected.
- Secondary: home link optional.

```tsx
<Button asChild>
  <Link to={ROUTES.seller.dashboard} onClick={() => setProfile("seller")}>
    Acessar minha área
  </Link>
</Button>
```

**Decision (PRD open question):** Default landing = **seller dashboard** with under-review banner (not validation page).

**FR coverage:** FR-7, FR-8.

---

### 10. Login post-redirect (`src/components/auth/MockLoginForm.tsx`)

**Change:** After successful login in HTTP mode, fetch seller backend status before navigation:

```tsx
if (autoProfile === "seller") {
  const status = await fetchSellerBackendStatus();
  if (status === "inactive") {
    await logoutFromService();
    toast.error("Seu cadastro não foi aprovado. Entre em contato com o suporte para mais informações.");
    return;
  }
  const dest =
    status === "created"
      ? ROUTES.sellerRegistration
      : (fromPath ?? getProfileRedirect(autoProfile));
  navigate(dest, { replace: true });
}
```

Wrap in try/catch — if profile fetch fails, fall back to `getProfileRedirect`.

**FR coverage:** FR-11, FR-18.

---

### 11. Session restore inactive guard (`src/services/auth.service.ts` or registration helper)

**Change:** After `restoreSessionImpl` succeeds for seller role in HTTP mode, optionally call `fetchSellerBackendStatus()`; if `inactive`, clear storage and return `null`.

**Alternative:** Centralize in `AuthContext` restore effect — keeps auth.service focused.

**FR coverage:** FR-18.

---

### 12. Under-review banner (`src/components/layout/AppShell.tsx` + hook)

**Change:** When selected profile is `seller` and backend status is `in_review`, show persistent alert above `{children}`:

```tsx
{showUnderReviewBanner && (
  <Alert variant="default" className="mb-4">
    Seu cadastro está em análise. Responderemos em até 24 horas. Enquanto isso, você pode
    navegar pela plataforma, mas ações operacionais estão desabilitadas.
  </Alert>
)}
```

Fetch status once on mount via `fetchCurrentSeller()` + new helper `isSellerUnderReview(status)` or read from extended domain field.

**Operational disable:** Existing `canSellerRegisterDuplicatas()` already returns `false` when `validationStatus !== "APPROVED"` (mapped `in_review` → `UNDER_REVIEW`). Verify dashboard CTA, new duplicata route, and validation actions respect this — no new gate logic unless gaps found.

**FR coverage:** FR-9, FR-10.

---

### 13. Expose backend status for routing (minimal Slice A extension)

**Change:** Add to `seller-profile.mapper.ts` or `seller.types.ts`:

```ts
export type SellerProfile = SellerCompany & {
  backendStatus?: SellerStatusDTO;
};
```

Or return `{ company: SellerCompany; status: SellerStatusDTO }` from a new `fetchSellerProfile()` used only by registration/routing — avoids polluting all pages.

**Preferred:** `fetchSellerRegistrationContext(): Promise<{ status: SellerStatusDTO; company: SellerCompany }>` in `seller-registration.service.ts` using one GET.

**FR coverage:** FR-10, FR-11, FR-17, FR-18.

---

## Data flow

```
New seller — step 1 Continue
  → registerSellerAccess()
      → POST /v1/auth/register (credentials: include)
      → setAccessToken + setAuthSnapshot + loginWithSession
      → advance to step 2

Steps 2–4 Continue
  → validateCurrentStep() [Zod]
  → saveSellerRegistrationStep(stepId, sellerId, values)
      → mapFormTo*Patch() → updateSellerMetadata() → PATCH /v1/sellers/:id
      → advance step

Step 5 Finalizar
  → finishSellerRegistration(sellerId)
      → submitSellerForReview() → POST /v1/sellers/:id/submit → 204
  → toast.success (PT, 24h)
  → navigate /register/seller/complete

Resume — login with status created
  → fetchSellerBackendStatus() → created
  → navigate /register/seller
  → loadSellerRegistrationState()
      → GET /v1/sellers/:id → form.reset + stepIndex

Post-submit — CTA "Acessar minha área"
  → setProfile("seller") → /seller dashboard
  → AppShell banner (in_review) + canSellerRegisterDuplicatas === false

Inactive seller
  → login or restore → GET status inactive
  → clearAuthStorage + logout + toast (PT)
```

---

## Files changed

| File | Change type |
|------|-------------|
| `src/services/seller-registration.dto.ts` | Added |
| `src/services/seller-registration.service.ts` | Modified (HTTP-only) |
| `src/domain/seller/seller-registration.mapper.ts` | Added |
| `src/domain/seller/seller-registration.routing.ts` | Added |
| `src/domain/seller/seller-registration.schema.ts` | Modified |
| `src/domain/seller/seller-profile.mapper.ts` | Modified (export completeness helpers) |
| `src/components/auth/SellerRegistrationWizard.tsx` | Modified |
| `src/components/auth/seller-registration/RepresentativeStepFields.tsx` | Modified |
| `src/pages/SellerRegistrationPage.tsx` | Modified |
| `src/pages/SellerRegistrationCompletePage.tsx` | Modified |
| `src/components/auth/MockLoginForm.tsx` | Modified |
| `src/components/layout/AppShell.tsx` | Modified |
| `src/services/auth.service.ts` or `src/contexts/AuthContext.tsx` | Modified (inactive on restore) |
| `src/services/auth-session.persistence.ts` | Added (optional — shared register/login persistence) |

---

## Impact analysis

- **Auth/navigation:** Login and restore gain seller status checks; `created` → wizard instead of dashboard. `/register/seller` no longer redirects all authenticated users to select-profile.
- **Other personas:** Unaffected — registration routes are seller-only.
- **Service adapter:** Registration is HTTP-only; seller.service retains mock/HTTP dual mode for profile pages. No regression when `VITE_USE_MOCKS=true` on seller dashboard if registration is not used.
- **TypeScript:** New form field `representativeRole`; update autofill mock in `seller-registration.autofill.ts`.
- **Slice A reuse:** PATCH/GET/submit/error mapping delegated — do not fork DTO mapping (FR-21).
- **Duplicata gate:** `in_review` sellers see shell but `canSellerRegisterDuplicatas` stays false until admin sets `active` (FR-9, FR-10).

---

## Test strategy

_(No automated test runner — manual verification + typecheck gate.)_

### Manual — Happy path (new registration)

| Step | Expected result |
|------|-----------------|
| Open `/register/seller`, complete step 1 | `POST /v1/auth/register` 201; session stored; step 2 |
| Complete steps 2–4 | Each `PATCH /v1/sellers/:id` 200 with partial body |
| Step 5 finalize without documents | `POST .../submit` 204; toast PT; completion page |
| CTA "Acessar minha área" | Logged-in seller dashboard; banner "em análise" |
| `GET /v1/sellers/:id` | `status: in_review`; metadata persisted |

### Manual — Resume

| Step | Expected result |
|------|-----------------|
| Complete step 1 only, close browser | Seller exists, `status: created` |
| Login same credentials | Redirect to `/register/seller`; form prefilled; opens first incomplete step (≥ step 2) |
| No localStorage draft | Data matches backend GET |

### Manual — Status gates

| Step | Expected result |
|------|-----------------|
| `in_review` seller opens `/register/seller` | Redirect to dashboard |
| `active` seller opens `/register/seller` | Redirect to dashboard |
| `inactive` seller login | Session cleared; PT rejection toast; no seller routes |
| Admin sets seller `active` (backend) | Banner gone; duplicata actions enabled per existing gates |

### Manual — Errors

| Step | Expected result |
|------|-----------------|
| Register duplicate email | Toast: "Este e-mail já está cadastrado." |
| PATCH with invalid CNPJ | Toast: validation_error PT message |
| Submit incomplete metadata | Toast: incomplete_metadata PT message |
| PATCH after submit | Toast: metadata_locked |

### Typecheck

- `npm run typecheck` must pass with 0 errors after all changes.

---

## Open questions resolved

| Question (from PRD) | Decision |
|---------------------|----------|
| Admin rejection: seller `inactive` vs account `inactive`? | Frontend blocks after `GET /v1/sellers/:id` when `status === inactive`. Does not depend on backend login enhancement. |
| PT copy for `inactive` vs `in_review` banner? | **Inactive login:** "Seu cadastro não foi aprovado. Entre em contato com o suporte para mais informações." **In-review banner:** "Seu cadastro está em análise. Responderemos em até 24 horas…" (see §12). |
| Completion CTA landing route? | **Seller dashboard** (`ROUTES.seller.dashboard`) with `setProfile("seller")`. |
| Step 5 in step indicator? | Keep visible; description note "Documentos — em breve" optional polish; does not block submit. |
| Global `VITE_USE_MOCKS` cleanup? | **Follow-up PR.** Registration is HTTP-only; other services may keep mock gate until separate cleanup. |

---

## Functional requirements traceability

| FR | Addressed in |
|----|--------------|
| FR-1 | §5 registerSellerAccess — POST register + credentials include |
| FR-2 | §5 session persistence before step 2 |
| FR-3 | §5 saveSellerRegistrationStep, §7 handleNext steps 2–4 |
| FR-4 | §3 documents schema HTTP, §7 skip doc validation on finalize |
| FR-5 | §5 finishSellerRegistration → submit |
| FR-6 | §7 toast.success on submit |
| FR-7 | §7 navigate to completion route |
| FR-8 | §9 completion CTA keeps session → seller area |
| FR-9 | §12 banner + existing canSellerRegisterDuplicatas gates |
| FR-10 | §12 active lifts restrictions via Slice A status mapping |
| FR-11 | §10 login redirect created → wizard |
| FR-12 | §2 loadSellerRegistrationState, §7 mount hydration |
| FR-13 | §3 schemas + §6 representativeRole field |
| FR-14 | §2 digitsOnly normalization in mapper |
| FR-15 | §2 parseReais → number reais |
| FR-16 | §5 error messages, §7 toast.error |
| FR-17 | §8 registration page redirect in_review/active |
| FR-18 | §10 login, §11 restore inactive guard |
| FR-19 | §5 HTTP-only registration service |
| FR-20 | §7 wizard uses service only |
| FR-21 | §5 delegates to seller.service + Slice A DTOs/mappers |
