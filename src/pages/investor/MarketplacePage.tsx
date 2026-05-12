import { useEffect, useState } from "react";
import { MarketplaceFilters, type MarketplaceFilterValues } from "@/components/investor/MarketplaceFilters";
import { OpportunityCard } from "@/components/investor/OpportunityCard";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { fetchMarketplaceOpportunities } from "@/services/marketplace.service";
import type { Receivable } from "@/domain/receivables/receivable.types";

const DEFAULT_FILTERS: MarketplaceFilterValues = {
  minScore: "",
  maxTerm: "",
  maxAmount: "",
  risk: "ALL",
};

export function MarketplacePage() {
  const [opportunities, setOpportunities] = useState<Receivable[]>([]);
  const [filtered, setFiltered] = useState<Receivable[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilterValues>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketplaceOpportunities().then((data) => {
      setOpportunities(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  function applyFilters(f: MarketplaceFilterValues) {
    setFilters(f);
    let result = [...opportunities];
    if (f.minScore) result = result.filter((r) => r.score >= parseInt(f.minScore));
    if (f.maxTerm) result = result.filter((r) => r.termInDays <= parseInt(f.maxTerm));
    if (f.maxAmount) result = result.filter((r) => r.grossAmount <= parseFloat(f.maxAmount));
    if (f.risk && f.risk !== "ALL") result = result.filter((r) => r.risk === f.risk);
    setFiltered(result);
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setFiltered(opportunities);
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Marketplace</h1>
        <p className="text-sm text-muted-foreground">Explore oportunidades de investimento em recebíveis</p>
      </div>

      <MarketplaceFilters
        filters={filters}
        onChange={(f) => setFilters(f)}
        onReset={resetFilters}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} oportunidade(s) encontrada(s)
        </p>
        <button
          className="text-xs text-primary underline-offset-4 hover:underline"
          onClick={() => applyFilters(filters)}
        >
          Aplicar filtros
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nenhuma oportunidade encontrada</EmptyTitle>
            <EmptyDescription>Tente ajustar os filtros para ver mais resultados.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <OpportunityCard key={r.id} receivable={r} showAvailable detailHref={`/investor/marketplace/${r.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
