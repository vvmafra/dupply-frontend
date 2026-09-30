import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DuplicataDocumentosCard,
  DuplicataSacadoCard,
  DuplicataValoresCard,
} from "@/components/duplicata/DuplicataInfoCards";
import { DuplicataAnaliseBadge } from "@/components/duplicata/DuplicataAnaliseBadge";
import { SellerDuplicataOperacaoWizardDialog } from "@/components/seller/SellerDuplicataOperacaoWizardDialog";
import { SellerDuplicataProposalCard } from "@/components/seller/SellerDuplicataProposalCard";
import { SellerDuplicataTimeline } from "@/components/seller/SellerDuplicataTimeline";
import { SuccessView } from "@/components/shared/SuccessView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAsyncData } from "@/hooks/use-async-data";
import { DUPLICATA_TIPO_LABELS } from "@/domain/duplicata/duplicata-labels.constants";
import { ROUTES } from "@/lib/routes";
import { fetchDuplicataById, setDuplicataDecisaoCedente } from "@/services/duplicata.service";

export function SellerDuplicataDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: d, loading, setData } = useAsyncData(() => fetchDuplicataById(id!), [id], {
    enabled: Boolean(id),
  });

  const [wizardOpen, setWizardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);

  async function decide(decision: "aprovado" | "reprovado") {
    if (!id || !d) return;
    setSubmitting(true);
    try {
      await setDuplicataDecisaoCedente(id, decision);
      setData(await fetchDuplicataById(id));
      setWizardOpen(false);
      if (decision === "aprovado") {
        setShowSuccessView(true);
      } else {
        toast.error("Operação recusada", {
          description: `Você recusou a antecipação da duplicata ${d.numeroDuplicata}.`,
        });
      }
    } catch {
      toast.error(decision === "aprovado" ? "Erro ao aprovar operação" : "Erro ao recusar operação");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando detalhes...</div>;
  }

  if (!d) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Duplicata não encontrada.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.seller.duplicatas.list}>Voltar para listagem</Link>
        </Button>
      </div>
    );
  }

  if (showSuccessView) {
    return (
      <SuccessView
        className="min-h-[70vh] px-4"
        title="Operação Confirmada!"
        description={`Você aceitou a proposta de antecipação da duplicata ${d.numeroDuplicata}. A operação foi confirmada com sucesso e seguirá para liquidação financeira.`}
        actions={[
          { label: "Ir para Minhas Duplicatas", onClick: () => navigate(ROUTES.seller.duplicatas.list) },
          {
            label: "Ir para o Painel Principal",
            variant: "outline",
            onClick: () => navigate(ROUTES.seller.dashboard),
          },
        ]}
      />
    );
  }

  const aguardandoDecisao = d.analiseAnalista === "for_approval";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent">
          <Link to={ROUTES.seller.duplicatas.list} className="flex items-center gap-1">
            ← Voltar para listagem
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-mono text-foreground">
              Título: {d.numeroDuplicata}
            </h1>
            <Badge variant="secondary" className="font-medium">
              {DUPLICATA_TIPO_LABELS[d.tipo]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">ID do Título: {d.id}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-sm text-muted-foreground">Status da Operação:</span>
          <DuplicataAnaliseBadge status={d.analiseAnalista} className="px-3 py-1 text-sm font-semibold" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <DuplicataValoresCard duplicata={d} />
          <DuplicataSacadoCard duplicata={d} />
          <DuplicataDocumentosCard duplicata={d} />
        </div>

        <div className="space-y-6">
          {aguardandoDecisao && <SellerDuplicataProposalCard duplicata={d} onReview={() => setWizardOpen(true)} />}
          <SellerDuplicataTimeline duplicata={d} />
        </div>
      </div>

      <SellerDuplicataOperacaoWizardDialog
        open={wizardOpen}
        onOpenChange={(open) => {
          if (!open && submitting) return;
          setWizardOpen(open);
        }}
        duplicata={d}
        submitting={submitting}
        onApprove={() => decide("aprovado")}
        onReject={() => decide("reprovado")}
      />
    </div>
  );
}
