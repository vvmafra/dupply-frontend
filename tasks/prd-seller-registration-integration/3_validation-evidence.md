# Validation evidence — Task 3.0: Add seller lifecycle routing helpers

## Changes made

- `src/domain/seller/seller-registration.routing.ts`: criado módulo puro de roteamento com `SellerLifecycleStatus`, `SellerRegistrationBlockedError`, `getPostLoginSellerDestination()` e `getRegistrationPageRedirect()` conforme techspec §4.
- `tasks/prd-seller-registration-integration/tasks.md`: tarefa 3.0 marcada como concluída.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] Routing helpers cover all four lifecycle statuses — `getPostLoginSellerDestination` trata `created`, `in_review`, `active` e `inactive`; `getRegistrationPageRedirect` trata autenticado/não autenticado e os quatro status.
- [x] `inactive` throws `SellerRegistrationBlockedError` instead of returning a route — `getPostLoginSellerDestination("inactive")` lança erro com mensagem PT padrão.
- [x] No existing flows broken — módulo novo sem wiring em páginas/auth; typecheck limpo.

## Notes

- `SellerRegistrationBlockedError` inclui mensagem PT padrão da techspec ("Seu cadastro não foi aprovado…") para uso pelas tasks 4, 7 e 8.
- Nenhum desvio da techspec identificado.
