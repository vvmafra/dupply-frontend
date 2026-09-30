import { Link, useParams } from "react-router-dom";
import { InvestGate } from "@/components/investor/InvestGate";
import { OfferAuditedTitleCard } from "@/components/investor/OfferAuditedTitleCard";
import { OfferRiskAgentCard } from "@/components/investor/OfferRiskAgentCard";
import { OfferSummaryCard } from "@/components/investor/OfferSummaryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncData } from "@/hooks/use-async-data";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { OFFER_STATUS_LABELS } from "@/domain/offer/offer.constants";
import type { Offer } from "@/domain/offer/offer.types";
import { ROUTES } from "@/lib/routes";
import { fetchDuplicataById } from "@/services/duplicata.service";
import { fetchInvestorProfile, isInvestorKycApproved } from "@/services/investor.service";
import { closeExpiredOffers, getOfferById } from "@/services/offer.service";

export function InvestorOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data, loading, reload } = useAsyncData<{
    offer: Offer | null;
    duplicata: DuplicataTitulo | null;
  }>(
    async () => {
      await closeExpiredOffers();
      const offer = await getOfferById(id!);
      const duplicata = offer ? await fetchDuplicataById(offer.duplicataId) : null;
      return { offer, duplicata };
    },
    [id],
    { enabled: Boolean(id) },
  );

  const { data: investorProfile, loading: profileLoading } = useAsyncData(
    () => fetchInvestorProfile(user!.id, { email: user!.email, name: user!.name }),
    [user],
    { enabled: Boolean(user) },
  );

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando oferta...</div>;
  }

  const offer = data?.offer ?? null;
  if (!offer) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm">Oferta não encontrada.</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.investor.opportunities}>Voltar às oportunidades</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to={ROUTES.investor.opportunities}>← Voltar</Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Oferta {offer.id.slice(-6)}</h1>
          <p className="text-sm text-muted-foreground">
            Oportunidade auditada por inteligência artificial para proteção e rentabilidade.
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
          {OFFER_STATUS_LABELS[offer.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <OfferSummaryCard offer={offer} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Investir</CardTitle>
            </CardHeader>
            <CardContent>
              <InvestGate
                userId={user?.id}
                profileLoading={profileLoading}
                kycApproved={isInvestorKycApproved(investorProfile)}
                offer={offer}
                onInvestSuccess={() => void reload()}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <OfferRiskAgentCard offer={offer} />
          <OfferAuditedTitleCard duplicata={data?.duplicata ?? null} />
        </div>
      </div>
    </div>
  );
}
