import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AceiteAntecipacaoFields } from "@/components/forms/new-duplicata/AceiteAntecipacaoFields";
import { AntecipacaoSimulator } from "@/components/forms/new-duplicata/AntecipacaoSimulator";
import { ComprovanteFields } from "@/components/forms/new-duplicata/ComprovanteFields";
import { DeclaracoesFields } from "@/components/forms/new-duplicata/DeclaracoesFields";
import { DocumentoFiscalFields } from "@/components/forms/new-duplicata/DocumentoFiscalFields";
import { SacadoFields } from "@/components/forms/new-duplicata/SacadoFields";
import { TituloFields } from "@/components/forms/new-duplicata/TituloFields";
import { XmlImportCard } from "@/components/forms/new-duplicata/XmlImportCard";
import { SuccessView } from "@/components/shared/SuccessView";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  createDemoNovaDuplicataValues,
  createInitialNovaDuplicataValues,
  novaDuplicataFormSchema,
  novaDuplicataValuesFromXml,
  toNovaDuplicataPayload,
  type NovaDuplicataFormValues,
} from "@/domain/duplicata/duplicata.schema";
import { simularAntecipacao } from "@/domain/duplicata/duplicata-simulacao.helpers";
import { ROUTES } from "@/lib/routes";
import { createDuplicata } from "@/services/duplicata.service";

interface NewDuplicataFormProps {
  sellerId: string;
  onSuccess?: () => void;
}

export function NewDuplicataForm({ sellerId, onSuccess }: NewDuplicataFormProps) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<NovaDuplicataFormValues>({
    resolver: zodResolver(novaDuplicataFormSchema),
    defaultValues: createInitialNovaDuplicataValues(),
    mode: "onTouched",
  });
  const { isSubmitting } = form.formState;

  const [valor, dataEmissao, dataVencimento] = useWatch({
    control: form.control,
    name: ["valor", "dataEmissao", "dataVencimento"],
  });
  const simulacao = simularAntecipacao({ valor, dataEmissao, dataVencimento });

  async function handleValidSubmit(values: NovaDuplicataFormValues) {
    try {
      const created = await createDuplicata(sellerId, toNovaDuplicataPayload(values));
      toast.success("Duplicata enviada para análise", {
        description: `${created.numeroDuplicata} foi registrada e está aguardando análise.`,
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      console.error("Erro ao registrar duplicata:", err);
      toast.error("Erro ao enviar duplicata", {
        description: err instanceof Error ? err.message : "Erro desconhecido ao tentar registrar. Tente novamente.",
      });
    }
  }

  function handleInvalidSubmit() {
    toast.error("Formulário incompleto", {
      description: "Por favor, preencha todos os campos obrigatórios e marque o termo de declaração.",
    });
  }

  if (submitted) {
    return (
      <SuccessView
        title="Nota Registrada com Sucesso!"
        description="Sua duplicata foi registrada e enviada para análise. Um analista de risco da Dupply irá analisar os documentos anexados e enviar uma proposta em breve."
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

  return (
    <div className="grid gap-6 lg:grid-cols-3 items-start max-w-6xl w-full mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
          className="space-y-6 lg:col-span-2"
        >
          <XmlImportCard
            onImported={(parsed, fileName) =>
              form.reset(novaDuplicataValuesFromXml(parsed, fileName, form.getValues()))
            }
          />

          <TituloFields />
          <Separator />
          <SacadoFields />
          <Separator />
          <DocumentoFiscalFields />
          <Separator />
          <ComprovanteFields />
          <Separator />
          <AceiteAntecipacaoFields />
          <Separator />
          <DeclaracoesFields />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => form.reset(createDemoNovaDuplicataValues())}>
              Preencher automaticamente
            </Button>
            <div className="flex flex-wrap justify-end gap-2 sm:ml-auto">
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.seller.duplicatas.list)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar para análise"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
        <AntecipacaoSimulator simulacao={simulacao} />
      </div>
    </div>
  );
}
