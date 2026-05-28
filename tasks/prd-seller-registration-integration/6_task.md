# Task 6.0: Wire wizard step-scoped register, PATCH, submit, and resume

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Refactor `SellerRegistrationWizard.tsx` from a single end-of-form mock submit to step-scoped API calls: register on step 1, PATCH on steps 2–4, submit on step 5, plus resume hydration for logged-in sellers with `created` status. Corresponds to techspec Component design §7.

Depends on: 2.0, 4.0, 5.0

## Requirements

- FR-1, FR-2: Step 1 "Continue" calls `registerSellerAccess()`, persists session via `loginWithSession()`, stores `sellerId`
- FR-3: Steps 2–4 "Continue" call `saveSellerRegistrationStep()` after Zod validation
- FR-4: Step 5 skips document validation in HTTP mode — optional UI checkboxes remain
- FR-5: "Finish registration" calls `finishSellerRegistration()`
- FR-6: Success toast in Portuguese with 24-hour review messaging
- FR-7: Navigate to completion route on successful submit
- FR-12: On mount for authenticated `created` seller, call `loadSellerRegistrationState()`, reset form, set step index
- FR-16: Show Portuguese error toasts via `mapRegistrationError()` / `SellerProfileError` mapping
- FR-20: Wizard calls service functions only — no direct HTTP or DTO imports

## Subtasks

- [ ] 6.1 Read current `SellerRegistrationWizard.tsx` step handlers and form setup
- [ ] 6.2 Implement `handleNext()` with step-scoped register and PATCH calls
- [ ] 6.3 Implement `handleSubmit()` for documents step → `finishSellerRegistration()` + toast + navigate
- [ ] 6.4 Add mount effect for resume: `loadSellerRegistrationState()` → `form.reset()` + `setCurrentStepIndex()`
- [ ] 6.5 Track `registeredSellerId` in component state; use HTTP documents schema on step 5
- [ ] 6.6 Verify wizard flow in browser against local backend (manual check)
- [ ] 6.7 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → Component design §7** and **integration-spec.md → Pages & components**.

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

Resume mount: if authenticated + seller `created`, hydrate from backend — no localStorage draft. Step index from `resolveRegistrationWizardStepIndex()` (1–4 maps to wizard steps 2–5).

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] Step 1 registers and establishes session before advancing
- [ ] Steps 2–4 PATCH metadata per step after validation
- [ ] Step 5 submits without document validation blocking
- [ ] Resume hydrates form and opens first incomplete step from backend GET
- [ ] Error toasts display in Portuguese for register/PATCH/submit failures
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-registration-integration/prd.md` ← read first
- `tasks/prd-seller-registration-integration/techspec.md` ← read first
- `tasks/prd-seller-registration-integration/integration-spec.md` ← read first
- `src/components/auth/SellerRegistrationWizard.tsx` ← modify
- `src/services/seller-registration.service.ts` ← read
- `src/domain/seller/seller-registration.schema.ts` ← read
- `src/contexts/AuthContext.tsx` ← read (loginWithSession)
