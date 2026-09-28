import { useState } from "react";
import { Link } from "react-router-dom";
import { NewDuplicataForm } from "@/components/forms/NewDuplicataForm";
import { FormSkeleton } from "@/components/shared/PageSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAsyncData } from "@/hooks/use-async-data";
import { fetchCurrentSeller } from "@/services/seller.service";
import { canSellerRegisterDuplicatas } from "@/domain/seller/seller-duplicata-access";
import { ROUTES } from "@/lib/routes";

export function NewDuplicataPage() {
  const { data: seller, loading } = useAsyncData(fetchCurrentSeller, []);
  const [isSuccess, setIsSuccess] = useState(false);

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
        <FormSkeleton sections={6} />
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
    <div className="p-6 space-y-6 max-w-6xl mx-auto w-full">
      {!isSuccess && headingForm}
      <NewDuplicataForm sellerId={seller.id} onSuccess={() => setIsSuccess(true)} />
    </div>
  );
}
