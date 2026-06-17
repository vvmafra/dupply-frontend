import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Shield, Wallet } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SellerCompany } from "@/domain/seller/seller.types";
import { WalletRegistrationError } from "@/domain/wallet/wallet.errors";
import { useSeller } from "@/contexts/SellerContext";
import { useWallet } from "@/contexts/WalletContext";
import { smartAccountEnv } from "@/lib/smart-account.config";
import { ROUTES } from "@/lib/routes";

const PARTIAL_FAILURE_MESSAGE =
  "Carteira criada na rede, mas não vinculada. Tente novamente.";

type SetupPhase = "idle" | "processing" | "partial_failure" | "error";

function isPartialRegistrationFailure(error: unknown): boolean {
  return (
    error instanceof WalletRegistrationError &&
    (error.code === "server_error" || error.code === "network")
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof WalletRegistrationError) return error.message;
  if (error instanceof Error) return error.message;
  return "Não foi possível criar sua carteira. Tente novamente.";
}

type SellerWalletSetupPanelProps = {
  seller: SellerCompany;
};

export function SellerWalletSetupPanel({ seller }: SellerWalletSetupPanelProps) {
  const navigate = useNavigate();
  const { refreshSeller } = useSeller();
  const { createAndRegisterWallet, retryBackendRegistration } = useWallet();
  const [phase, setPhase] = useState<SetupPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectIfWalletReady = useCallback(async (): Promise<boolean> => {
    const refreshed = await refreshSeller();
    if (refreshed?.walletId) {
      navigate(ROUTES.seller.dashboard, { replace: true });
      return true;
    }
    return false;
  }, [navigate, refreshSeller]);

  const handleCreate = useCallback(async (): Promise<void> => {
    setPhase("processing");
    setErrorMessage(null);

    try {
      await createAndRegisterWallet(smartAccountEnv.rpName, seller.email);
      await redirectIfWalletReady();
    } catch (error) {
      if (isPartialRegistrationFailure(error)) {
        setPhase("partial_failure");
        setErrorMessage(PARTIAL_FAILURE_MESSAGE);
        return;
      }
      setPhase("error");
      setErrorMessage(getErrorMessage(error));
    }
  }, [createAndRegisterWallet, redirectIfWalletReady, seller.email]);

  const handleRetryRegistration = useCallback(async (): Promise<void> => {
    setPhase("processing");
    setErrorMessage(null);

    try {
      await retryBackendRegistration();
      await redirectIfWalletReady();
    } catch (error) {
      if (isPartialRegistrationFailure(error)) {
        setPhase("partial_failure");
        setErrorMessage(PARTIAL_FAILURE_MESSAGE);
        return;
      }
      setPhase("error");
      setErrorMessage(getErrorMessage(error));
    }
  }, [redirectIfWalletReady, retryBackendRegistration]);

  const isBusy = phase === "processing";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="size-8 text-primary" aria-hidden />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Configurar carteira digital</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Antes de usar a plataforma, você precisa criar uma carteira segura na rede Stellar
              (testnet) para receber operações on-chain.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-1 rounded-lg border bg-muted/30 p-4">
            <h2 className="font-medium text-foreground">Carteira digital</h2>
            <p>
              Uma carteira digital Stellar (testnet) será criada para receber operações on-chain
              vinculadas ao seu cadastro.
            </p>
          </section>

          <section className="space-y-1 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Shield className="size-4 shrink-0" aria-hidden />
              <h2>Passkey (biometria ou PIN)</h2>
            </div>
            <p>
              O acesso é protegido por passkey do seu dispositivo (biometria ou PIN).{" "}
              <span className="font-medium text-foreground">Você é responsável</span> por manter
              essa passkey — a perda pode impedir o acesso à carteira.
            </p>
          </section>

          <section className="space-y-1 rounded-lg border bg-muted/30 p-4">
            <h2 className="font-medium text-foreground">Saldo em testnet</h2>
            <p>
              No testnet, o saldo em XLM é creditado automaticamente via{" "}
              <span className="font-medium text-foreground">Friendbot</span> após a criação da
              carteira.
            </p>
          </section>

          <p className="text-xs text-muted-foreground">
            Suporte à rede principal (mainnet) e financiamento em produção serão disponibilizados em
            versão futura.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          {phase === "partial_failure" ? (
            <Alert variant="destructive">
              <AlertTitle>Vinculação pendente</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{errorMessage ?? PARTIAL_FAILURE_MESSAGE}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-destructive/40"
                  disabled={isBusy}
                  onClick={() => void handleRetryRegistration()}
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {phase === "error" ? (
            <Alert variant="destructive">
              <AlertTitle>Não foi possível concluir</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{errorMessage}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-destructive/40"
                  disabled={isBusy}
                  onClick={() => void handleCreate()}
                >
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {isBusy ? (
            <div
              className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
              <p className="font-medium text-foreground">Criando sua carteira…</p>
              <p>
                Siga as instruções do navegador para registrar sua passkey. Em seguida, vinculamos
                a carteira à sua conta.
              </p>
            </div>
          ) : phase === "idle" ? (
            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={() => void handleCreate()}
            >
              Criar minha carteira
            </Button>
          ) : null}
        </CardFooter>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        É necessário um navegador com suporte a passkey (WebAuthn), em conexão segura (HTTPS ou
        localhost).
      </p>
    </div>
  );
}
