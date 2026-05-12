import { useEffect, useState } from "react";
import { InvestorPositionsTable } from "@/components/investor/InvestorPositionsTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { fetchInvestorPositions } from "@/services/investment.service";
import { formatCurrencyBRL, formatPercent } from "@/lib/formatters";
import { Wallet, TrendingUp, ChartBar as BarChart3 } from "lucide-react";
import type { Investment } from "@/domain/investor/investment.types";

export function InvestorPositionsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestorPositions().then((data) => {
      setInvestments(data);
      setLoading(false);
    });
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
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Minhas posições</h1>
        <p className="text-sm text-muted-foreground">Acompanhe todos os seus investimentos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Total investido" value={formatCurrencyBRL(totalInvested)} icon={Wallet} />
        <MetricCard title="Retorno estimado" value={formatCurrencyBRL(totalReturn)} icon={TrendingUp} />
        <MetricCard title="Taxa média" value={formatPercent(avgRate)} icon={BarChart3} subtitle="a.a." />
      </div>

      <InvestorPositionsTable investments={investments} />
    </div>
  );
}
