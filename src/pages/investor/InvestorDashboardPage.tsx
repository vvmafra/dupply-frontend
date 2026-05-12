import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InvestorPositionsTable } from "@/components/investor/InvestorPositionsTable";
import { fetchInvestorPositions } from "@/services/investment.service";
import { fetchMarketplaceOpportunities } from "@/services/marketplace.service";
import { formatCurrencyBRL, formatPercent } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { TrendingUp, Wallet, ChartBar as BarChart3, ShoppingBag } from "lucide-react";
import type { Investment } from "@/domain/investor/investment.types";

export function InvestorDashboardPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [opportunityCount, setOpportunityCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [inv, opps] = await Promise.all([
        fetchInvestorPositions(),
        fetchMarketplaceOpportunities(),
      ]);
      setInvestments(inv);
      setOpportunityCount(opps.length);
      setLoading(false);
    }
    load();
  }, []);

  const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
  const totalReturn = investments.reduce((s, i) => s + i.estimatedReturn, 0);
  const avgRate = investments.length > 0
    ? investments.reduce((s, i) => s + i.rate, 0) / investments.length
    : 0;

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard do investidor</h1>
          <p className="text-sm text-muted-foreground">Acompanhe suas posições e oportunidades</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.investor.marketplace.list}>
            <ShoppingBag className="size-4" />
            Ver marketplace
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total investido"
          value={formatCurrencyBRL(totalInvested)}
          icon={Wallet}
          subtitle={`${investments.length} operação(ões)`}
        />
        <MetricCard
          title="Retorno estimado"
          value={formatCurrencyBRL(totalReturn)}
          icon={TrendingUp}
          subtitle="Sobre investimentos ativos"
        />
        <MetricCard
          title="Taxa média"
          value={formatPercent(avgRate)}
          icon={BarChart3}
          subtitle="a.a."
        />
        <MetricCard
          title="Oportunidades"
          value={opportunityCount}
          icon={ShoppingBag}
          subtitle="Disponíveis no marketplace"
        />
      </div>

      <InvestorPositionsTable investments={investments} />
    </div>
  );
}
