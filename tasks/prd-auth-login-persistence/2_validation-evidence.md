# Validation evidence — Task 2.0: Add credentials support to the API client

## Changes made

- `src/lib/api-client.ts`: adicionado `credentials?: RequestCredentials` em `ApiRequestOptions` e repasse `credentials: options.credentials` na chamada `fetch()`. Quando omitido, permanece `undefined` e o comportamento padrão do navegador não muda para callers existentes.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] `ApiRequestOptions` exports optional `credentials` field — tipo exportado com JSDoc.
- [x] Existing `apiRequest` callers compile without changes — nenhum caller precisou de alteração.
- [x] No existing flows broken — sem default global `"include"`; apenas infraestrutura para Task 3.

## Notes

- `credentials: "include"` nas rotas `/v1/auth/*` fica para a Task 3 (`auth.service.ts`), conforme escopo desta task.
