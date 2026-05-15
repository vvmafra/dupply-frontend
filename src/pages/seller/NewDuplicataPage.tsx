import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NewDuplicataForm } from "@/components/forms/NewDuplicataForm";
import { NewDuplicataFormSkeleton } from "@/components/seller/SellerPageCardsSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { fetchCurrentSeller } from "@/services/seller.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";
import { ROUTES } from "@/lib/routes";
import type { SellerCompany } from "@/domain/seller/seller.types";

export function NewDuplicataPage() {
  const [seller, setSeller] = useState<SellerCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSeller()
      .then((s) => {
        setSeller(s);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const headingForm = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Nova duplicata</h1>
      <p className="text-sm text-muted-foreground">Preencha os dados e envie para análise</p>
    </div>
  );

  const headingMeta = (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Nova duplicata</h1>
      <p className="text-sm text-muted-foreground">Cadastro de títulos para análise</p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {headingForm}
        <NewDuplicataFormSkeleton />
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

  if (!canSellerRegisterDuplicatas(seller)) {
    return (
      <div className="p-6 space-y-6 max-w-lg">
        {headingMeta}
        <Alert variant="destructive">
          <AlertTitle>Cadastro de duplicatas bloqueado</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Para enviar duplicatas, é preciso ter KYC aprovado, cadastro aprovado na plataforma e liberação
              explícita do analista de risco.
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
      <NewDuplicataForm sellerId={seller.id} />
    </div>
  );
}
