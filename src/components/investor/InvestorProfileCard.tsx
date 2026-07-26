import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INVESTOR_PERSON_TYPE_LABELS,
  INVESTOR_SUITABILITY_LABELS,
} from "@/domain/investor/investor.constants";
import type { InvestorProfile } from "@/domain/investor/investor.types";
import { formatDateTime } from "@/lib/formatters";
import { maskDocument, maskPhone } from "@/lib/mask";

type InvestorProfileCardProps = Readonly<{
  profile: InvestorProfile;
}>;

export function InvestorProfileCard({ profile }: InvestorProfileCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserRound className="size-4" />
          Dados cadastrais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Row label="Nome" value={profile.fullName} />
        <Row label="E-mail" value={profile.email} />
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Tipo</span>
          <Badge variant="secondary">{INVESTOR_PERSON_TYPE_LABELS[profile.personType]}</Badge>
        </div>
        <Row
          label={profile.personType === "PF" ? "CPF" : "CNPJ"}
          value={maskDocument(profile.document)}
        />
        <Row label="Telefone" value={maskPhone(profile.phone)} />
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Perfil de risco</span>
          <span>{INVESTOR_SUITABILITY_LABELS[profile.suitability]}</span>
        </div>
        <Row label="Cadastro desde" value={formatDateTime(profile.createdAt)} />
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
