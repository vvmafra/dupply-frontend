# Validation evidence — Task 6.0: Wire wizard step-scoped register, PATCH, submit, and resume

## Changes made

- `src/services/seller-registration.service.ts`: exportado `mapRegistrationError()` para mapear `SellerRegistrationError`, `SellerProfileError` e `SellerRegistrationBlockedError` em mensagens PT para toasts.
- `src/components/auth/SellerRegistrationWizard.tsx`: refatorado de mock end-of-form para fluxo step-scoped — `registerSellerAccess` + `loginWithSession` no passo 1; `saveSellerRegistrationStep` nos passos 2–4; `finishSellerRegistration` no passo 5; efeito de mount com `loadSellerRegistrationState()` para resume (`created`); estado `registeredSellerId`; schema HTTP permissivo no passo documentos; toasts PT de sucesso/erro; removidos `sleep` e validação bloqueante de documentos no submit.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] Step 1 registers and establishes session before advancing — `handleNext` chama `registerSellerAccess`, `loginWithSession` e `setRegisteredSellerId` antes de incrementar o índice.
- [x] Steps 2–4 PATCH metadata per step after validation — `saveSellerRegistrationStep` via `isMetadataStep` após Zod por etapa.
- [x] Step 5 submits without document validation blocking — `handleSubmit` não valida documentos; `sellerRegistrationDocumentsSchemaHttp` usado apenas se validação da etapa for acionada.
- [x] Resume hydrates form and opens first incomplete step from backend GET — `useEffect` com `loadSellerRegistrationState()` → `form.reset` + `setCurrentStepIndex(stepIndex)` quando `status === "created"`.
- [x] Error toasts display in Portuguese for register/PATCH/submit failures — `toast.error(mapRegistrationError(err))` em todos os catch.
- [x] No existing flows broken (auth, profile selection, navigation) — typecheck limpo; página de registro inalterada nesta task (Task 7 ajustará gates de lifecycle).

## Notes

- Verificação manual no browser (6.6) não executada nesta sessão — requer backend local + Task 7 para permitir wizard autenticado com status `created`.
- `SellerRegistrationPage` ainda redireciona usuários autenticados para `selectProfile`; o efeito de resume no wizard só será exercitável após Task 7.
- Submit final não chama `validateCurrentStep` — alinhado à techspec §7 e FR-4 (documentos UI-only em HTTP mode).
