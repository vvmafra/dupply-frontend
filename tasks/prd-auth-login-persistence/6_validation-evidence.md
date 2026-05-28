# Validation evidence — Task 6.0: Migrate remaining literal route paths to ROUTES constants

## Changes made

- `src/lib/routes.ts`: adicionado bloco `seller.receivables` com paths legados (`list`, `new`, `detail`) para redirects; `confirmation` reestruturado como objeto com `path` (padrão de rota) e `detail(id)` (navegação). Helpers `analyst.sellers.detail` e `admin.sellers.detail` já existiam — nenhuma alteração necessária.
- `src/App.tsx`: substituídos todos os literais restantes (`/confirmation/:id`, `/seller/receivables/*`, `/analyst/sellers/:sellerId`, `/analyst/duplicatas/:id`, `/admin/sellers/:sellerId`) por constantes `ROUTES.*` ou composição a partir de `ROUTES.*.list`.

## Typecheck result

```
npm run typecheck → ✅ 0 errors
```

## Success criteria

- [x] `npm run typecheck` passes with 0 errors — executado com sucesso.
- [x] No new literal persona/dashboard paths in `App.tsx` — nenhum `path="/..."` literal restante; rotas parametrizadas usam `ROUTES.confirmation.path` ou `${ROUTES.*.list}/:param`.
- [x] Deep links to analyst/admin seller detail pages still work — padrões de rota preservados (`/analyst/sellers/:sellerId`, `/admin/sellers/:sellerId`) via composição a partir das listas existentes; helpers `detail(id)` inalterados para links de navegação.
- [x] No existing flows broken — guards em `guards.tsx` já usavam `ROUTES.*`; redirects legados de receivables mantêm os mesmos destinos.

## Notes

- `confirmation` passou de função top-level para `{ path, detail }` porque não havia usos de `ROUTES.confirmation(id)` no codebase; `path` cobre a definição de rota no React Router e `detail(id)` fica disponível para navegação futura.
- Rotas parametrizadas em `App.tsx` usam template `${ROUTES.*.list}/:param` em vez de duplicar o segmento base — alinhado ao estilo de aninhamento existente em `routes.ts`.
- `SellerReviewDetailPage.tsx` ainda usa `location.pathname.startsWith("/admin/sellers")` — fora do escopo desta task (FR-16 foca em router paths em `App.tsx`).
