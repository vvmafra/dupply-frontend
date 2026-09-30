import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DUPLICATA_ACEITE_LABELS_LONG,
  DUPLICATA_COMPROVANTE_LABELS,
  DUPLICATA_FISCAL_LABELS,
} from "@/domain/duplicata/duplicata-labels.constants";
import type { DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { formatCurrencyBRL } from "@/lib/formatters";

/**
 * Cards shared by the seller, analyst and admin detail pages. Each one only
 * reads from the duplicata; page-specific actions come in through `action`.
 */

type CardProps = Readonly<{ duplicata: DuplicataTitulo; className?: string }>;

function Field({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground block">{label}</span>
      <span className={mono ? "font-mono text-foreground mt-1 block" : "font-medium text-foreground mt-1 block"}>
        {children}
      </span>
    </div>
  );
}

export function DuplicataValoresCard({ duplicata: d, className }: CardProps) {
  return (
    <Card className={className ?? "shadow-xs border border-border"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Valores da Operação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/30 border">
            <span className="text-xs text-muted-foreground block">Valor de Face</span>
            <span className="font-bold font-mono text-base text-foreground mt-1 block">
              {formatCurrencyBRL(d.valor)}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border">
            <span className="text-xs text-muted-foreground block">Desconto Aplicado</span>
            <span className="font-bold font-mono text-base text-foreground mt-1 block">
              {d.descontoAntecipacaoPercent != null ? `${d.descontoAntecipacaoPercent}%` : "—"}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <span className="text-xs text-muted-foreground block">Líquido Estimado</span>
            <span className="font-bold font-mono text-base text-primary mt-1 block">
              {d.valorLiquidoAntecipacao != null ? formatCurrencyBRL(d.valorLiquidoAntecipacao) : "—"}
            </span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <Field label="Emissão">{d.dataEmissao}</Field>
          <Field label="Vencimento">{d.dataVencimento}</Field>
          <Field label="Fatura" mono>
            {d.numeroFatura}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

export function DuplicataSacadoCard({ duplicata: d, className }: CardProps) {
  return (
    <Card className={className ?? "shadow-xs border border-border"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Dados do Sacado (Pagador)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Razão Social">{d.sacadoRazaoSocial}</Field>
          <Field label="CNPJ do Sacado" mono>
            {d.sacadoCnpj}
          </Field>
          <Field label="E-mail Financeiro">{d.sacadoEmailFinanceiro}</Field>
          <Field label="Status de Aceite do Sacado">
            {DUPLICATA_ACEITE_LABELS_LONG[d.statusAceiteSacado] ?? "Pendente"}
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}

export function DuplicataDocumentosCard({
  duplicata: d,
  className,
  action,
}: CardProps & Readonly<{ action?: ReactNode }>) {
  return (
    <Card className={className ?? "shadow-xs border border-border"}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Documentos Anexados</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs text-muted-foreground block">Documento Fiscal</span>
            <span className="text-foreground mt-1 block">
              {DUPLICATA_FISCAL_LABELS[d.documentoFiscalTipo]}
              {" · "}
              {d.documentoFiscalAnexado ? "anexado" : "não anexado"}
            </span>
            {d.documentoFiscalChave && (
              <span className="font-mono text-[11px] block mt-1 text-muted-foreground break-all max-w-full">
                Chave: {d.documentoFiscalChave}
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Comprovante</span>
            <span className="text-foreground mt-1 block">
              Tipo: {DUPLICATA_COMPROVANTE_LABELS[d.comprovanteTipo]}
            </span>
            <span className="text-[11px] block mt-1 text-muted-foreground">
              Status: {d.comprovanteAnexado ? "Verificado" : "Pendente"}
            </span>
          </div>
          <div className="sm:col-span-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground block">Declarações Antifraude</span>
            <span className="text-foreground mt-1 block font-medium">
              {d.declaracoesAntifraudeAceitas
                ? "✓ Declarações de conformidade e integridade aceitas pelo Cedente"
                : "Pendente de confirmação"}
            </span>
          </div>
        </div>
        {action && <div className="flex justify-end pt-1">{action}</div>}
      </CardContent>
    </Card>
  );
}
