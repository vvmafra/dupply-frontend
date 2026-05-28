# Validation evidence — Task 1.0: Create receivable DTOs, domain types, errors, status labels, and anticipation helper

## Changes made

- `src/services/receivable.dto.ts`: all DTO types from integration-spec
- `src/domain/receivable/receivable.types.ts`: backend-aligned domain types
- `src/domain/receivable/receivable.errors.ts`: `ReceivableError` + PT messages
- `src/domain/receivable/receivable.status.ts`: `RECEIVABLE_STATUS_LABELS` including badge-only statuses
- `src/domain/receivable/receivable-antecipacao.helpers.ts`: `calcProposedValueFromDiscount`

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] All DTO types from integration-spec exist
- [x] Domain types cover list, detail, and form models
- [x] Error messages match integration-spec table
- [x] No existing flows broken
