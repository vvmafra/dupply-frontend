import { Link, Navigate, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicShell } from "@/components/layout/PublicShell";
import { ROUTES } from "@/lib/routes";

type SellerRegistrationCompleteState = {
  registrationComplete?: boolean;
};

export function SellerRegistrationCompletePage() {
  const location = useLocation();
  const fromRegistration = Boolean(
    (location.state as SellerRegistrationCompleteState | null)?.registrationComplete
  );

  if (!fromRegistration) {
    return <Navigate to={ROUTES.sellerRegistration} replace />;
  }

  return (
    <PublicShell>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 py-12">
        <Card className="w-full max-w-lg border-emerald-500/20 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Cadastro concluído</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Recebemos seus dados e documentos. Seu cadastro foi encaminhado para{" "}
                <span className="font-medium text-foreground">análise de risco</span> e está na fila de
                conferência.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center text-sm leading-relaxed text-muted-foreground">
            <p>
              Em até <span className="font-semibold text-foreground">24 horas</span> enviamos a confirmação do
              cadastro. Após essa etapa você poderá acessar a plataforma e registrar duplicatas.
            </p>
            <p className="text-sm">
              Use o e-mail e a senha informados no cadastro quando receber a liberação para entrar.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild variant="default">
                <Link to={ROUTES.home}>Voltar ao início</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={ROUTES.login}>Ir para o login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </PublicShell>
  );
}
