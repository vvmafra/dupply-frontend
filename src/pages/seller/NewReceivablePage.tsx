import { useEffect } from "react";
import { Link } from "react-router-dom";
import { NewReceivableForm } from "@/components/forms/NewReceivableForm";
import { NewReceivableFormSkeleton } from "@/components/seller/SellerPageCardsSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { canSellerRegisterReceivables } from "@/domain/seller/seller-receivable-access";
import { useSeller } from "@/contexts/SellerContext";
import { ROUTES } from "@/lib/routes";

export function NewReceivablePage() {
  const { seller, isLoading, fetchError, refreshSeller } = useSeller();

  useEffect(() => {
    if (!seller && !isLoading && !fetchError) void refreshSeller();
  }, [seller, isLoading, fetchError, refreshSeller]);

  const headingForm = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Nova recebível</h1>
      <p className="text-sm text-muted-foreground">Preencha os dados e envie para análise</p>
    </div>
  );

  const headingMeta = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Nova recebível</h1>
      <p className="text-sm text-muted-foreground">Cadastro de títulos para análise</p>
    </div>
  );

  if (isLoading && !seller) {
    return (
      <div className="p-6 space-y-6">
        {headingForm}
        <NewReceivableFormSkeleton />
      </div>
    );
  }

  if (fetchError && !seller) {
    return (
      <div className="p-6 space-y-6 max-w-lg">
        {headingMeta}
        <p className="text-sm text-muted-foreground">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={() => void refreshSeller()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="p-6 space-y-6 max-w-lg">
        {headingMeta}
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os dados do vendedor. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  if (!canSellerRegisterReceivables(seller)) {
    return (
      <div className="p-6 space-y-6 max-w-lg">
        {headingMeta}
        <Alert variant="destructive">
          <AlertTitle>Cadastro de recebíveis bloqueado</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Para enviar recebíveis, é preciso ter KYC aprovado e cadastro ativo na plataforma.
            </p>
            <Button variant="outline" size="sm" asChild className="border-destructive/40">
              <Link to={ROUTES.seller.validation}>Ver progresso em Validação</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {headingForm}
      <NewReceivableForm />
    </div>
  );
}
