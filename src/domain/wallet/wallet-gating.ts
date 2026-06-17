import type { SellerLifecycleStatus } from "@/domain/seller/seller-registration.routing";
import { ROUTES } from "@/lib/routes";

export function requiresWalletSetup(
  status: SellerLifecycleStatus | null,
  walletId: string | null,
): boolean {
  return status === "active" && walletId === null;
}

export const SELLER_WALLET_SETUP_ROUTE = ROUTES.seller.walletSetup;

/** Routes blocked until wallet is registered (FR-3). */
export const SELLER_WALLET_GATED_ROUTES: readonly string[] = [
  ROUTES.seller.dashboard,
  ROUTES.seller.validation,
  ROUTES.seller.receivables.list,
  ROUTES.seller.receivables.new,
];

export function isWalletGatedSellerPath(pathname: string): boolean {
  return SELLER_WALLET_GATED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
