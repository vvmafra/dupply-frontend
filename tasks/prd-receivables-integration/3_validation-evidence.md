# Validation evidence — Task 3.0: Implement HTTP-only receivable service

## Changes made

- `src/services/receivable.service.ts`: 9 HTTP functions, `assertReceivableApiConfigured`, `mapReceivableApiError`

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] All 9 service functions return domain types
- [x] No mock imports or sleep
- [x] Risk offer sends `{ decision: "offer", proposedValue }` in reais
