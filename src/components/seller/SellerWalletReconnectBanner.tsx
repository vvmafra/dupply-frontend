import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSeller } from "@/contexts/SellerContext";
import { useWallet } from "@/contexts/WalletContext";
import { fetchSellerWallet } from "@/services/wallet.service";

const RECONNECT_MESSAGE =
  "Não foi possível reconectar sua carteira. Tente novamente ou use sua passkey.";

export function SellerWalletReconnectBanner() {
  const { seller } = useSeller();
  const { connectionStatus, connectExistingWallet, lastConnectError } = useWallet();
  const [dismissed, setDismissed] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const walletId = seller?.walletId ?? null;
  const visible = connectionStatus === "error" && walletId !== null && !dismissed;

  useEffect(() => {
    if (connectionStatus !== "error") {
      setDismissed(false);
    }
  }, [connectionStatus]);

  if (!visible) return null;

  async function handleReconnect() {
    setReconnecting(true);
    try {
      const wallet = await fetchSellerWallet();
      await connectExistingWallet(wallet.credentialId);
    } finally {
      setReconnecting(false);
    }
  }

  return (
    <Alert variant="destructive" className="relative pr-10">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 size-7 text-destructive hover:text-destructive"
        aria-label="Fechar aviso"
        onClick={() => setDismissed(true)}
      >
        <X className="size-4" />
      </Button>
      <AlertTitle>Reconexão da carteira</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{lastConnectError ?? RECONNECT_MESSAGE}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={reconnecting || connectionStatus === "connecting"}
          onClick={() => void handleReconnect()}
        >
          {reconnecting || connectionStatus === "connecting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Reconectando...
            </>
          ) : (
            "Reconectar"
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
