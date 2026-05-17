import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { submitAnalystCadastralReview } from "@/services/seller-review.service";
import type { AnalystCadastralReviewDecision } from "@/domain/risk-analyst/seller-review.types";
import { cn } from "@/lib/utils";

const JUSTIFICATION_MIN_LENGTH = 20;

type WizardStep = 1 | 2;

function confirmReviewButtonLabel(submitting: boolean, decision: AnalystCadastralReviewDecision): string {
  if (submitting) return "Registrando...";
  if (decision === "APPROVED") return "Confirmar aprovação";
  return "Confirmar reprovação";
}

function WizardStepOneContent({
  sellerLegalName,
  justification,
  onJustificationChange,
  error,
  submitting,
  onChooseApprove,
  onChooseReject,
  onCancel,
}: Readonly<{
  sellerLegalName: string;
  justification: string;
  onJustificationChange: (value: string) => void;
  error: string | null;
  submitting: boolean;
  onChooseApprove: () => void;
  onChooseReject: () => void;
  onCancel: () => void;
}>) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Revisão cadastral</DialogTitle>
        <DialogDescription>
          Cedente: <span className="font-medium text-foreground">{sellerLegalName}</span>. Descreva a fundamentação e
          escolha a decisão.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">Etapa 1 de 2</p>
        <div className="space-y-2">
          <Label htmlFor="analyst-review-justification">Justificativa</Label>
          <Textarea
            id="analyst-review-justification"
            placeholder="Ex.: conferência de documentos societários, consistência com o score e pontos de atenção..."
            value={justification}
            onChange={(e) => onJustificationChange(e.target.value)}
            rows={5}
            className="min-h-[120px] resize-y"
            disabled={submitting}
          />
          <p className="text-xs text-muted-foreground">
            Mínimo de {JUSTIFICATION_MIN_LENGTH} caracteres ({justification.trim().length}/{JUSTIFICATION_MIN_LENGTH})
          </p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="default"
            className="inline-flex w-full items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={onChooseApprove}
            disabled={submitting}
          >
            <CheckCircle2 className="size-4 shrink-0" />
            Aprovar cadastro
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="inline-flex w-full items-center justify-center gap-2"
            onClick={onChooseReject}
            disabled={submitting}
          >
            <XCircle className="size-4 shrink-0" />
            Reprovar cadastro
          </Button>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
      </DialogFooter>
    </>
  );
}

function WizardStepTwoContent({
  analystName,
  decision,
  justificationText,
  error,
  submitting,
  onBack,
  onConfirm,
}: Readonly<{
  analystName: string;
  decision: AnalystCadastralReviewDecision;
  justificationText: string;
  error: string | null;
  submitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}>) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirmar decisão</DialogTitle>
        <DialogDescription>Etapa 2 de 2 — confira tudo antes de registrar.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Alert variant="destructive" className="border-amber-500/40 bg-amber-500/10 text-foreground">
          <AlertTriangle className="text-amber-600 dark:text-amber-500" />
          <AlertDescription> <strong>Ação sensível</strong></AlertDescription>
          <AlertDescription>
            Ao confirmar, a decisão fica registrada em nome de {analystName} e o status do cadastro do
            cedente será atualizado.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Decisão</p>
          {decision === "APPROVED" ? (
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">Aprovação do cadastro</Badge>
          ) : (
            <Badge variant="destructive">Reprovação do cadastro</Badge>
          )}
        </div>
        <div className="rounded-md border bg-muted/30 p-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground">Justificativa</p>
          <p className="mt-1 whitespace-pre-wrap">{justificationText}</p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <DialogFooter className="gap-2 sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          Voltar e editar
        </Button>
        <Button
          type="button"
          variant={decision === "APPROVED" ? "default" : "destructive"}
          className={cn(decision === "APPROVED" && "bg-emerald-600 hover:bg-emerald-600/90")}
          onClick={onConfirm}
          disabled={submitting}
        >
          {confirmReviewButtonLabel(submitting, decision)}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AnalystCadastralReviewWizardDialog({
  open,
  onOpenChange,
  sellerId,
  sellerLegalName,
  analystId,
  analystName,
  onCompleted,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerId: string;
  sellerLegalName: string;
  analystId: string;
  analystName: string;
  onCompleted: () => void | Promise<void>;
}>) {
  const [step, setStep] = useState<WizardStep>(1);
  const [justification, setJustification] = useState("");
  const [decision, setDecision] = useState<AnalystCadastralReviewDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setJustification("");
      setDecision(null);
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  function validateJustification(): boolean {
    const t = justification.trim();
    if (t.length < JUSTIFICATION_MIN_LENGTH) {
      setError(`Informe uma justificativa com pelo menos ${JUSTIFICATION_MIN_LENGTH} caracteres.`);
      return false;
    }
    setError(null);
    return true;
  }

  function handleChooseApprove() {
    if (!validateJustification()) return;
    setDecision("APPROVED");
    setStep(2);
  }

  function handleChooseReject() {
    if (!validateJustification()) return;
    setDecision("REJECTED");
    setStep(2);
  }

  function handleBackToEdit() {
    setStep(1);
    setError(null);
  }

  async function handleConfirm() {
    if (!decision) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitAnalystCadastralReview(sellerId, {
        analystId,
        analystName,
        decision,
        justification: justification.trim(),
      });
      await onCompleted();
      onOpenChange(false);
    } catch {
      setError("Não foi possível registrar a revisão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  let body: ReactNode = null;
  if (step === 1) {
    body = (
      <WizardStepOneContent
        sellerLegalName={sellerLegalName}
        justification={justification}
        onJustificationChange={(value) => {
          setJustification(value);
          if (error) setError(null);
        }}
        error={error}
        submitting={submitting}
        onChooseApprove={handleChooseApprove}
        onChooseReject={handleChooseReject}
        onCancel={() => onOpenChange(false)}
      />
    );
  } else if (decision) {
    body = (
      <WizardStepTwoContent
        analystName={analystName}
        decision={decision}
        justificationText={justification.trim()}
        error={error}
        submitting={submitting}
        onBack={handleBackToEdit}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-lg" showCloseButton={!submitting}>
        {body}
      </DialogContent>
    </Dialog>
  );
}
