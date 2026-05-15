import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminDashboardBodySkeleton } from "@/components/admin/AdminPagesSkeleton";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { StatusDistributionChart } from "@/components/dashboard/StatusDistributionChart";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { AdminBlockchainEventTimeline } from "@/components/admin/AdminBlockchainEventTimeline";
import { fetchPlatformMetrics } from "@/services/admin.service";
import { fetchTransactions } from "@/services/blockchain.service";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";
import { Users, FileText, DollarSign, TriangleAlert as AlertTriangle } from "lucide-react";
import type { PlatformMetrics } from "@/domain/admin/admin.types";
import type { BlockchainTransaction } from "@/domain/blockchain/blockchain.types";

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [m, tx] = await Promise.all([fetchPlatformMetrics(), fetchTransactions()]);
      if (!cancelled) {
        setMetrics(m);
        setTransactions(tx);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  let body: ReactNode;
  if (loading) {
    body = <AdminDashboardBodySkeleton />;
  } else if (metrics) {
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
