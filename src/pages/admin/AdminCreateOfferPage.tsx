import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AdminCreateOfferMockForm } from "@/components/admin/AdminCreateOfferMockForm";
import { AdminOpenFundingForm } from "@/components/admin/AdminOpenFundingForm";
import { Button } from "@/components/ui/button";
import { useAsyncData } from "@/hooks/use-async-data";
import type { Offer } from "@/domain/offer/offer.types";
import { resolveApiMode } from "@/lib/env";
import { ROUTES } from "@/lib/routes";
import { fetchDuplicataById } from "@/services/duplicata.service";

export function AdminCreateOfferPage() {
  const { duplicataId } = useParams<{ duplicataId: string }>();
  const navigate = useNavigate();
  const isHttp = resolveApiMode() === "http";

  const { data: duplicata, loading } = useAsyncData(
    () => fetchDuplicataById(duplicataId!),
    [duplicataId],
    { enabled: Boolean(duplicataId) },
  );

  function handleOpened(offer: Offer) {
    toast.success(isHttp ? "Captação aberta" : "Oferta criada", {
      description: "A oferta já está disponível para investidores.",
    });
    navigate(ROUTES.admin.offers.detail(offer.id));
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando duplicata...</div>;
  }

  if (!duplicata || duplicata.descontoAntecipacaoPercent == null) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm">Duplicata indisponível para criar oferta.</p>
        <Button asChild variant="outline">
          <Link to={ROUTES.admin.offers.ready}>Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{isHttp ? "Abrir captação" : "Criar oferta"}</h1>
        <p className="text-sm text-muted-foreground">
          {duplicata.numeroDuplicata} · {duplicata.sellerName}
        </p>
      </div>

      {isHttp ? (
        <AdminOpenFundingForm duplicata={duplicata} onOpened={handleOpened} />
      ) : (
        <AdminCreateOfferMockForm duplicata={duplicata} onCreated={handleOpened} />
      )}
    </div>
  );
}
