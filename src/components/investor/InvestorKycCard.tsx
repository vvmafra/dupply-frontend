import { useState } from "react";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INVESTOR_KYC_STATUS_LABELS } from "@/domain/investor/investor.constants";
import type { InvestorKycStatus } from "@/domain/investor/investor.types";
import { sleep } from "@/lib/utils";

type InvestorKycCardProps = Readonly<{
  kycStatus: InvestorKycStatus;
  onApproved: () => void | Promise<void>;
}>;

export function InvestorKycCard({ kycStatus, onApproved }: InvestorKycCardProps) {
  const [status, setStatus] = useState<InvestorKycStatus>(kycStatus);
  const [busy, setBusy] = useState(false);

  async function handleStart() {
    setBusy(true);
    setStatus("IN_PROGRESS");
    await sleep(1800);
    setStatus("APPROVED");
    await onApproved();
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="size-4" />
          Verificação KYC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Nesta versão, a verificação é simulada para liberar o investimento na demonstração.
        </p>

        {status === "PENDING" && (
          <>
            <Badge variant="outline">{INVESTOR_KYC_STATUS_LABELS.PENDING}</Badge>
            <Button onClick={handleStart} disabled={busy} className="w-full">
              Iniciar verificação
            </Button>
          </>
        )}

        {status === "IN_PROGRESS" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Verificando identidade...
          </div>
        )}

        {status === "APPROVED" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-success" />
              <Badge variant="outline" className="text-success bg-success/20 border-success/40">
                {INVESTOR_KYC_STATUS_LABELS.APPROVED}
              </Badge>
            </div>
            <p className="text-sm text-success">KYC aprovado no ambiente de demonstração.</p>
          </div>
        )}

        {status === "REJECTED" && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <ShieldAlert className="size-4" />
            Verificação não aprovada. Contate o suporte da plataforma.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
