import { FileText, Clock, CircleCheck as CheckCircle2, Coins } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { Receivable } from "@/domain/receivables/receivable.types";

interface SellerDashboardSummaryProps {
  receivables: Receivable[];
}

export function SellerDashboardSummary({ receivables }: SellerDashboardSummaryProps) {
  const total = receivables.reduce((sum, r) => sum + r.grossAmount, 0);
  const underReview = receivables.filter((r) => r.status === "UNDER_REVIEW").length;
  const approved = receivables.filter((r) => r.status === "APPROVED" || r.status === "LISTED").length;
  const funded = receivables.filter((r) => r.status === "FUNDED" || r.status === "SETTLED").length;

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total cadastrado"
        value={formatCurrencyBRL(total)}
        icon={FileText}
        subtitle={`${receivables.length} recebíveis`}
      />
      <MetricCard
        title="Em análise"
        value={underReview}
        icon={Clock}
        accent="text-warning"
      />
      <MetricCard
        title="Aprovados / Listados"
        value={approved}
        icon={CheckCircle2}
        accent="text-success"
      />
      <MetricCard
        title="Financiados"
        value={funded}
        icon={Coins}
        accent="text-primary"
      />
    </div>
  );
}
