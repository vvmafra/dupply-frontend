import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormSection } from "@/components/forms/FormSection";
import { MockUploadField } from "@/components/forms/MockUploadField";
import { createReceivable } from "@/services/receivables.service";
import { ROUTES } from "@/lib/routes";

interface FormValues {
  invoiceNumber: string;
  debtorName: string;
  debtorTaxId: string;
  grossAmount: string;
  dueDate: string;
  annualRate: string;
  sellerName: string;
  sellerTaxId: string;
  description: string;
}

const INITIAL: FormValues = {
  invoiceNumber: "",
  debtorName: "",
  debtorTaxId: "",
  grossAmount: "",
  dueDate: "",
  annualRate: "12",
  sellerName: "Alpha Distribuidora Ltda",
  sellerTaxId: "12.345.678/0001-90",
  description: "",
};

export function NewReceivableForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormValues>>({});

  function update(field: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormValues> = {};
    if (!values.invoiceNumber) e.invoiceNumber = "Obrigatório";
    if (!values.debtorName) e.debtorName = "Obrigatório";
    if (!values.debtorTaxId) e.debtorTaxId = "Obrigatório";
    if (!values.grossAmount || isNaN(parseFloat(values.grossAmount))) e.grossAmount = "Informe um valor válido";
    if (!values.dueDate) e.dueDate = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await createReceivable({
      invoiceNumber: values.invoiceNumber,
      debtorName: values.debtorName,
      debtorTaxId: values.debtorTaxId,
      grossAmount: parseFloat(values.grossAmount),
      dueDate: values.dueDate,
      estimatedRate: parseFloat(values.annualRate),
      sellerName: values.sellerName,
      sellerTaxId: values.sellerTaxId,
      description: values.description,
    });
    setLoading(false);
    navigate(ROUTES.seller.receivables.list);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection title="Dados da duplicata" description="Informações do título a ser cedido">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="invoiceNumber">Número da duplicata <span className="text-destructive">*</span></Label>
            <Input
              id="invoiceNumber"
              placeholder="Ex: NF-2024-001"
              value={values.invoiceNumber}
              onChange={(e) => update("invoiceNumber", e.target.value)}
              aria-invalid={!!errors.invoiceNumber}
            />
            {errors.invoiceNumber && <p className="text-xs text-destructive">{errors.invoiceNumber}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grossAmount">Valor bruto (R$) <span className="text-destructive">*</span></Label>
            <Input
              id="grossAmount"
              type="number"
              placeholder="Ex: 50000"
              value={values.grossAmount}
              onChange={(e) => update("grossAmount", e.target.value)}
              aria-invalid={!!errors.grossAmount}
            />
            {errors.grossAmount && <p className="text-xs text-destructive">{errors.grossAmount}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Data de vencimento <span className="text-destructive">*</span></Label>
            <Input
              id="dueDate"
              type="date"
              value={values.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
              aria-invalid={!!errors.dueDate}
            />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="annualRate">Taxa anual (%)</Label>
            <Input
              id="annualRate"
              type="number"
              placeholder="Ex: 12"
              value={values.annualRate}
              onChange={(e) => update("annualRate", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input
            id="description"
            placeholder="Breve descrição do título"
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Dados do sacado" description="Empresa devedora do título">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="debtorName">Razão social <span className="text-destructive">*</span></Label>
            <Input
              id="debtorName"
              placeholder="Ex: Supermercados XYZ Ltda"
              value={values.debtorName}
              onChange={(e) => update("debtorName", e.target.value)}
              aria-invalid={!!errors.debtorName}
            />
            {errors.debtorName && <p className="text-xs text-destructive">{errors.debtorName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="debtorTaxId">CNPJ <span className="text-destructive">*</span></Label>
            <Input
              id="debtorTaxId"
              placeholder="00.000.000/0000-00"
              value={values.debtorTaxId}
              onChange={(e) => update("debtorTaxId", e.target.value)}
              aria-invalid={!!errors.debtorTaxId}
            />
            {errors.debtorTaxId && <p className="text-xs text-destructive">{errors.debtorTaxId}</p>}
          </div>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Documentos" description="Anexe os documentos comprobatórios">
        <MockUploadField label="Nota fiscal (PDF)" required hint="Arraste ou clique para selecionar" />
        <MockUploadField label="Contrato comercial" hint="Opcional mas recomendado" />
        <MockUploadField label="Comprovante de entrega" />
      </FormSection>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(ROUTES.seller.receivables.list)}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar recebível"}
        </Button>
      </div>
    </form>
  );
}
