import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Briefcase, CircleDollarSign, TrendingUp, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAsyncData } from "@/hooks/use-async-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { fetchInvestorProfile } from "@/services/investor.service";
import { listInvestmentsByInvestor } from "@/services/offer.service";
import type { InvestorProfile } from "@/domain/investor/investor.types";
import type { Investment } from "@/domain/offer/offer.types";

function getReceivableStatusBadge(status?: string) {
  switch (status) {
    case "funding":
    case "fundraising":
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0 h-5 font-semibold">
          Captando
        </Badge>
      );
    case "funded":
    case "processing":
    case "disbursed":
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0 h-5 font-semibold">
          Em Andamento
        </Badge>
      );
    case "completed":
    case "payer_settled":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0 h-5 font-semibold">
          Liquidada
        </Badge>
      );
    case "refunded":
      return (
        <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] px-2 py-0 h-5 font-semibold">
          Reembolsada
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">
          Ativo
        </Badge>
      );
  }
}

export function InvestorHomePage() {
  const { user } = useAuth();
  const { data, loading } = useAsyncData<{ profile: InvestorProfile; investments: Investment[] }>(
    async () => {
      const [profile, investments] = await Promise.all([
        fetchInvestorProfile(user!.id, { email: user!.email, name: user!.name }),
        listInvestmentsByInvestor(user!.id),
      ]);
      return { profile, investments };
    },
    [user],
    { enabled: Boolean(user) },
  );
  const profile = data?.profile ?? null;
  const investments = data?.investments ?? [];

  const stats = useMemo(() => {
    const saldoLivre = profile?.balance ?? 0;
    // Filter active and settled investments
    const activeInvs = investments.filter((i) => i.status === "active" || i.status === "settled");
    const saldoInvestido = activeInvs.reduce((sum, item) => sum + item.amount, 0);
    const saldoTotal = saldoLivre + saldoInvestido;

    const percentLivre = saldoTotal > 0 ? (saldoLivre / saldoTotal) * 100 : 100;
    const percentInvestido = saldoTotal > 0 ? (saldoInvestido / saldoTotal) * 100 : 0;

    return {
      saldoLivre,
      saldoInvestido,
      saldoTotal,
      percentLivre,
      percentInvestido,
      activeCount: activeInvs.length,
    };
  }, [profile, investments]);

  if (loading || !user) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Painel do Investidor</h1>
          <p className="text-sm text-muted-foreground">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header section with greeting */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Olá, {profile?.fullName ?? user.name}</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o rendimento da sua carteira e novas oportunidades de investimento.
          </p>
        </div>
        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Link to={ROUTES.investor.opportunities}>
            Explorar Oportunidades <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Balances Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Available Balance */}
        <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-950/10">
          <div className="absolute right-3 top-3 text-emerald-500/20">
            <Wallet className="size-16 shrink-0" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-400 font-medium">Saldo Disponível</CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-emerald-300">
              {formatCurrencyBRL(stats.saldoLivre)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Disponível para novos aportes em duplicatas.
            </p>
          </CardContent>
        </Card>

        {/* Invested Balance */}
        <Card className="relative overflow-hidden border-blue-500/20 bg-blue-950/10">
          <div className="absolute right-3 top-3 text-blue-500/20">
            <Briefcase className="size-16 shrink-0" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-400 font-medium">Total Investido</CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-blue-300">
              {formatCurrencyBRL(stats.saldoInvestido)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Alocado em {stats.activeCount} captação(ões) ativa(s).
            </p>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card className="relative overflow-hidden border-amber-500/20 bg-amber-950/10">
          <div className="absolute right-3 top-3 text-amber-500/20">
            <CircleDollarSign className="size-16 shrink-0" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-400 font-medium">Patrimônio Total</CardDescription>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-amber-300">
              {formatCurrencyBRL(stats.saldoTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Soma do saldo livre e recursos investidos.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Alocação de Recursos</CardTitle>
          <CardDescription>Visualização da distribuição do seu capital.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Progress value={stats.percentInvestido} className="h-3" />
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-muted-foreground">Saldo Disponível: </span>
              <span className="font-semibold text-white">{stats.percentLivre.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-primary inline-block" />
              <span className="text-muted-foreground">Investido: </span>
              <span className="font-semibold text-white">{stats.percentInvestido.toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Info and Recent Investments */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Oportunidades em Destaque
            </CardTitle>
            <CardDescription>Recebíveis com alta rentabilidade abertos para captação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Acesse o marketplace para visualizar ofertas de duplicatas com taxas competitivas pré-analisadas pela plataforma.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to={ROUTES.investor.opportunities}>Ir para o Marketplace</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Meus Investimentos & Status</CardTitle>
            <CardDescription>Acompanhe o andamento das duplicatas adquiridas.</CardDescription>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum investimento realizado ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {investments.slice(0, 5).map((item) => {
                  const rec = item.receivable;
                  const progress = rec ? (rec.funded / rec.targetFunding) * 100 : 0;
                  return (
                    <Link
                      key={item.id}
                      to={ROUTES.investor.offerDetail(item.offerId)}
                      className="block p-3 rounded-lg border border-border/40 bg-zinc-950/20 hover:border-primary/50 hover:bg-primary/5 transition-all space-y-2.5 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white flex items-center gap-2">
                            Oferta {item.offerId.slice(-6)}
                            {getReceivableStatusBadge(rec?.status)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Aportado em {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="text-sm font-bold text-white">
                            {formatCurrencyBRL(item.amount)}
                          </p>
                          {rec && (
                            <p className="text-[10px] text-emerald-400 font-medium">
                              {(rec.yieldRateAnnual * 100).toFixed(1)}% a.a.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progresso de captação */}
                      {rec?.status === "fundraising" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>Progresso da captação</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
