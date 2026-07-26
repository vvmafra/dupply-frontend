import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { InvestQuotaForm } from "@/components/investor/InvestQuotaForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import type { InvestorProfile } from "@/domain/investor/investor.types";
import { OFFER_STATUS_LABELS, RISK_LEVEL_LABELS } from "@/domain/offer/offer.constants";
import {
  calcFundingProgress,
  calcMinProgress,
  calcRemainingQuotas,
} from "@/domain/offer/offer-economics.helpers";
import type { Offer } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatDateTime, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import {
  fetchInvestorProfile,
  isInvestorKycApproved,
} from "@/services/investor.service";
import { closeExpiredOffers, getOfferById } from "@/services/offer.service";

export function InvestorOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await closeExpiredOffers();
      const data = await getOfferById(id);
      setOffer(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetchInvestorProfile(user.id, { email: user.email, name: user.name }).then((data) => {
      setInvestorProfile(data);
      setProfileLoading(false);
    });
  }, [user]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando oferta...</div>;
  }

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

  const progress = calcFundingProgress(offer.raisedAmount, offer.targetAmount);
  const minMarker = calcMinProgress(offer.minAmount, offer.targetAmount);
  const remaining = calcRemainingQuotas(offer.quotaCount, offer.quotasSold);

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Oferta {offer.id.slice(-6)}</h1>
          <p className="text-sm text-muted-foreground">
            Detalhes da oportunidade · sem nomes de cedente ou sacado
          </p>
        </div>
        <Badge variant="secondary">{OFFER_STATUS_LABELS[offer.status]}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nível de risco</span>
            <span>{RISK_LEVEL_LABELS[offer.riskLevel]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Retorno estimado</span>
            <span className="font-medium">{formatPercent(offer.estimatedInvestorReturnPercent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Preço da cota</span>
            <span>{formatCurrencyBRL(offer.quotaPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alvo / mínimo</span>
            <span>
              {formatCurrencyBRL(offer.targetAmount)} / {formatCurrencyBRL(offer.minAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Captado</span>
            <span>
              {formatCurrencyBRL(offer.raisedAmount)} · {remaining} cotas restantes
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="relative">
              <Progress value={progress} />
              <div
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-foreground/50"
                style={{ left: `${minMarker}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Prazo</span>
            <span>{formatDateTime(offer.deadline)}</span>
          </div>
          {offer.status === "disbursed" && offer.fidcBackfillAmount > 0 && (
            <div className="rounded-md bg-muted p-3 space-y-1">
              <p className="font-medium">Captação híbrida</p>
              <p className="text-muted-foreground">
                Investidores: {formatCurrencyBRL(offer.raisedAmount)} · FIDC:{" "}
                {formatCurrencyBRL(offer.fidcBackfillAmount)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Investir</CardTitle>
        </CardHeader>
        <CardContent>
          <InvestSection
            userId={user?.id}
            profileLoading={profileLoading}
            kycApproved={isInvestorKycApproved(investorProfile)}
            offer={offer}
            onInvestSuccess={() => void refresh()}
          />
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link to={ROUTES.investor.opportunities}>Voltar</Link>
      </Button>
    </div>
  );
}

function InvestSection({
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
