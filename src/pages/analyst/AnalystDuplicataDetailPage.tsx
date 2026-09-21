import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnalystDuplicataApprovalWizardDialog } from "@/components/analyst/AnalystDuplicataApprovalWizardDialog";
import { AnalystAiReport } from "@/components/analyst/AnalystAiReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useHeader } from "@/contexts/HeaderContext";
import {
  fetchDuplicataById,
  setDuplicataAnaliseAnalista,
  setDuplicataOfertaAntecipacao,
} from "@/services/duplicata.service";
import { ROUTES } from "@/lib/routes";
import { formatCurrencyBRL } from "@/lib/formatters";
import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";
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
  const { setHeaderContent } = useHeader();

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);
    fetchDuplicataById(id).then((res) => {
      if (active) {
        setD(res);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!d) {
      setHeaderContent(null);
      return;
    }

    setHeaderContent(
      <div className="flex items-center gap-3 min-w-0 flex-wrap sm:flex-nowrap">
        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-white/80 hover:text-white" asChild>
          <Link to={ROUTES.analyst.duplicatas.list}>← Voltar</Link>
        </Button>
        <div className="h-4 w-px bg-white/15 shrink-0" />
        <h1 className="text-base font-bold tracking-tight font-mono text-white shrink-0">{d.numeroDuplicata}</h1>
        <Badge variant="outline" className="text-xs shrink-0 border-white/20 text-white/90">{tipoLabel[d.tipo]}</Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          Análise:
          <DuplicataAnaliseBadge status={d.analiseAnalista} feminine />
        </span>
        <span className="hidden md:inline-block text-xs text-muted-foreground/70 truncate border-l border-white/10 pl-3">
          Cedente: {d.sellerName}
        </span>
      </div>
    );

    return () => setHeaderContent(null);
  }, [d, setHeaderContent]);

  const [submittingWizard, setSubmittingWizard] = useState(false);

  const setAnalise = async (analise: DuplicataAnaliseAnalista) => {
    if (!d) return;
    try {
      await setDuplicataAnaliseAnalista(d.id, analise);
      setD((prev) => (prev ? { ...prev, analiseAnalista: analise } : prev));
      toast.success("Análise atualizada");
    } catch {
      toast.error("Não foi possível atualizar a análise");
    }
  };

  const handleConfirmApprovalWizard = async (payload: {
    observacoes: string;
    descontoPercent: number;
  }) => {
    if (!d) return;

    setSubmittingWizard(true);
    try {
      await setDuplicataOfertaAntecipacao(d.id, payload.descontoPercent);
      const valorLiquido = calcValorLiquidoCedente(d.valor, payload.descontoPercent);
      setD((prev) =>
        prev
          ? {
              ...prev,
              analiseAnalista: "aprovado",
              descontoPercent: payload.descontoPercent,
              valorLiquidoAntecipacao: valorLiquido,
            }
          : prev
      );
      setApprovalWizardOpen(false);
      toast.success("Duplicata aprovada e enviada para o cedente!");
    } catch {
      toast.error("Não foi possível salvar a aprovação da duplicata");
    } finally {
      setSubmittingWizard(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Carregando duplicata...</p>
      </div>
    );
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
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details (5 cols) */}
        <div className="md:col-span-5 space-y-6">
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
        </div>

        {/* Right Column: AI Report (7 cols) */}
        <div className="md:col-span-7">
          <AnalystAiReport report={d.aiReport} pdfUrl={d.aiReportPdfUrl} />
        </div>
      </div>

      <AnalystDuplicataApprovalWizardDialog
        open={approvalWizardOpen}
        onOpenChange={setApprovalWizardOpen}
        numeroDuplicata={d.numeroDuplicata}
        valorNota={d.valor}
        scoreUsuario={d.scoreUsuario}
        scoreDuplicata={d.scoreDuplicata}
        submitting={submittingWizard}
        onConfirm={handleConfirmApprovalWizard}
      />
    </div>
  );
}
