# Tech Stack

**Analyzed:** 2026-05-19

## Core

- Framework: React 19.2.4
- Language: TypeScript 5.9.3 (strict mode)
- Runtime: Browser (SPA via Vite 7.3.1)
- Package manager: npm (lockfile implícito via `node_modules`; sem `package-lock.json` visível no glob inicial)

## Frontend

- UI Framework: React 19 + React Router DOM 7.15.0
- Styling: Tailwind CSS 4.2.1 (`@tailwindcss/vite`), utilitários `clsx` + `tailwind-merge` (`cn()`)
- Component library: shadcn/ui (Radix UI 1.4.3, `components.json`, ~50 componentes em `src/components/ui/`)
- State Management: React Context (`AuthContext`) + `useState`/`useEffect` local por página — sem Redux/Zustand/React Query
- Form Handling: react-hook-form 7.72.0 + @hookform/resolvers 5.2.2 + Zod 4.3.6 (cadastro de cedente); formulário de duplicata usa estado manual
- Theming: next-themes 0.4.6 (dark default), persistido em `localStorage` (`vite-ui-theme`)
- Notifications: sonner 2.0.7
- Charts: recharts 3.8.0 (dashboard admin/analyst)
- Icons: lucide-react 1.6.0
- Dates: date-fns 4.1.0, react-day-picker 9.14.0

## Backend

- API Style: **Nenhum backend real** — serviços mockados em `src/services/` com latência simulada
- Database: Dados em memória (`let` mutável nos serviços + arrays em `src/data/*.mock.ts`)
- Authentication: Mock client-side (`auth.service.ts` + `AuthContext`) — sem JWT, cookies ou OAuth

## Testing

- Unit: **Não configurado** (sem Vitest/Jest no `package.json`)
- Integration: **Não configurado**
- E2E: **Não configurado** (sem Playwright/Cypress)
- Coverage: **Não configurado**

## External Services

- Fonts: Google Fonts (Inter) via CDN em `index.html`
- Blockchain explorer: Stellar testnet (`stellar.expert`) — link externo em `AdminTransactionTable.tsx`
- Backend/API: **Nenhum** — protótipo 100% mockado

## Development Tools

- Bundler/dev server: Vite 7 + `@vitejs/plugin-react` 5.2.0
- Type checking: `tsc --noEmit` (`npm run typecheck`)
- Build: `tsc -b && vite build`
- Path alias: `@/` → `src/` (Vite + `tsconfig.app.json`)
- Linting: TypeScript strict apenas (`noUnusedLocals`, `noUnusedParameters`, etc.) — **sem ESLint/Prettier**
- CI: **Não configurado** (sem `.github/workflows`)

## Scripts disponíveis

| Script | Comando | Propósito |
|--------|---------|-----------|
| `dev` | `vite` | Servidor de desenvolvimento |
| `build` | `tsc -b && vite build` | Build de produção |
| `typecheck` | `tsc --noEmit` | Verificação de tipos |
| `preview` | `vite preview` | Preview do build |

## Observações

- Nome do pacote em `package.json`: `"shadcn-ui-template"` — herança do template, não reflete o produto Dupply.
- README contém apenas o título `# dupply-frontend` — sem instruções de setup.
