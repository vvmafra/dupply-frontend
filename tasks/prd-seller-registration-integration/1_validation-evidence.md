# Validation evidence — Task 1.0: Create registration DTOs and domain mapper

## Changes made

- `src/services/seller-registration.dto.ts`: criado com `RegisterSellerRequestDTO`, `RegisterSellerResponseDTO` e `RegisterErrorBodyDTO` conforme integration-spec.
- `src/domain/seller/seller-registration.mapper.ts`: criado com `digitsOnly`, `parseReais`, `formatReais`, mappers form ↔ PATCH (`mapFormToCompanyPatch`, `mapFormToRepresentativePatch`, `mapFormToRelationsPatch`), `mapSellerDtoToRegistrationForm` (com padding de clientes/fornecedores para 5 linhas) e `resolveRegistrationWizardStepIndex`.
- `src/domain/seller/seller-profile.mapper.ts`: exportados `isCompanyComplete`, `isLegalRepresentativeComplete` e `isBusinessRelationsComplete` para reutilização pelo step resolver sem duplicar regras.
- `src/domain/seller/seller-registration.schema.ts`: adicionado campo `representativeRole` ao schema e valores iniciais (pré-requisito para o mapper de hidratação).

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] `seller-registration.dto.ts` e `seller-registration.mapper.ts` existem com todas as funções da integration-spec — arquivos criados e verificados.
- [x] Completeness helpers exportados de `seller-profile.mapper.ts` sem duplicar regras — funções privadas tornadas `export`.
- [x] Nenhum fluxo existente quebrado — apenas tipos/mappers puros; sem wiring de runtime; typecheck limpo.

## Notes

- `representativeRole` foi adicionado ao schema com validação mínima (`z.string()`); a validação Zod completa (required + mensagens PT) fica para a Task 2.0.
- Nenhum desvio da techspec identificado.
