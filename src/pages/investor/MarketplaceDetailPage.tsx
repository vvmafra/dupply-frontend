import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceivableSummary } from "@/components/receivables/ReceivableSummary";
import { InvestmentSimulationModal } from "@/components/investor/InvestmentSimulationModal";
import { fetchOpportunityById } from "@/services/marketplace.service";
import { ROUTES } from "@/lib/routes";
import type { Receivable } from "@/domain/receivables/receivable.types";

export function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [receivable, setReceivable] = useState<Receivable | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchOpportunityById(id).then((data) => {
      setReceivable(data ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!receivable) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Oportunidade não encontrada.</p>
        <Button variant="outline" size="sm" asChild>
          <Link to={ROUTES.investor.marketplace.list}>
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to={ROUTES.investor.marketplace.list}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{receivable.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">{receivable.debtorName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReceivableSummary receivable={receivable} />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm">Simular investimento</h3>
            <p className="text-xs text-muted-foreground">
              Calcule o retorno estimado para esta operação antes de confirmar.
            </p>
            <Button className="w-full" onClick={() => setModalOpen(true)}>
              Simular investimento
            </Button>
          </div>
        </div>
      </div>

      <InvestmentSimulationModal
        receivable={receivable}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
