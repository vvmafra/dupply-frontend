import { useEffect, useState } from "react";
import { InvestorKycCard } from "@/components/investor/InvestorKycCard";
import { InvestorProfileCard } from "@/components/investor/InvestorProfileCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { INVESTOR_KYC_STATUS_LABELS } from "@/domain/investor/investor.constants";
import type { InvestorKycStatus, InvestorProfile } from "@/domain/investor/investor.types";
import {
  fetchInvestorProfile,
  updateInvestorKycStatus,
} from "@/services/investor.service";

function kycBadgeClass(status: InvestorKycStatus): string | undefined {
  if (status === "APPROVED") return "text-success bg-success/20 border-success/40";
  if (status === "REJECTED") return "text-destructive bg-destructive/10 border-destructive/40";
  return undefined;
}

export function InvestorAccountPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchInvestorProfile(user.id, { email: user.email, name: user.name }).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  async function handleKycApproved() {
    if (!user) return;
    const updated = await updateInvestorKycStatus(user.id, "APPROVED");
    setProfile(updated);
  }

  const titleBlock = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Meus dados</h1>
        <p className="text-sm text-muted-foreground">
          Cadastro e verificação KYC do investidor nesta demonstração.
        </p>
      </div>
      {profile && (
        <Badge variant="outline" className={kycBadgeClass(profile.kycStatus)}>
          KYC {INVESTOR_KYC_STATUS_LABELS[profile.kycStatus]}
        </Badge>
      )}
    </div>
  );

  if (loading || !user) {
    return (
      <div className="p-6 space-y-6">
        {titleBlock}
        <p className="text-sm text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 space-y-6">
        {titleBlock}
        <p className="text-sm text-muted-foreground">Não foi possível carregar o perfil.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {titleBlock}

      <div className="grid gap-6 lg:grid-cols-2">
        <InvestorProfileCard profile={profile} />
        <InvestorKycCard
          key={profile.kycStatus}
          kycStatus={profile.kycStatus}
          onApproved={handleKycApproved}
        />
      </div>
    </div>
  );
}
