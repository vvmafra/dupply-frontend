# Validation evidence — Task 5.0: Add representative role field to wizard UI

## Changes made

- `src/components/auth/seller-registration/RepresentativeStepFields.tsx`: adicionado `FormField` para `representativeRole` com label "Cargo / função", placeholder "Ex.: Sócio Administrador" e `FormMessage` para exibir o erro Zod ("Informe o cargo do representante"). Campo posicionado após o nome completo, seguindo o mesmo padrão dos demais inputs do passo.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] Representative step shows "Cargo / função" input bound to `representativeRole` — `FormField` com `name="representativeRole"` no passo "representative" do wizard (`SellerRegistrationWizard.tsx`).
- [x] Field validation error displays when empty on step submit — schema `sellerRegistrationRepresentativeSchema` já exige o campo; `FormMessage` renderiza o erro do react-hook-form/Zod no submit do passo.
- [x] No existing flows broken — diff limitado a um campo UI; schema, valores iniciais e autofill já alinhados nas tasks 1–2.

## Notes

- Escopo da task: apenas UI; sem wiring de API (Task 6).
- Verificação visual no browser não executada pelo agente (MCP browser indisponível). Recomendado: `http://localhost:5173/register/seller` → passo "Representante" → confirmar label "Cargo / função" e erro ao continuar com campo vazio.
