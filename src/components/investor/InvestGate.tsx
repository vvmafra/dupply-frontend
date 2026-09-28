import { Link } from "react-router-dom";
import { InvestQuotaForm } from "@/components/investor/InvestQuotaForm";
import { Button } from "@/components/ui/button";
import type { Offer } from "@/domain/offer/offer.types";
import { ROUTES } from "@/lib/routes";

/** Decides whether the investor can see the quota form: login → KYC → invest. */
export function InvestGate({
  userId,
  profileLoading,
  kycApproved,
  offer,
  onInvestSuccess,
}: Readonly<{
  userId?: string;
  profileLoading: boolean;
  kycApproved: boolean;
  offer: Offer;
  onInvestSuccess: () => void;
}>) {
  if (!userId) {
    return <p className="text-sm text-muted-foreground">Faça login para investir.</p>;
  }
  if (profileLoading) {
    return <p className="text-sm text-muted-foreground">Verificando KYC...</p>;
  }
  if (!kycApproved) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Complete a verificação KYC em Meus dados para liberar o investimento nesta demonstração.
        </p>
        <Button asChild className="w-full">
          <Link to={ROUTES.investor.account}>Ir para Meus dados</Link>
        </Button>
      </div>
    );
  }
  return <InvestQuotaForm offer={offer} investorUserId={userId} onSuccess={onInvestSuccess} />;
}
