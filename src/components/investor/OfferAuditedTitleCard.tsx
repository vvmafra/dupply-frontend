import { Building2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import {
  formatMaskedFiscalKey,
  inferRouteFromFiscalKey,
  inferSectorFromName,
} from "@/domain/offer/offer-audit.helpers";

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? "flex justify-between pb-1" : "flex justify-between border-b border-border/40 pb-2"}>
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

/** Masked view of the underlying duplicata for investors (no seller/sacado identities). */
export function OfferAuditedTitleCard({ duplicata }: Readonly<{ duplicata: DuplicataTitulo | null }>) {
  const tipo = duplicata?.tipo ?? "mercantil";
  const servico = tipo === "servico";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
          <FileText className="size-5 text-primary shrink-0" />
          Dados do Título Auditado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <Row label="Tipo de Título">
          <span className="text-white font-medium">
            {servico ? "Duplicata de Serviço (DS)" : "Duplicata Mercantil (DM)"}
          </span>
        </Row>
        <Row label={servico ? "NFSe Chave" : "NF-e Chave"}>
          <span className="text-white font-mono">{formatMaskedFiscalKey(duplicata?.documentoFiscalChave)}</span>
        </Row>
        <Row label="Setor Cedente">
          <div className="flex items-center gap-1 text-white">
            <Building2 className="size-3 text-muted-foreground" />
            <span>{inferSectorFromName(duplicata?.sellerName, "Logística e Distribuição")}</span>
          </div>
        </Row>
        <Row label="Setor Sacado">
          <div className="flex items-center gap-1 text-white">
            <Building2 className="size-3 text-muted-foreground" />
            <span>{inferSectorFromName(duplicata?.sacadoRazaoSocial, "Varejo Alimentício")}</span>
          </div>
        </Row>
        <Row label="UF de Origem/Destino" last>
          <span className="text-white font-medium">
            {duplicata ? inferRouteFromFiscalKey(duplicata.documentoFiscalChave, tipo) : "Campinas/SP → São Paulo/SP"}
          </span>
        </Row>
      </CardContent>
    </Card>
  );
}
