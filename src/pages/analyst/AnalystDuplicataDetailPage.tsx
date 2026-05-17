import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnalystDuplicataApprovalWizardDialog } from "@/components/analyst/AnalystDuplicataApprovalWizardDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  fetchDuplicataById,
  setDuplicataAnaliseAnalista,
  setDuplicataOfertaAntecipacao,
} from "@/services/duplicata.service";
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";
import type { DuplicataAnaliseAnalista, DuplicataTitulo } from "@/domain/duplicata/duplicata.types";

const tipoLabel: Record<DuplicataTitulo["tipo"], string> = {
  mercantil: "Mercantil",
  servico: "Serviço",
};

const fiscalLabel: Record<DuplicataTitulo["documentoFiscalTipo"], string> = {
  nfe: "NF-e",
  nfce: "NFC-e",
  nfse: "NFS-e",
  outro: "Outro",
};

const comprovanteLabel: Record<DuplicataTitulo["comprovanteTipo"], string> = {
  entrega: "Entrega",
  aceite: "Aceite",
  prestacao_servico: "Prestação de serviço",
};

const aceiteLabel: Record<DuplicataTitulo["statusAceiteSacado"], string> = {
  aceito: "Aceito",
  pendente: "Pendente",
  recusado: "Recusado",
};

export function AnalystDuplicataDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<DuplicataTitulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalWizardOpen, setApprovalWizardOpen] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDuplicataById(id).then((data) => {
      setD(data);
      setLoading(false);
    });
  }, [id]);

  async function setAnalise(status: DuplicataAnaliseAnalista) {
    if (!id) return;
    await setDuplicataAnaliseAnalista(id, status);
    const updated = await fetchDuplicataById(id);
    setD(updated);
  }

  async function handleApproveConfirm(payload: { observacoes: string; descontoPercent: number }) {
    if (!id || !d) return;
    setApproving(true);
    try {
      await setDuplicataOfertaAntecipacao(id, payload.descontoPercent);
      const updated = await fetchDuplicataById(id);
      setD(updated);
      setApprovalWizardOpen(false);
      const valorLiquido = d.valor * (1 - payload.descontoPercent / 100);
      toast.success("Oferta enviada ao cedente", {
        description: `${d.numeroDuplicata} aguarda aprovação do cedente (desconto ${payload.descontoPercent}%, líquido ${formatCurrencyBRL(valorLiquido)}).`,
      });
    } finally {
      setApproving(false);
    }
  }

  if (loading || !id) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!d) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Duplicata não encontrada.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.analyst.duplicatas.list}>Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild>
        <Link to={ROUTES.analyst.duplicatas.list}>← Voltar</Link>
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight font-mono">{d.numeroDuplicata}</h1>
        <Badge variant="outline">{tipoLabel[d.tipo]}</Badge>
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          Análise:
          <DuplicataAnaliseBadge status={d.analiseAnalista} feminine />
        </span>
      </div>
      <p className="text-sm text-muted-foreground">Cedente: {d.sellerName}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valores e datas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Valor:</span> {formatCurrencyBRL(d.valor)}
          </p>
          <p>
            <span className="text-muted-foreground">Emissão:</span> {d.dataEmissao}
          </p>
          <p>
            <span className="text-muted-foreground">Vencimento:</span> {d.dataVencimento}
          </p>
          <p>
            <span className="text-muted-foreground">Fatura:</span> {d.numeroFatura}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sacado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{d.sacadoRazaoSocial}</p>
          <p className="font-mono">{d.sacadoCnpj}</p>
          <p>{d.sacadoEmailFinanceiro}</p>
          <p>
            <span className="text-muted-foreground">Aceite:</span> {aceiteLabel[d.statusAceiteSacado]}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentação</CardTitle>
          <CardDescription>Uploads simulados no protótipo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Fiscal:</span> {fiscalLabel[d.documentoFiscalTipo]} —{" "}
            {d.documentoFiscalChave}
          </p>
          <p>
            <span className="text-muted-foreground">Anexo fiscal:</span>{" "}
            {d.documentoFiscalAnexado ? "Sim" : "Não"}
          </p>
          <p>
            <span className="text-muted-foreground">Comprovante:</span> {comprovanteLabel[d.comprovanteTipo]} —{" "}
            {d.comprovanteAnexado ? "anexado" : "pendente"}
          </p>
          <p>
            <span className="text-muted-foreground">Declarações antifraude:</span>{" "}
            {d.declaracoesAntifraudeAceitas ? "Aceitas" : "Não"}
          </p>
          <div className="flex justify-end pt-2">
            <Button type="button" variant="outline" size="sm">
              <Download className="size-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium">Sua verificação</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="default" onClick={() => setApprovalWizardOpen(true)}>
            Aprovar duplicata
          </Button>
          <Button type="button" variant="destructive" onClick={() => setAnalise("reprovado")}>
            Reprovar duplicata
          </Button>
          <Button type="button" variant="outline" onClick={() => setAnalise("pendente")}>
            Marcar como pendente
          </Button>
        </div>
      </div>

      <AnalystDuplicataApprovalWizardDialog
        open={approvalWizardOpen}
        onOpenChange={setApprovalWizardOpen}
        numeroDuplicata={d.numeroDuplicata}
        valorNota={d.valor}
        scoreUsuario={d.scoreUsuario}
        scoreDuplicata={d.scoreDuplicata}
        submitting={approving}
        onConfirm={handleApproveConfirm}
      />
    </div>
  );
}
