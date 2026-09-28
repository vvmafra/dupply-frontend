import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, DollarSign, TriangleAlert as AlertTriangle } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminBlockchainEventTimeline } from "@/components/admin/AdminBlockchainEventTimeline";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { ChartCardSkeleton, MetricCardsSkeleton, TimelineSkeleton } from "@/components/shared/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsyncData } from "@/hooks/use-async-data";
import { formatCurrencyBRL } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import { fetchPlatformMetrics } from "@/services/admin.service";
import { fetchTransactions } from "@/services/blockchain.service";

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-9 w-56 rounded-md" />
      <MetricCardsSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCardSkeleton />
        <div className="grid gap-6">
          <ChartCardSkeleton height="h-40" />
          <ChartCardSkeleton height="h-40" />
        </div>
      </div>
      <TimelineSkeleton />
    </>
  );
}

export function AdminDashboardPage() {
  const { data, loading } = useAsyncData(async () => {
    const [metrics, transactions] = await Promise.all([fetchPlatformMetrics(), fetchTransactions()]);
    return { metrics, transactions };
  }, []);

  let body: ReactNode;
  if (loading) {
    body = <DashboardSkeleton />;
  } else if (data?.metrics) {
    const { metrics, transactions } = data;
    body = (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.admin.sellers.list}>Cedentes e revisão de risco</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            title="Cedentes ativos"
            value={metrics.totalCompanies}
            icon={Users}
            subtitle={`${metrics.sellersInValidation} em validação`}
          />
          <AdminMetricCard
            title="Recebíveis"
            value={metrics.receivablesRegistered}
            icon={FileText}
            subtitle={`${metrics.receivablesApproved} aprovados`}
          />
          <AdminMetricCard
            title="Volume total"
            value={formatCurrencyBRL(metrics.totalVolume)}
            icon={DollarSign}
            subtitle={`${formatCurrencyBRL(metrics.fundedVolume)} financiado`}
          />
          <AdminMetricCard
            title="Inadimplência"
            value={metrics.receivablesDefaulted}
            icon={AlertTriangle}
            subtitle="recebíveis em atraso"
            trend="down"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <VolumeChart />
          <div className="grid gap-6">
            <StatusDistributionChart />
            <RiskDistributionChart />
          </div>
        </div>

        <AdminBlockchainEventTimeline transactions={transactions} />
      </>
    );
  } else {
    body = <p className="text-sm text-muted-foreground">Não foi possível carregar as métricas.</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Painel administrativo</h1>
        <p className="text-sm text-muted-foreground">Métricas gerais da plataforma</p>
      </div>
      {body}
    </div>
  );
}
