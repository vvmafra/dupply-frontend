# Task 5.0: Wire seller dashboard and validation pages for HTTP fetch and submit

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Update the seller dashboard and validation pages to handle `SellerProfileError` on fetch, avoid rendering stale data on failure, and wire the validation page's KYC/submit action to `updateSellerValidationStatus` → `submitSellerForReview` in HTTP mode with refetch on success. Corresponds to techspec Component design §6 and §7.

Depends on: 4

## Requirements

- FR-3: Show user-friendly Portuguese toast when seller fetch fails (missing session, wrong profile, API errors)
- FR-9: On submit success, refetch seller via `fetchCurrentSeller()` so UI reflects `in_review` mapped state
- FR-10: Surface `metadata_locked` (409) via toast — do not silently discard the attempt
- FR-11: Surface `incomplete_metadata` (400) via toast in Portuguese
- FR-13: Loading skeleton gates render; no flash of mock data before HTTP response in HTTP mode

## Subtasks

- [ ] 5.1 Read `SellerDashboardPage.tsx` and `SellerValidationPage.tsx` current fetch/submit flows
- [ ] 5.2 Add try/catch + `SellerProfileError` toast on dashboard `fetchCurrentSeller()`
- [ ] 5.3 Add same fetch error handling on validation page
- [ ] 5.4 Update `handleKycApproved` — call `updateSellerValidationStatus`, refetch on success, toast errors
- [ ] 5.5 Verify component renders correctly (manual browser check — mock mode)
- [ ] 5.6 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §6, §7** and **integration-spec.md → Page pattern**.

**Dashboard:**

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

**Validation page submit (HTTP mode):**

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

HTTP mode UX: mock KYC simulation stays in mock mode. In HTTP mode, the card action represents **submit for review** — backend validates metadata completeness. Full PATCH edit forms are deferred unless already on the page.

Do not call `fetch` or import DTOs in pages.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Dashboard shows error toast on fetch failure; does not render seller cards with null/stale data
- [ ] Validation page submit refetches seller and shows success toast on HTTP submit
- [ ] `metadata_locked` and `incomplete_metadata` errors display Portuguese messages from service
- [ ] Mock mode KYC simulation still works unchanged
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-profile-integration/prd.md` ← read first
- `tasks/prd-seller-profile-integration/techspec.md` ← read first
- `tasks/prd-seller-profile-integration/integration-spec.md` ← read first
- `src/pages/seller/SellerDashboardPage.tsx` ← modify
- `src/pages/seller/SellerValidationPage.tsx` ← modify
- `src/domain/seller/seller-profile.errors.ts` ← import
- `src/services/seller.service.ts` ← read (Task 4)
