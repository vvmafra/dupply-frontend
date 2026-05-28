# Validation evidence — Task 2.0: Add Zod schema, mappers, and seller receivable access gate

## Changes made

- `src/domain/receivable/receivable.schema.ts`: draft and submit schemas; document fields optional
- `src/domain/receivable/receivable.mapper.ts`: row/form mappers + `deriveDiscountPercent`
- `src/domain/seller/seller-receivable-access.ts`: `canSellerRegisterReceivables`

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] All mapper functions from techspec §5 exist; null metadata handled
- [x] Zod submit schema excludes document booleans
- [x] Seller gate exported and ready for pages
