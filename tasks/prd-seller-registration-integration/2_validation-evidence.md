# Validation evidence — Task 2.0: Align Zod schemas with backend metadata contract

## Changes made

- `src/domain/seller/seller-registration.schema.ts`: helpers locais `digitsOnly` e `parseReais` (evita dependência circular com o mapper); refinamentos de dígitos em CNPJ/CPF/telefone/CEP; validação ISO em `foundationDate`; campos monetários com `brlMonetaryString`; `representativeRole` obrigatório com mensagem PT; `sellerRegistrationDocumentsSchemaHttp` permissivo; export de `sellerRegistrationSchemaHttp` para uso na Task 6. `SELLER_REGISTRATION_STEPS` mantém o schema bloqueante de documentos (wizard não alterado nesta task).
- `src/domain/seller/seller-registration.autofill.ts`: adicionado `representativeRole: "Sócio Administrador"` no autofill do passo representante.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] All five step schemas validate backend-aligned rules with Portuguese messages — access, company, representative, relations e documents (mock) atualizados; company/representative/relations com refinamentos de dígitos e monetários.
- [x] `representativeRole` is required in representative step schema — `z.string().trim().min(1, "Informe o cargo do representante")`.
- [x] HTTP documents schema is permissive and does not block submit — `sellerRegistrationDocumentsSchemaHttp` com `documents` opcional, sem `superRefine`.
- [x] No existing flows broken (auth, profile selection, navigation) — wizard continua usando schemas existentes em `SELLER_REGISTRATION_STEPS`; sem wiring HTTP; typecheck limpo.

## Notes

- `digitsOnly` / `parseReais` foram co-localizados no schema (em vez de importar do mapper) para evitar dependência circular `schema ↔ mapper`.
- `sellerRegistrationSchemaHttp` exportado mas ainda não referenciado pelo wizard — conforme escopo da Task 6.
