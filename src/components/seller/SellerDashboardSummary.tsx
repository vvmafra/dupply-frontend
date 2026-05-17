import { FileText, Clock, CircleCheck as CheckCircle2, Ban } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

interface SellerDashboardSummaryProps {
  duplicatas: DuplicataTitulo[];
}

export function SellerDashboardSummary({ duplicatas }: SellerDashboardSummaryProps) {
  const total = duplicatas.reduce((sum, d) => sum + d.valor, 0);
  const pending = duplicatas.filter(
    (d) => d.analiseAnalista === "pendente" || d.analiseAnalista === "for_approval"
  ).length;
  const approved = duplicatas.filter((d) => d.analiseAnalista === "aprovado").length;
  const rejected = duplicatas.filter((d) => d.analiseAnalista === "reprovado").length;

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total em face"
        value={formatCurrencyBRL(total)}
        icon={FileText}
        subtitle={`${duplicatas.length} duplicatas`}
      />
      <MetricCard
        title="Em análise"
        value={pending}
        icon={Clock}
        accent="text-warning"
      />
      <MetricCard
        title="Aprovadas"
        value={approved}
        icon={CheckCircle2}
        accent="text-success"
      />
      <MetricCard
        title="Reprovadas"
        value={rejected}
        icon={Ban}
        accent="text-destructive"
      />
    </div>
  );
}
