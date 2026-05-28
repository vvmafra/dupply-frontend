import { FileText, Clock, CircleCheck as CheckCircle2, Ban } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import type { ReceivableListItem } from "@/domain/receivable/receivable.types";
import { formatCurrencyBRL } from "@/lib/formatters";

interface SellerDashboardSummaryProps {
  readonly receivables: ReceivableListItem[];
}

export function SellerDashboardSummary({ receivables }: SellerDashboardSummaryProps) {
  const total = receivables.reduce((sum, item) => sum + item.faceValue, 0);
  const pending = receivables.filter(
    (item) => item.status === "under_review" || item.status === "offer",
  ).length;
  const approved = receivables.filter((item) =>
    ["approved", "processing", "completed", "confirmed", "payer_settled"].includes(item.status),
  ).length;
  const rejected = receivables.filter((item) =>
    ["reproved", "rejected", "payer_rejected"].includes(item.status),
  ).length;

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total em face"
        value={formatCurrencyBRL(total)}
        icon={FileText}
        subtitle={`${receivables.length} recebíveis`}
      />
      <MetricCard title="Em análise" value={pending} icon={Clock} accent="text-warning" />
      <MetricCard title="Aprovadas" value={approved} icon={CheckCircle2} accent="text-success" />
      <MetricCard title="Reprovadas" value={rejected} icon={Ban} accent="text-destructive" />
    </div>
  );
}
