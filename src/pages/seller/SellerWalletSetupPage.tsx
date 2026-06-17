import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthBootstrapFallback } from "@/components/auth/AuthBootstrapFallback";
import { SellerWalletSetupPanel } from "@/components/seller/SellerWalletSetupPanel";
import { Button } from "@/components/ui/button";
import {
  getPostLoginSellerDestination,
  SellerRegistrationBlockedError,
} from "@/domain/seller/seller-registration.routing";
import { requiresWalletSetup } from "@/domain/wallet/wallet-gating";
import { useSeller } from "@/contexts/SellerContext";
import { ROUTES } from "@/lib/routes";

export function SellerWalletSetupPage() {
  const navigate = useNavigate();
  const { seller, lifecycleStatus, isLoading, fetchError, refreshSeller } = useSeller();

  useEffect(() => {
    if (!seller && !isLoading && !fetchError) {
      void refreshSeller();
    }
  }, [seller, isLoading, fetchError, refreshSeller]);

  useEffect(() => {
    if (!seller?.walletId) return;
    navigate(ROUTES.seller.dashboard, { replace: true });
  }, [navigate, seller?.walletId]);

  useEffect(() => {
    if (!lifecycleStatus || !seller) return;

    if (lifecycleStatus !== "active") {
      try {
        const destination = getPostLoginSellerDestination(
          lifecycleStatus,
          seller.walletId,
        );
        navigate(destination, { replace: true });
      } catch (error) {
        if (error instanceof SellerRegistrationBlockedError) {
          navigate(ROUTES.login, { replace: true });
        }
      }
      return;
    }

    if (!requiresWalletSetup(lifecycleStatus, seller.walletId)) {
      navigate(ROUTES.seller.dashboard, { replace: true });
    }
  }, [lifecycleStatus, navigate, seller]);

  if (isLoading && !seller) {
    return <AuthBootstrapFallback />;
  }

  if (fetchError && !seller) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-6">
        <h1 className="text-xl font-semibold tracking-tight">Configurar carteira digital</h1>
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={() => void refreshSeller()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="mx-auto w-full max-w-lg p-6">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os dados do vendedor. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col justify-center py-6">
      <SellerWalletSetupPanel seller={seller} />
    </div>
  );
}
