import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnalystReceivableOfferWizardDialog } from "@/components/analyst/AnalystReceivableOfferWizardDialog";
import { ReceivableStatusBadge } from "@/components/receivable/ReceivableStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReceivableError } from "@/domain/receivable/receivable.errors";
import type { ReceivableDetail } from "@/domain/receivable/receivable.types";
import { formatCurrencyBRL } from "@/lib/formatters";
import { ROUTES } from "@/lib/routes";
import {
  fetchReceivableById,
  submitRiskOffer,
  submitRiskReprove,
} from "@/services/receivable.service";

const typeLabel = {
  commercial: "Mercantil",
  service: "Serviço",
} as const;

const fiscalLabel = {
  nfe: "NF-e",
  nfce: "NFC-e",
  nfse: "NFS-e",
  other: "Outro",
} as const;

const proofLabel = {
  delivery: "Entrega",
  acceptance: "Aceite",
  service_provision: "Prestação de serviço",
} as const;

const acceptanceLabel = {
  accepted: "Aceito",
  pending: "Pendente",
  refused: "Recusado",
} as const;

export function AnalystReceivableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [receivable, setReceivable] = useState<ReceivableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [offerWizardOpen, setOfferWizardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchReceivableById(id)
      .then((data) => {
        setReceivable(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  async function reload() {
    if (!id) return;
    const updated = await fetchReceivableById(id);
    setReceivable(updated);
  }

  async function handleOfferConfirm(discountPercent: number) {
    if (!id) return;
    setSubmitting(true);
    try {
      await submitRiskOffer(id, discountPercent);
      await reload();
      setOfferWizardOpen(false);
      toast.success("Oferta enviada ao cedente");
    } catch (err) {
      toast.error(err instanceof ReceivableError ? err.message : "Não foi possível enviar a oferta.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReprove() {
    if (!id) return;
    setSubmitting(true);
    try {
      await submitRiskReprove(id);
      await reload();
      toast.success("Recebível reprovada");
    } catch (err) {
      toast.error(err instanceof ReceivableError ? err.message : "Não foi possível reprovar o recebível.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !id) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!receivable) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Recebível não encontrado.</p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.analyst.receivables.list}>Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild>
        <Link to={ROUTES.analyst.receivables.list}>← Voltar</Link>
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight font-mono">{receivable.billNumber}</h1>
        <Badge variant="outline">{typeLabel[receivable.type]}</Badge>
        <ReceivableStatusBadge status={receivable.status} />
      </div>
      <p className="text-sm text-muted-foreground">Cedente (ID): {receivable.sellerId}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Valores e datas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Valor:</span> {formatCurrencyBRL(receivable.faceValue)}
          </p>
          <p>
            <span className="text-muted-foreground">Emissão:</span> {receivable.issuedAt}
          </p>
          <p>
            <span className="text-muted-foreground">Vencimento:</span> {receivable.dueDate}
          </p>
          <p>
            <span className="text-muted-foreground">Fatura:</span> {receivable.invoiceNumber}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sacado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{receivable.payerLegalName}</p>
          <p className="font-mono">{receivable.payerCnpj}</p>
          <p>{receivable.payerFinancialEmail}</p>
          <p>
            <span className="text-muted-foreground">Aceite:</span>{" "}
            {acceptanceLabel[receivable.payerAcceptanceStatus]}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentação</CardTitle>
          <CardDescription>Uploads disponíveis em versão futura</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Fiscal:</span> {fiscalLabel[receivable.fiscalDocumentType]} —{" "}
            {receivable.fiscalDocumentKey}
          </p>
          <p>
            <span className="text-muted-foreground">Comprovante:</span> {proofLabel[receivable.proofType]}
          </p>
          <p>
            <span className="text-muted-foreground">Declarações antifraude:</span>{" "}
            {receivable.antifraudDeclarationsAccepted ? "Aceitas" : "Não"}
          </p>
          <div className="flex justify-end pt-2">
            <Button type="button" variant="outline" size="sm" disabled>
              <Download className="size-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Score — em breve</p>
        </CardContent>
      </Card>

      {receivable.status === "under_review" && (
        <>
          <Separator />
          <div className="space-y-3">
            <p className="text-sm font-medium">Sua verificação</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="default" onClick={() => setOfferWizardOpen(true)} disabled={submitting}>
                Oferta
              </Button>
              <Button type="button" variant="destructive" onClick={() => void handleReprove()} disabled={submitting}>
                Reprovar
              </Button>
            </div>
          </div>
        </>
      )}

      <AnalystReceivableOfferWizardDialog
        open={offerWizardOpen}
        onOpenChange={setOfferWizardOpen}
        receivable={receivable}
        submitting={submitting}
        onConfirm={handleOfferConfirm}
      />
    </div>
  );
}
