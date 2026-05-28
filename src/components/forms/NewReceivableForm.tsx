import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormSection } from "@/components/forms/FormSection";
import { RegistrationUploadField } from "@/components/forms/RegistrationUploadField";
import { ReceivableError } from "@/domain/receivable/receivable.errors";
import {
  receivableDraftSchema,
  receivableSubmitSchema,
} from "@/domain/receivable/receivable.schema";
import type {
  ReceivableDetail,
  ReceivableFiscalDocumentType,
  ReceivableFormValues,
  ReceivablePayerAcceptanceStatus,
  ReceivableProofType,
  ReceivableType,
} from "@/domain/receivable/receivable.types";
import { getReceivableDemoAutofillFormValues } from "@/data/receivable-demo.mock";
import { ROUTES } from "@/lib/routes";
import {
  createAndSubmitReceivable,
  createReceivableDraft,
  submitReceivableForReview,
  updateReceivableDraft,
} from "@/services/receivable.service";
import { ZodError } from "zod";

interface NewReceivableFormProps {
  readonly initialReceivable?: ReceivableDetail;
}

function mapDetailToFormValues(receivable: ReceivableDetail): ReceivableFormValues {
  return {
    type: receivable.type,
    billNumber: receivable.billNumber,
    invoiceNumber: receivable.invoiceNumber,
    faceValue: receivable.faceValue,
    issuedAt: receivable.issuedAt,
    dueDate: receivable.dueDate,
    payerCnpj: receivable.payerCnpj,
    payerLegalName: receivable.payerLegalName,
    payerFinancialEmail: receivable.payerFinancialEmail,
    fiscalDocumentType: receivable.fiscalDocumentType,
    fiscalDocumentKey: receivable.fiscalDocumentKey,
    proofType: receivable.proofType,
    payerAcceptanceStatus: receivable.payerAcceptanceStatus,
    desiredAnticipationValue: receivable.desiredAnticipationValue,
    antifraudDeclarationsAccepted: receivable.antifraudDeclarationsAccepted,
  };
}

function zodErrorsToFieldMap(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export function NewReceivableForm({ initialReceivable }: NewReceivableFormProps) {
  const navigate = useNavigate();
  const readOnly = initialReceivable != null && initialReceivable.status !== "created";
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(initialReceivable?.id ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [type, setType] = useState<ReceivableType>("commercial");
  const [billNumber, setBillNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [faceValueInput, setFaceValueInput] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [payerCnpj, setPayerCnpj] = useState("");
  const [payerLegalName, setPayerLegalName] = useState("");
  const [payerFinancialEmail, setPayerFinancialEmail] = useState("");
  const [fiscalDocumentType, setFiscalDocumentType] = useState<ReceivableFiscalDocumentType>("nfe");
  const [fiscalDocumentKey, setFiscalDocumentKey] = useState("");
  const [fiscalUploaded, setFiscalUploaded] = useState(false);
  const [proofType, setProofType] = useState<ReceivableProofType>("delivery");
  const [proofUploaded, setProofUploaded] = useState(false);
  const [payerAcceptanceStatus, setPayerAcceptanceStatus] =
    useState<ReceivablePayerAcceptanceStatus>("pending");
  const [desiredAnticipationInput, setDesiredAnticipationInput] = useState("");
  const [declarations, setDeclarations] = useState(false);

  useEffect(() => {
    if (!initialReceivable) return;
    const values = mapDetailToFormValues(initialReceivable);
    setType(values.type);
    setBillNumber(values.billNumber);
    setInvoiceNumber(values.invoiceNumber);
    setFaceValueInput(String(values.faceValue));
    setIssuedAt(values.issuedAt);
    setDueDate(values.dueDate);
    setPayerCnpj(values.payerCnpj);
    setPayerLegalName(values.payerLegalName);
    setPayerFinancialEmail(values.payerFinancialEmail);
    setFiscalDocumentType(values.fiscalDocumentType);
    setFiscalDocumentKey(values.fiscalDocumentKey);
    setProofType(values.proofType);
    setPayerAcceptanceStatus(values.payerAcceptanceStatus);
    setDesiredAnticipationInput(String(values.desiredAnticipationValue));
    setDeclarations(values.antifraudDeclarationsAccepted);
  }, [initialReceivable]);

  function clearFieldError(key: string) {
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  /** Dados fixos só para demo/hackathon — evita preencher o formulário inteiro. */
  function fillDemoData() {
    const demo = getReceivableDemoAutofillFormValues();
    setType(demo.type);
    setBillNumber(demo.billNumber);
    setInvoiceNumber(demo.invoiceNumber);
    setFaceValueInput(demo.faceValue);
    setIssuedAt(demo.issuedAt);
    setDueDate(demo.dueDate);
    setPayerCnpj(demo.payerCnpj);
    setPayerLegalName(demo.payerLegalName);
    setPayerFinancialEmail(demo.payerFinancialEmail);
    setFiscalDocumentType(demo.fiscalDocumentType);
    setFiscalDocumentKey(demo.fiscalDocumentKey);
    setFiscalUploaded(demo.fiscalUploaded);
    setProofType(demo.proofType);
    setProofUploaded(demo.proofUploaded);
    setPayerAcceptanceStatus(demo.payerAcceptanceStatus);
    setDesiredAnticipationInput(demo.desiredAnticipationValue);
    setDeclarations(demo.declarations);
    setErrors({});
  }

  function buildFormValues(): ReceivableFormValues {
    return {
      type,
      billNumber,
      invoiceNumber,
      faceValue: Number.parseFloat(faceValueInput) || 0,
      issuedAt,
      dueDate,
      payerCnpj,
      payerLegalName,
      payerFinancialEmail,
      fiscalDocumentType,
      fiscalDocumentKey,
      proofType,
      payerAcceptanceStatus,
      desiredAnticipationValue: Number.parseFloat(desiredAnticipationInput) || 0,
      antifraudDeclarationsAccepted: declarations,
    };
  }

  async function handleSaveDraft() {
    setLoading(true);
    try {
      const values = receivableDraftSchema.parse(buildFormValues());
      if (draftId) {
        await updateReceivableDraft(draftId, values);
      } else {
        const id = await createReceivableDraft(values);
        setDraftId(id);
      }
      toast.success("Informações salvas");
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorsToFieldMap(err));
        return;
      }
      if (err instanceof ReceivableError) {
        toast.error(err.message);
        return;
      }
      toast.error("Não foi possível salvar as informações.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitForReview() {
    setLoading(true);
    try {
      const values = receivableSubmitSchema.parse(buildFormValues());
      console.log("values", values);
      if (draftId) {
        await submitReceivableForReview(draftId);
      } else {
        await createAndSubmitReceivable(values);
      }
      toast.success("Recebível enviado para análise");
      navigate(ROUTES.seller.receivables.list);
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(zodErrorsToFieldMap(err));
        return;
      }
      if (err instanceof ReceivableError) {
        toast.error(err.message);
        return;
      }
      toast.error("Não foi possível enviar para análise.");
    } finally {
      setLoading(false);
    }
  }

  if (readOnly && initialReceivable) {
    return (
      <div className="space-y-4 max-w-3xl">
        <p className="text-sm text-muted-foreground">
          Este recebível não pode mais ser editado porque já foi enviado para análise.
        </p>
        <div className="rounded-md border p-4 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Número:</span> {initialReceivable.billNumber}
          </p>
          <p>
            <span className="text-muted-foreground">Sacado:</span> {initialReceivable.payerLegalName}
          </p>
          <p>
            <span className="text-muted-foreground">Valor:</span> R$ {initialReceivable.faceValue.toFixed(2)}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => navigate(ROUTES.seller.receivables.list)}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-6 max-w-3xl"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <FormSection title="Título" description="Identificação do recebível.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>
              Tipo <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={type === "commercial"}
                  onChange={() => {
                    setType("commercial");
                    clearFieldError("type");
                  }}
                  disabled={loading}
                />
                Mercantil
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={type === "service"}
                  onChange={() => {
                    setType("service");
                    clearFieldError("type");
                  }}
                  disabled={loading}
                />
                Serviço
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="billNumber">
              Número do recebível <span className="text-destructive">*</span>
            </Label>
            <Input
              id="billNumber"
              value={billNumber}
              onChange={(e) => {
                setBillNumber(e.target.value);
                clearFieldError("billNumber");
              }}
              aria-invalid={!!errors.billNumber}
              disabled={loading}
            />
            {errors.billNumber && <p className="text-xs text-destructive">{errors.billNumber}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invoiceNumber">
              Número da fatura <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                clearFieldError("invoiceNumber");
              }}
              aria-invalid={!!errors.invoiceNumber}
              disabled={loading}
            />
            {errors.invoiceNumber && <p className="text-xs text-destructive">{errors.invoiceNumber}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="faceValue">
              Valor (R$) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="faceValue"
              type="number"
              value={faceValueInput}
              onChange={(e) => {
                setFaceValueInput(e.target.value);
                clearFieldError("faceValue");
              }}
              aria-invalid={!!errors.faceValue}
              disabled={loading}
            />
            {errors.faceValue && <p className="text-xs text-destructive">{errors.faceValue}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issuedAt">
              Data de emissão <span className="text-destructive">*</span>
            </Label>
            <Input
              id="issuedAt"
              type="date"
              value={issuedAt}
              onChange={(e) => {
                setIssuedAt(e.target.value);
                clearFieldError("issuedAt");
              }}
              aria-invalid={!!errors.issuedAt}
              disabled={loading}
            />
            {errors.issuedAt && <p className="text-xs text-destructive">{errors.issuedAt}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">
              Data de vencimento <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearFieldError("dueDate");
              }}
              aria-invalid={!!errors.dueDate}
              disabled={loading}
            />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
          </div>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Sacado" description="Dados do devedor para cobrança.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="payerCnpj">
              CNPJ <span className="text-destructive">*</span>
            </Label>
            <Input
              id="payerCnpj"
              placeholder="00.000.000/0000-00"
              value={payerCnpj}
              onChange={(e) => {
                setPayerCnpj(e.target.value);
                clearFieldError("payerCnpj");
              }}
              aria-invalid={!!errors.payerCnpj}
              disabled={loading}
            />
            {errors.payerCnpj && <p className="text-xs text-destructive">{errors.payerCnpj}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="payerLegalName">
              Razão social <span className="text-destructive">*</span>
            </Label>
            <Input
              id="payerLegalName"
              value={payerLegalName}
              onChange={(e) => {
                setPayerLegalName(e.target.value);
                clearFieldError("payerLegalName");
              }}
              aria-invalid={!!errors.payerLegalName}
              disabled={loading}
            />
            {errors.payerLegalName && <p className="text-xs text-destructive">{errors.payerLegalName}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="payerFinancialEmail">
              E-mail financeiro <span className="text-destructive">*</span>
            </Label>
            <Input
              id="payerFinancialEmail"
              type="email"
              placeholder="financeiro@sacado.com.br"
              value={payerFinancialEmail}
              onChange={(e) => {
                setPayerFinancialEmail(e.target.value);
                clearFieldError("payerFinancialEmail");
              }}
              aria-invalid={!!errors.payerFinancialEmail}
              disabled={loading}
            />
            {errors.payerFinancialEmail && (
              <p className="text-xs text-destructive">{errors.payerFinancialEmail}</p>
            )}
          </div>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Documento fiscal" description="Tipo, chave e anexo (PDF ou XML).">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fiscalDocumentType">Tipo do documento</Label>
            <select
              id="fiscalDocumentType"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={fiscalDocumentType}
              onChange={(e) => setFiscalDocumentType(e.target.value as ReceivableFiscalDocumentType)}
              disabled={loading}
            >
              <option value="nfe">NF-e</option>
              <option value="nfce">NFC-e</option>
              <option value="nfse">NFS-e</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fiscalDocumentKey">
              Número / chave de acesso <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fiscalDocumentKey"
              value={fiscalDocumentKey}
              onChange={(e) => {
                setFiscalDocumentKey(e.target.value);
                clearFieldError("fiscalDocumentKey");
              }}
              aria-invalid={!!errors.fiscalDocumentKey}
              disabled={loading}
            />
            {errors.fiscalDocumentKey && (
              <p className="text-xs text-destructive">{errors.fiscalDocumentKey}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RegistrationUploadField
            label="Arquivo fiscal (PDF ou XML)"
            value={fiscalUploaded}
            onChange={setFiscalUploaded}
          />
          <Badge variant="secondary">TODO</Badge>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Comprovante" description="Entrega, aceite ou prestação de serviço.">
        <div className="space-y-1.5">
          <Label htmlFor="proofType">Tipo de comprovante</Label>
          <select
            id="proofType"
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={proofType}
            onChange={(e) => setProofType(e.target.value as ReceivableProofType)}
            disabled={loading}
          >
            <option value="delivery">Entrega</option>
            <option value="acceptance">Aceite</option>
            <option value="service_provision">Prestação de serviço</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <RegistrationUploadField
            label="Comprovante (entrega, aceite ou prestação)"
            value={proofUploaded}
            onChange={setProofUploaded}
          />
          <Badge variant="secondary">TODO</Badge>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Aceite e antecipação" description="Status perante o sacado e valor pretendido.">
        <div className="space-y-1.5">
          <Label htmlFor="payerAcceptanceStatus">Status do aceite (sacado)</Label>
          <select
            id="payerAcceptanceStatus"
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={payerAcceptanceStatus}
            onChange={(e) =>
              setPayerAcceptanceStatus(e.target.value as ReceivablePayerAcceptanceStatus)
            }
            disabled={loading}
          >
            <option value="accepted">Aceito</option>
            <option value="pending">Pendente</option>
            <option value="refused">Recusado</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desiredAnticipationValue">
            Valor desejado para antecipação (R$) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="desiredAnticipationValue"
            type="number"
            value={desiredAnticipationInput}
            onChange={(e) => {
              setDesiredAnticipationInput(e.target.value);
              clearFieldError("desiredAnticipationValue");
            }}
            aria-invalid={!!errors.desiredAnticipationValue}
            disabled={loading}
          />
          {errors.desiredAnticipationValue && (
            <p className="text-xs text-destructive">{errors.desiredAnticipationValue}</p>
          )}
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Declarações antifraude" description="Confirmações para envio à análise.">
        <div className="flex items-start gap-2">
          <Checkbox
            id="declarations"
            checked={declarations}
            onCheckedChange={(checked) => {
              setDeclarations(checked === true);
              clearFieldError("antifraudDeclarationsAccepted");
            }}
            className="mt-0.5"
            disabled={loading}
          />
          <Label htmlFor="declarations" className="text-sm font-normal leading-relaxed cursor-pointer">
            Declaro que as informações são verdadeiras, que os documentos são autênticos e que não há fraude ou
            duplicidade nesta operação, estando ciente das sanções legais em caso de declaração falsa.
          </Label>
        </div>
        {errors.antifraudDeclarationsAccepted && (
          <p className="text-xs text-destructive">{errors.antifraudDeclarationsAccepted}</p>
        )}
      </FormSection>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={fillDemoData} disabled={loading}>
          Preencher automaticamente
        </Button>
        <div className="flex flex-wrap justify-end gap-2 sm:ml-auto">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.seller.receivables.list)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" variant="secondary" onClick={() => void handleSaveDraft()} disabled={loading}>
            {loading ? "Salvando..." : "Salvar informações"}
          </Button>
          <Button type="button" onClick={() => void handleSubmitForReview()} disabled={loading}>
            {loading ? "Enviando..." : "Enviar para análise"}
          </Button>
        </div>
      </div>
    </form>
  );
}
