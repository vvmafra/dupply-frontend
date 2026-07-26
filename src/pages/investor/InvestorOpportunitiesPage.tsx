import { useCallback, useEffect, useMemo, useState } from "react";
import { OpportunityOfferCard } from "@/components/investor/OpportunityOfferCard";
import { LIST_FILTER_ALL, ListFilterSelect } from "@/components/shared/ListFilterSelect";
import { RISK_LEVEL_LABELS } from "@/domain/offer/offer.constants";
import type { Offer, RiskLevel } from "@/domain/offer/offer.types";
import { listFundraisingOffers } from "@/services/offer.service";

const RISK_OPTIONS = (Object.entries(RISK_LEVEL_LABELS) as [RiskLevel, string][]).map(
  ([value, label]) => ({ value, label })
);

export function InvestorOpportunitiesPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState(LIST_FILTER_ALL);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFundraisingOffers(
        riskFilter === LIST_FILTER_ALL
          ? undefined
          : { riskLevel: riskFilter as RiskLevel }
      );
      setOffers(data);
    } finally {
      setLoading(false);
    }
  }, [riskFilter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const emptyMessage = useMemo(() => {
    if (riskFilter === LIST_FILTER_ALL) {
      return {
        title: "Nenhuma oferta em captação",
        hint: "Assim que o admin listar novas ofertas, elas aparecerão aqui.",
      };
    }
    return {
      title: `Nenhuma oferta com risco ${RISK_LEVEL_LABELS[riskFilter as RiskLevel].toLowerCase()}`,
      hint: "Tente outro nível de risco ou limpe o filtro.",
    };
  }, [riskFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Oportunidades</h1>
          <p className="text-sm text-muted-foreground">
            Ofertas de investimento em duplicatas aprovadas. Sem identificação de cedente ou sacado.
          </p>
        </div>
        <ListFilterSelect
          id="investor-opportunities-risk"
          label="Risco"
          value={riskFilter}
          onValueChange={setRiskFilter}
          options={RISK_OPTIONS}
          allLabel="Todos os níveis"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando oportunidades...</p>
      ) : offers.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{emptyMessage.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{emptyMessage.hint}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <OpportunityOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
