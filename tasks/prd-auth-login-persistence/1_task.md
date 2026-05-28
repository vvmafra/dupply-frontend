# Task 1.0: Extract auth transport DTOs

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create `src/services/auth.dto.ts` and move inline transport types from `auth.service.ts` into dedicated DTO definitions. This separates HTTP contract types from service logic and aligns with the integration spec adapter pattern (migration Phase A).

Depends on: none

## Requirements

- Define `LoginRequestDTO`, `AuthTokenResponseDTO`, `AuthErrorBodyDTO`, and `AccountResponseDTO` per integration-spec.md (FR-3, FR-24 transport layer)
- Remove inline `LoginResponseDto` and `ErrorBody` types from `auth.service.ts`
- Import DTO types in `auth.service.ts` without changing runtime behavior

## Subtasks

- [ ] 1.1 Read `integration-spec.md` DTO definitions and `auth.service.ts` inline types
- [ ] 1.2 Create `src/services/auth.dto.ts` with exported DTO types
- [ ] 1.3 Update `auth.service.ts` to import DTOs; delete inline type aliases
- [ ] 1.4 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **integration-spec.md → DTO definitions** and **techspec.md → Component design §4 Auth service**.

```ts
// src/services/auth.dto.ts
export type LoginRequestDTO = { email: string; password: string };

export type AuthTokenResponseDTO = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
};

export type AuthErrorBodyDTO = { error: string; message?: string };

export type AccountResponseDTO = {
  id: string;
  email: string;
  role: "seller" | "payer" | "risk_analyst" | "risk_analyst_agent" | "admin";
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};
```

Replace `LoginResponseDto` → `AuthTokenResponseDTO` and `ErrorBody` → `AuthErrorBodyDTO` in `mapHttpLoginError` and `httpLoginImpl`. No functional changes in this task — refactor only.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `auth.dto.ts` exists with all four DTO types exported
- [ ] `auth.service.ts` has no inline HTTP response/error type aliases
- [ ] Mock and HTTP login behavior unchanged (no regression)

## Relevant files

- `tasks/prd-auth-login-persistence/prd.md` ← read first
- `tasks/prd-auth-login-persistence/techspec.md` ← read first
- `tasks/prd-auth-login-persistence/integration-spec.md` ← read first
- `src/services/auth.dto.ts` ← create
- `src/services/auth.service.ts` ← modify
