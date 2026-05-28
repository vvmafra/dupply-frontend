# Validation evidence — Task 1.0: Extract auth transport DTOs

## Changes made

- `src/services/auth.dto.ts`: criado com os quatro tipos de transporte exportados (`LoginRequestDTO`, `AuthTokenResponseDTO`, `AuthErrorBodyDTO`, `AccountResponseDTO`) conforme integration-spec.md.
- `src/services/auth.service.ts`: removidos os aliases inline `LoginResponseDto` e `ErrorBody`; importados `AuthTokenResponseDTO` e `AuthErrorBodyDTO` de `./auth.dto`; substituídas referências em `mapHttpLoginError` e `httpLoginImpl`. Comportamento em runtime inalterado.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] `auth.dto.ts` exists with all four DTO types exported — arquivo criado com os quatro tipos.
- [x] `auth.service.ts` has no inline HTTP response/error type aliases — `LoginResponseDto` e `ErrorBody` removidos.
- [x] Mock and HTTP login behavior unchanged (no regression) — apenas refactor de tipos; lógica de `mockLoginImpl`, `httpLoginImpl` e `mapHttpLoginError` preservada.

## Notes

- `LoginRequestDTO` e `AccountResponseDTO` foram definidos para uso em tasks futuras (refresh, hydration); ainda não referenciados em `auth.service.ts` nesta task, conforme escopo (Phase A da migration plan).
- `AuthErrorBodyDTO.error` é obrigatório no DTO da spec (antes era opcional em `ErrorBody`); o cast em `mapHttpLoginError` continua seguro com optional chaining.
