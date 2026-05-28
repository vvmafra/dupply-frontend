# Task 6.0: Add error handling to remaining seller pages and optional KYC copy tweak

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Complete seller profile integration on the new duplicata entry gate and duplicatas list pages by surfacing fetch errors via toast (currently silent on failure). Optionally adjust `SellerKycCard` copy in HTTP mode so the submit action reads "Enviar cadastro para análise" instead of mock-oriented "Iniciar verificação". This is the final task — includes full manual HTTP verification checklist and typecheck gate.

Depends on: 4, 5

## Requirements

- FR-3: User-friendly Portuguese error when `fetchCurrentSeller()` fails on new duplicata and duplicatas list pages
- FR-6: Active seller with mapped `analystDuplicatasAccess=APPROVED` can open duplicata registration gate even though duplicata list data stays mock
- FR-13: No silent catch on seller fetch; loading gates prevent mock flash
- FR-15: No page-level env checks — rely on service adapter only

## Subtasks

- [ ] 6.1 Read `NewDuplicataPage.tsx`, `SellerDuplicatasPage.tsx`, and optional `SellerKycCard.tsx`
- [ ] 6.2 Add `SellerProfileError` toast on `fetchCurrentSeller()` failure in `NewDuplicataPage`
- [ ] 6.3 Add same error toast pattern in `SellerDuplicatasPage` (seller fetch only; list stays mock)
- [ ] 6.4 (Optional) Adjust `SellerKycCard` copy for HTTP mode via prop or env helper
- [ ] 6.5 Manual verification — mock mode regression + HTTP mode seller profile (see techspec test strategy)
- [ ] 6.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §8, §9, §10** and **Test strategy**.

**New duplicata page** — replace silent catch:

```tsx
try {
  const s = await fetchCurrentSeller();
  setSeller(s);
} catch (err) {
  toast.error(
    err instanceof SellerProfileError
      ? err.message
      : "Não foi possível carregar os dados do vendedor.",
  );
} finally {
  setLoading(false);
}
```

**Seller duplicatas list** — same pattern for seller fetch; `fetchDuplicatasBySeller` remains mock.

**Optional KYC card** — accept `mode?: "mock" | "http"` or detect via existing env helper:

| Mode | Button label |
|------|-------------|
| mock | "Iniciar verificação" (unchanged) |
| http | "Enviar cadastro para análise" |

### Manual verification checklist

**Mock mode (`VITE_USE_MOCKS=true`):**
- Login as seller → dashboard shows `MOCK_SELLERS[0]` after skeleton
- Validation KYC simulate → status updates locally
- Approved mock seller → new duplicata gate opens

**HTTP mode (`VITE_USE_MOCKS=false`, backend running):**
- Login seller → dashboard shows **logged-in seller's** data, not `MOCK_SELLERS[0]`
- Submit with incomplete metadata → PT incomplete message
- Submit with complete metadata → status `in_review`; UI shows "Em análise"
- Backend `active` seller → duplicata registration gate opens (list still mock)
- PATCH after submit → metadata locked toast (PT)

**Error states:**
- Cleared token → 401 logout or error toast; no mock flash
- Admin session with seller profile selected → graceful PT error

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] New duplicata and duplicatas list pages show PT toast on seller fetch failure
- [ ] Active HTTP seller can access duplicata registration gate (`canSellerRegisterDuplicatas`)
- [ ] Mock mode behavior identical to pre-integration demo
- [ ] HTTP mode E2E manual checklist passes (or documented blockers e.g. CORS)
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-profile-integration/prd.md` ← read first
- `tasks/prd-seller-profile-integration/techspec.md` ← read first
- `tasks/prd-seller-profile-integration/integration-spec.md` ← read first
- `src/pages/seller/NewDuplicataPage.tsx` ← modify
- `src/pages/seller/SellerDuplicatasPage.tsx` ← modify
- `src/components/seller/SellerKycCard.tsx` ← modify (optional)
- `src/domain/seller/seller-profile.errors.ts` ← import
- `src/domain/seller/seller-duplicata-access.ts` ← read
- `src/services/seller.service.ts` ← read (Task 4)
