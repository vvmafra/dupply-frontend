import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Bot, ShieldCheck, FileText, Building2 } from "lucide-react";
import { InvestQuotaForm } from "@/components/investor/InvestQuotaForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import type { InvestorProfile } from "@/domain/investor/investor.types";
import { OFFER_STATUS_LABELS, RISK_LEVEL_LABELS } from "@/domain/offer/offer.constants";
import {
  calcFundingProgress,
  calcMinProgress,
  calcRemainingQuotas,
} from "@/domain/offer/offer-economics.helpers";
import type { Offer, RiskLevel } from "@/domain/offer/offer.types";
import { formatCurrencyBRL, formatDateTime, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import {
  fetchInvestorProfile,
  isInvestorKycApproved,
} from "@/services/investor.service";
import { closeExpiredOffers, getOfferById } from "@/services/offer.service";
import { fetchDuplicataById } from "@/services/duplicata.service";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { cn } from "@/lib/utils";

const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: "text-emerald-400 border-emerald-400/40",
  medium: "text-amber-400 border-amber-400/40",
  high: "text-red-500 border-red-500/40",
};

function formatMaskedKey(key?: string) {
  if (!key) return "—";
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}••••••••••••••••${key.slice(-4)}`;
}

function getSectorByName(name?: string, defaultSector = "Serviços Gerais"): string {
  if (!name) return defaultSector;
  const upper = name.toUpperCase();
  if (upper.includes("DIGITAL") || upper.includes("SOFTWARE") || upper.includes("TECNOLOGIA") || upper.includes("TECH")) {
    return "Tecnologia e Serviços";
  }
  if (upper.includes("ALIMENT") || upper.includes("SUPERMERCADO") || upper.includes("VAREJO") || upper.includes("DISTRIB")) {
    return "Varejo e Consumo";
  }
  if (upper.includes("TRANSPORT") || upper.includes("LOGISTICA") || upper.includes("CARGO")) {
    return "Transporte e Logística";
  }
  return defaultSector;
}

function getUFFromKey(key?: string): { origin: string; dest: string } {
  if (!key || key.length < 2) return { origin: "SP", dest: "SP" };
  const code = key.slice(0, 2);
  let state = "SP";
  if (code === "33") state = "RJ";
  else if (code === "31") state = "MG";
  else if (code === "41") state = "PR";
  else if (code === "43") state = "RS";
  else if (code === "29") state = "BA";
  
  return { origin: "SP", dest: state };
}

export function InvestorOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [duplicata, setDuplicata] = useState<DuplicataTitulo | null>(null);
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
      if (data) {
        const dupData = await fetchDuplicataById(data.duplicataId);
        setDuplicata(dupData);
      }
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

  const score = offer.scoreDuplicataSnapshot ?? 75;
  const rating = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B+" : "B";

  return (
    <div className="mx-auto p-6 space-y-6 max-w-6xl">
      {/* Voltar button top */}
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
        {/* Left Side: Summary and Invest Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Resumo da Oferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nível de risco</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn(
                        "font-semibold cursor-help border-b border-dashed",
                        RISK_LEVEL_COLORS[offer.riskLevel]
                      )}>
                        {RISK_LEVEL_LABELS[offer.riskLevel]}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="w-64 text-center">
                      Meramente ilustrativo, trata-se de uma análise da Dupply.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retorno estimado</span>
                <span className="font-medium text-emerald-400">{formatPercent(offer.estimatedInvestorReturnPercent)} a.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço da cota</span>
                <span className="text-white">{formatCurrencyBRL(offer.quotaPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alvo / mínimo</span>
                <span className="text-white">
                  {formatCurrencyBRL(offer.targetAmount)} / {formatCurrencyBRL(offer.minAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Captado</span>
                <span className="text-white">
                  {formatCurrencyBRL(offer.raisedAmount)} · {remaining} cotas restantes
                </span>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="relative">
                  <Progress value={progress} className="h-2" />
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/50"
                    style={{ left: `${minMarker}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo final</span>
                <span className="text-white">{formatDateTime(offer.deadline)}</span>
              </div>
              {offer.status === "disbursed" && offer.fidcBackfillAmount > 0 && (
                <div className="rounded-md bg-muted/40 p-3 space-y-1 border border-border/60">
                  <p className="font-medium text-white">Captação híbrida realizada</p>
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
              <CardTitle className="text-base font-semibold">Investir</CardTitle>
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
        </div>

        {/* Right Side: AI Agent Audit & Title Info */}
        <div className="space-y-6">
          {/* AI Risk Agent Analysis */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                <Bot className="size-5 text-primary shrink-0 animate-pulse" />
                Análise do Agente de Risco
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Score Indicator */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Score do Recebível</p>
                  <p className="text-2xl font-black text-white">{score} <span className="text-xs text-muted-foreground">/ 100</span></p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-base">
                  {rating}
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <p className="font-semibold text-white/90">Validações Executadas:</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>XML da NF-e registrado na SEFAZ</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>Comprovante de entrega validado (OCR)</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>Aceite digital do sacado verificado</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>Histórico de pontualidade do sacado</span>
                  </div>
                </div>
              </div>

              {/* AI comment */}
              <div className="p-2 rounded bg-zinc-900/30 text-[10px] text-muted-foreground/60 leading-normal italic border border-border/20 text-center">
                Classificação: Nível de Risco {RISK_LEVEL_LABELS[offer.riskLevel]}. Meramente ilustrativo, trata-se de uma análise da Dupply.
              </div>
            </CardContent>
          </Card>

          {/* Masked Invoice Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                <FileText className="size-5 text-primary shrink-0" />
                Dados do Título Auditado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Tipo de Título</span>
                <span className="text-white font-medium">
                  {duplicata
                    ? duplicata.tipo === "servico"
                      ? "Duplicata de Serviço (DS)"
                      : "Duplicata Mercantil (DM)"
                    : "Duplicata Mercantil (DM)"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">
                  {duplicata?.tipo === "servico" ? "NFSe Chave" : "NF-e Chave"}
                </span>
                <span className="text-white font-mono">
                  {formatMaskedKey(duplicata?.documentoFiscalChave)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Setor Cedente</span>
                <div className="flex items-center gap-1 text-white">
                  <Building2 className="size-3 text-muted-foreground" />
                  <span>{getSectorByName(duplicata?.sellerName, "Logística e Distribuição")}</span>
                </div>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Setor Sacado</span>
                <div className="flex items-center gap-1 text-white">
                  <Building2 className="size-3 text-muted-foreground" />
                  <span>{getSectorByName(duplicata?.sacadoRazaoSocial, "Varejo Alimentício")}</span>
                </div>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">UF de Origem/Destino</span>
                <span className="text-white font-medium">
                  {duplicata
                    ? `${duplicata.tipo === "servico" ? "São Paulo/SP" : "Campinas/SP"} → ${
                        getUFFromKey(duplicata.documentoFiscalChave).dest === "RJ"
                          ? "Rio de Janeiro/RJ"
                          : getUFFromKey(duplicata.documentoFiscalChave).dest === "MG"
                          ? "Belo Horizonte/MG"
                          : "São Paulo/SP"
                      }`
                    : "Campinas/SP → São Paulo/SP"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
