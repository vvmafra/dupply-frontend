import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthBootstrapFallback } from "@/components/auth/AuthBootstrapFallback";
import { useSeller } from "@/contexts/SellerContext";
import {
  isWalletGatedSellerPath,
  requiresWalletSetup,
} from "@/domain/wallet/wallet-gating";
import { ROUTES } from "@/lib/routes";

type SellerWalletRouteGuardProps = {
  children: ReactNode;
};

export function SellerWalletRouteGuard({ children }: SellerWalletRouteGuardProps) {
  const { lifecycleStatus, seller, isLoading } = useSeller();
  const location = useLocation();

  if (isLoading) {
    return <AuthBootstrapFallback />;
  }

  const walletId = seller?.walletId ?? null;
  if (
    requiresWalletSetup(lifecycleStatus, walletId) &&
    isWalletGatedSellerPath(location.pathname)
  ) {
    return <Navigate to={ROUTES.seller.walletSetup} replace />;
  }

  return children;
}
