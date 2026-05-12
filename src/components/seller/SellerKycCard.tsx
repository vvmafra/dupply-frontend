import { useState } from "react";
import { Loader as Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sleep } from "@/lib/utils";

interface SellerKycCardProps {
  kycStatus: "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";
  onApproved: () => void;
}

export function SellerKycCard({ kycStatus, onApproved }: SellerKycCardProps) {
  const [status, setStatus] = useState<"PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED">(kycStatus);

  async function handleStart() {
    setStatus("IN_PROGRESS");
    await sleep(1800);
    setStatus("APPROVED");
    onApproved();
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
          Nesta versão, a verificação é simulada para demonstrar o fluxo.
        </p>
        {status === "PENDING" && (
          <Button onClick={handleStart} className="w-full">
            Iniciar verificação
          </Button>
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
                Aprovado
              </Badge>
            </div>
            <p className="text-sm text-success">KYC aprovado no ambiente de demonstração.</p>
          </div>
        )}
        {status === "REJECTED" && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <ShieldAlert className="size-4" />
            Verificação não aprovada.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
