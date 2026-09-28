import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnalystDuplicataApprovalWizardDialog } from "@/components/analyst/AnalystDuplicataApprovalWizardDialog";
import { AnalystAiReport } from "@/components/analyst/AnalystAiReport";
import {
  DuplicataDocumentosCard,
  DuplicataSacadoCard,
  DuplicataValoresCard,
} from "@/components/duplicata/DuplicataInfoCards";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useHeader } from "@/contexts/HeaderContext";
import { useAsyncData } from "@/hooks/use-async-data";
import { DUPLICATA_TIPO_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";
import type { DuplicataAnaliseAnalista, DuplicataTitulo } from "@/domain/duplicata/duplicata.types";
import { ROUTES } from "@/lib/routes";
import {
  fetchDuplicataById,
  setDuplicataAnaliseAnalista,
  setDuplicataOfertaAntecipacao,
} from "@/services/duplicata.service";

export function AnalystDuplicataDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setHeaderContent } = useHeader();
  const { data: d, loading, setData } = useAsyncData(() => fetchDuplicataById(id!), [id], {
    enabled: Boolean(id),
  });
  const [approvalWizardOpen, setApprovalWizardOpen] = useState(false);
  const [submittingWizard, setSubmittingWizard] = useState(false);

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
        <Badge variant="outline" className="text-xs shrink-0 border-white/20 text-white/90">
          {DUPLICATA_TIPO_LABELS[d.tipo]}
        </Badge>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
          Análise:
          <DuplicataAnaliseBadge status={d.analiseAnalista} feminine />
        </span>
        <span className="hidden md:inline-block text-xs text-muted-foreground/70 truncate border-l border-white/10 pl-3">
          Cedente: {d.sellerName}
        </span>
      </div>,
    );

    return () => setHeaderContent(null);
  }, [d, setHeaderContent]);

  /**
   * Re-read the duplicata after a decision so the page shows exactly what the
   * service persisted (mock or backend), instead of a hand-built local copy.
   */
  async function reloadDuplicata(fallback: DuplicataTitulo) {
    const fresh = await fetchDuplicataById(fallback.id).catch(() => null);
    setData(fresh ?? fallback);
  }

  async function setAnalise(analise: DuplicataAnaliseAnalista) {
    if (!d) return;
    try {
      await setDuplicataAnaliseAnalista(d.id, analise);
      const fallback: DuplicataTitulo = { ...d, analiseAnalista: analise };
      delete fallback.descontoAntecipacaoPercent;
      delete fallback.valorLiquidoAntecipacao;
      await reloadDuplicata(fallback);
      toast.success("Análise atualizada");
    } catch {
      toast.error("Não foi possível atualizar a análise");
    }
  }

  async function handleConfirmApprovalWizard(payload: { observacoes: string; descontoPercent: number }) {
    if (!d) return;

    setSubmittingWizard(true);
    try {
      await setDuplicataOfertaAntecipacao(d.id, payload.descontoPercent);
      // The service moves the duplicata to "for_approval" (proposal awaiting the
      // seller), not "aprovado" — the seller decides next.
      await reloadDuplicata({
        ...d,
        analiseAnalista: "for_approval",
        descontoAntecipacaoPercent: payload.descontoPercent,
        valorLiquidoAntecipacao: calcValorLiquidoCedente(d.valor, payload.descontoPercent),
      });
      setApprovalWizardOpen(false);
      toast.success("Proposta de antecipação enviada ao cedente para aprovação");
    } catch {
      toast.error("Não foi possível salvar a aprovação da duplicata");
    } finally {
      setSubmittingWizard(false);
    }
  }

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
        <div className="md:col-span-5 space-y-6">
          <DuplicataValoresCard duplicata={d} />
          <DuplicataSacadoCard duplicata={d} />
          <DuplicataDocumentosCard
            duplicata={d}
            action={
              <Button type="button" variant="outline" size="sm">
                <Download className="size-4" />
                Download
              </Button>
            }
          />

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
