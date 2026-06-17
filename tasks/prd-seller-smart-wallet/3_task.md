# Task 3.0: Add wallet DTOs and HTTP service adapter

<critical>Read prd.md and techspec.md in this folder before starting. Your work will be rejected if you skip this.</critical>

## Overview

Create transport DTOs mirroring the backend wallet module and implement HTTP-only service functions for registering and fetching seller wallets. Corresponds to techspec §2 (Wallet DTOs and service) and integration-spec endpoint map.

Depends on: 2.0

## Requirements

- FR-11: Service must POST `{ contractId, credentialId, signerPublicKey, network, createdTxHash? }` to `/v1/sellers/:id/wallet`
- FR-14: API errors must be mapped to Portuguese messages via `mapWalletApiError()` from task 2
- HTTP mode only — mock wallet simulation is out of scope (throw `http_only` in mock mode)

## Subtasks

- [ ] 3.1 Read `src/services/seller.service.ts` and an existing service adapter (e.g. `auth.service.ts`) for patterns
- [ ] 3.2 Create `src/services/wallet.dto.ts` with `RegisterSellerWalletRequestDTO`, `WalletPublicViewDTO`, and error body type
- [ ] 3.3 Create `src/services/wallet.service.ts` with `registerSellerWallet()` and `fetchSellerWallet()`
- [ ] 3.4 Resolve seller ID from JWT session token (same pattern as seller service)
- [ ] 3.5 Run `npm run typecheck` — 0 errors

## Implementation details

Reference **techspec.md → §2 Wallet DTOs and service** and **integration-spec.md → DTO definitions, Endpoint map**.

```ts
export async function registerSellerWallet(
  payload: RegisterSellerWalletRequestDTO,
): Promise<WalletPublicViewDTO> {
  if (resolveApiMode() !== "http") {
    throw new WalletRegistrationError("http_only", "Cadastro de carteira requer conexão com o servidor.");
  }
  const sellerId = resolveSellerIdFromSession();
  try {
    return await apiRequest<WalletPublicViewDTO>(`/v1/sellers/${sellerId}/wallet`, {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    throw mapWalletApiError(error);
  }
}
```

UI components must not import DTOs directly — they consume domain/context APIs. Do not add React or SDK code in this task.

## Success criteria

- [ ] `npm run typecheck` passes with 0 errors
- [ ] `registerSellerWallet()` POSTs to `/v1/sellers/:id/wallet` with correct payload shape
- [ ] `fetchSellerWallet()` GETs wallet for authenticated seller
- [ ] Both functions throw `WalletRegistrationError` in mock mode
- [ ] API errors map to Portuguese messages per integration-spec table
- [ ] No existing flows broken (auth, profile selection, navigation)

## Relevant files

- `tasks/prd-seller-smart-wallet/prd.md` ← read first
- `tasks/prd-seller-smart-wallet/techspec.md` ← read first
- `tasks/prd-seller-smart-wallet/integration-spec.md` ← read first
- `src/services/wallet.dto.ts` ← create
- `src/services/wallet.service.ts` ← create
- `src/domain/wallet/wallet.errors.ts` ← read (from task 2)
