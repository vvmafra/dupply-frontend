import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FormSection } from "@/components/forms/FormSection";
import { RegistrationUploadField } from "@/components/forms/RegistrationUploadField";
import { createDuplicata } from "@/services/duplicata.service";
import { ROUTES } from "@/lib/routes";
import { getDuplicataDemoAutofillFormValues } from "@/data/duplicata-demo.mock";
import type {
  DuplicataAceiteSacado,
  DuplicataComprovanteTipo,
  DuplicataFiscalTipo,
  DuplicataTipo,
} from "@/domain/duplicata/duplicata.types";

interface NewDuplicataFormProps {
  sellerId: string;
}

export function NewDuplicataForm({ sellerId }: NewDuplicataFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [tipo, setTipo] = useState<DuplicataTipo>("mercantil");
  const [numeroDuplicata, setNumeroDuplicata] = useState("");
  const [numeroFatura, setNumeroFatura] = useState("");
  const [valor, setValor] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [sacadoCnpj, setSacadoCnpj] = useState("");
  const [sacadoRazaoSocial, setSacadoRazaoSocial] = useState("");
  const [sacadoEmailFinanceiro, setSacadoEmailFinanceiro] = useState("");
  const [documentoFiscalTipo, setDocumentoFiscalTipo] = useState<DuplicataFiscalTipo>("nfe");
  const [documentoFiscalChave, setDocumentoFiscalChave] = useState("");
  const [fiscalUploaded, setFiscalUploaded] = useState(false);
  const [comprovanteTipo, setComprovanteTipo] = useState<DuplicataComprovanteTipo>("entrega");
  const [comprovanteUploaded, setComprovanteUploaded] = useState(false);
  const [statusAceiteSacado, setStatusAceiteSacado] = useState<DuplicataAceiteSacado>("pendente");
  const [valorDesejadoAntecipacao, setValorDesejadoAntecipacao] = useState("");
  const [declaracoes, setDeclaracoes] = useState(false);

  function clearFieldError(key: string) {
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  /** Dados fixos só para demo/hackathon — evita preencher o formulário inteiro. */
  function fillDemoData() {
    const demo = getDuplicataDemoAutofillFormValues();
    setTipo(demo.tipo);
    setNumeroDuplicata(demo.numeroDuplicata);
    setNumeroFatura(demo.numeroFatura);
    setValor(demo.valor);
    setDataEmissao(demo.dataEmissao);
    setDataVencimento(demo.dataVencimento);
    setSacadoCnpj(demo.sacadoCnpj);
    setSacadoRazaoSocial(demo.sacadoRazaoSocial);
    setSacadoEmailFinanceiro(demo.sacadoEmailFinanceiro);
    setDocumentoFiscalTipo(demo.documentoFiscalTipo);
    setDocumentoFiscalChave(demo.documentoFiscalChave);
    setFiscalUploaded(demo.fiscalUploaded);
    setComprovanteTipo(demo.comprovanteTipo);
    setComprovanteUploaded(demo.comprovanteUploaded);
    setStatusAceiteSacado(demo.statusAceiteSacado);
    setValorDesejadoAntecipacao(demo.valorDesejadoAntecipacao);
    setDeclaracoes(demo.declaracoes);
    setErrors({});
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!numeroDuplicata.trim()) e.numeroDuplicata = "Obrigatório";
    if (!numeroFatura.trim()) e.numeroFatura = "Obrigatório";
    if (!valor || Number.isNaN(Number.parseFloat(valor))) e.valor = "Informe um valor válido";
    if (!dataEmissao) e.dataEmissao = "Obrigatório";
    if (!dataVencimento) e.dataVencimento = "Obrigatório";
    if (!sacadoCnpj.trim() || sacadoCnpj.replace(/\D/g, "").length < 14) e.sacadoCnpj = "CNPJ inválido";
    if (!sacadoRazaoSocial.trim()) e.sacadoRazaoSocial = "Obrigatório";
    if (!sacadoEmailFinanceiro.includes("@")) e.sacadoEmailFinanceiro = "E-mail inválido";
    if (!documentoFiscalChave.trim()) e.documentoFiscalChave = "Obrigatório";
    if (!fiscalUploaded) e.fiscal = "Anexe o PDF ou XML do documento fiscal";
    if (!comprovanteUploaded) e.comprovante = "Anexe o comprovante";
    if (!valorDesejadoAntecipacao || Number.isNaN(Number.parseFloat(valorDesejadoAntecipacao))) {
      e.valorDesejadoAntecipacao = "Informe o valor desejado";
    }
    if (!declaracoes) e.declaracoes = "Aceite as declarações para continuar";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const created = await createDuplicata(sellerId, {
        tipo,
        numeroDuplicata: numeroDuplicata.trim(),
        numeroFatura: numeroFatura.trim(),
        valor: Number.parseFloat(valor),
        dataEmissao,
        dataVencimento,
        sacadoCnpj: sacadoCnpj.trim(),
        sacadoRazaoSocial: sacadoRazaoSocial.trim(),
        sacadoEmailFinanceiro: sacadoEmailFinanceiro.trim(),
        documentoFiscalTipo,
        documentoFiscalChave: documentoFiscalChave.trim(),
        documentoFiscalAnexado: fiscalUploaded,
        comprovanteTipo,
        comprovanteAnexado: comprovanteUploaded,
        statusAceiteSacado,
        valorDesejadoAntecipacao: Number.parseFloat(valorDesejadoAntecipacao),
        declaracoesAntifraudeAceitas: declaracoes,
      });
      toast.success("Duplicata enviada para análise", {
        description: `${created.numeroDuplicata} foi registrada e está aguardando análise.`,
      });
      navigate(ROUTES.seller.duplicatas.list);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <FormSection title="Título" description="Identificação da duplicata (versão hackathon).">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Tipo <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === "mercantil"}
                  onChange={() => {
                    setTipo("mercantil");
                    clearFieldError("tipo");
                  }}
                />
                Mercantil
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === "servico"}
                  onChange={() => {
                    setTipo("servico");
                    clearFieldError("tipo");
                  }}
                />
                Serviço
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numeroDuplicata">Número da duplicata <span className="text-destructive">*</span></Label>
            <Input
              id="numeroDuplicata"
              value={numeroDuplicata}
              onChange={(e) => {
                setNumeroDuplicata(e.target.value);
                clearFieldError("numeroDuplicata");
              }}
              aria-invalid={!!errors.numeroDuplicata}
            />
            {errors.numeroDuplicata && <p className="text-xs text-destructive">{errors.numeroDuplicata}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numeroFatura">Número da fatura <span className="text-destructive">*</span></Label>
            <Input
              id="numeroFatura"
              value={numeroFatura}
              onChange={(e) => {
                setNumeroFatura(e.target.value);
                clearFieldError("numeroFatura");
              }}
              aria-invalid={!!errors.numeroFatura}
            />
            {errors.numeroFatura && <p className="text-xs text-destructive">{errors.numeroFatura}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="valor">Valor (R$) <span className="text-destructive">*</span></Label>
            <Input
              id="valor"
              type="number"
              value={valor}
              onChange={(e) => {
                setValor(e.target.value);
                clearFieldError("valor");
              }}
              aria-invalid={!!errors.valor}
            />
            {errors.valor && <p className="text-xs text-destructive">{errors.valor}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataEmissao">Data de emissão <span className="text-destructive">*</span></Label>
            <Input
              id="dataEmissao"
              type="date"
              value={dataEmissao}
              onChange={(e) => {
                setDataEmissao(e.target.value);
                clearFieldError("dataEmissao");
              }}
              aria-invalid={!!errors.dataEmissao}
            />
            {errors.dataEmissao && <p className="text-xs text-destructive">{errors.dataEmissao}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dataVencimento">Data de vencimento <span className="text-destructive">*</span></Label>
            <Input
              id="dataVencimento"
              type="date"
              value={dataVencimento}
              onChange={(e) => {
                setDataVencimento(e.target.value);
                clearFieldError("dataVencimento");
              }}
              aria-invalid={!!errors.dataVencimento}
            />
            {errors.dataVencimento && <p className="text-xs text-destructive">{errors.dataVencimento}</p>}
          </div>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Sacado" description="Dados do devedor para cobrança.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sacadoCnpj">CNPJ <span className="text-destructive">*</span></Label>
            <Input
              id="sacadoCnpj"
              placeholder="00.000.000/0000-00"
              value={sacadoCnpj}
              onChange={(e) => {
                setSacadoCnpj(e.target.value);
                clearFieldError("sacadoCnpj");
              }}
              aria-invalid={!!errors.sacadoCnpj}
            />
            {errors.sacadoCnpj && <p className="text-xs text-destructive">{errors.sacadoCnpj}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sacadoRazaoSocial">Razão social <span className="text-destructive">*</span></Label>
            <Input
              id="sacadoRazaoSocial"
              value={sacadoRazaoSocial}
              onChange={(e) => {
                setSacadoRazaoSocial(e.target.value);
                clearFieldError("sacadoRazaoSocial");
              }}
              aria-invalid={!!errors.sacadoRazaoSocial}
            />
            {errors.sacadoRazaoSocial && <p className="text-xs text-destructive">{errors.sacadoRazaoSocial}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="sacadoEmailFinanceiro">E-mail financeiro <span className="text-destructive">*</span></Label>
            <Input
              id="sacadoEmailFinanceiro"
              type="email"
              placeholder="financeiro@sacado.com.br"
              value={sacadoEmailFinanceiro}
              onChange={(e) => {
                setSacadoEmailFinanceiro(e.target.value);
                clearFieldError("sacadoEmailFinanceiro");
              }}
              aria-invalid={!!errors.sacadoEmailFinanceiro}
            />
            {errors.sacadoEmailFinanceiro && (
              <p className="text-xs text-destructive">{errors.sacadoEmailFinanceiro}</p>
            )}
          </div>
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Documento fiscal" description="Tipo, chave e anexo (PDF ou XML simulado).">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="documentoFiscalTipo">Tipo do documento <span className="text-destructive">*</span></Label>
            <select
              id="documentoFiscalTipo"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={documentoFiscalTipo}
              onChange={(e) => setDocumentoFiscalTipo(e.target.value as DuplicataFiscalTipo)}
            >
              <option value="nfe">NF-e</option>
              <option value="nfce">NFC-e</option>
              <option value="nfse">NFS-e</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="documentoFiscalChave">Número / chave de acesso <span className="text-destructive">*</span></Label>
            <Input
              id="documentoFiscalChave"
              value={documentoFiscalChave}
              onChange={(e) => {
                setDocumentoFiscalChave(e.target.value);
                clearFieldError("documentoFiscalChave");
              }}
              aria-invalid={!!errors.documentoFiscalChave}
            />
            {errors.documentoFiscalChave && (
              <p className="text-xs text-destructive">{errors.documentoFiscalChave}</p>
            )}
          </div>
        </div>
        <RegistrationUploadField
          label="Arquivo fiscal (PDF ou XML)"
          required
          value={fiscalUploaded}
          onChange={(uploaded) => {
            setFiscalUploaded(uploaded);
            clearFieldError("fiscal");
          }}
        />
        {errors.fiscal && <p className="text-xs text-destructive">{errors.fiscal}</p>}
      </FormSection>

      <Separator />

      <FormSection title="Comprovante" description="Entrega, aceite ou prestação de serviço.">
        <div className="space-y-1.5">
          <Label htmlFor="comprovanteTipo">Tipo de comprovante <span className="text-destructive">*</span></Label>
          <select
            id="comprovanteTipo"
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={comprovanteTipo}
            onChange={(e) => setComprovanteTipo(e.target.value as DuplicataComprovanteTipo)}
          >
            <option value="entrega">Entrega</option>
            <option value="aceite">Aceite</option>
            <option value="prestacao_servico">Prestação de serviço</option>
          </select>
        </div>
        <RegistrationUploadField
          label="Comprovante (entrega, aceite ou prestação)"
          required
          value={comprovanteUploaded}
          onChange={(uploaded) => {
            setComprovanteUploaded(uploaded);
            clearFieldError("comprovante");
          }}
        />
        {errors.comprovante && <p className="text-xs text-destructive">{errors.comprovante}</p>}
      </FormSection>

      <Separator />

      <FormSection title="Aceite e antecipação" description="Status perante o sacado e valor pretendido.">
        <div className="space-y-1.5">
          <Label htmlFor="statusAceite">Status do aceite (sacado) <span className="text-destructive">*</span></Label>
          <select
            id="statusAceite"
            className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={statusAceiteSacado}
            onChange={(e) => setStatusAceiteSacado(e.target.value as DuplicataAceiteSacado)}
          >
            <option value="aceito">Aceito</option>
            <option value="pendente">Pendente</option>
            <option value="recusado">Recusado</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valorDesejado">Valor desejado para antecipação (R$) <span className="text-destructive">*</span></Label>
          <Input
            id="valorDesejado"
            type="number"
            value={valorDesejadoAntecipacao}
            onChange={(e) => {
              setValorDesejadoAntecipacao(e.target.value);
              clearFieldError("valorDesejadoAntecipacao");
            }}
            aria-invalid={!!errors.valorDesejadoAntecipacao}
          />
          {errors.valorDesejadoAntecipacao && (
            <p className="text-xs text-destructive">{errors.valorDesejadoAntecipacao}</p>
          )}
        </div>
      </FormSection>

      <Separator />

      <FormSection title="Declarações antifraude" description="Confirmações para envio à análise.">
        <div className="flex items-start gap-2">
          <Checkbox
            id="decl"
            checked={declaracoes}
            onCheckedChange={(c) => {
              setDeclaracoes(c === true);
              clearFieldError("declaracoes");
            }}
            className="mt-0.5"
          />
          <Label htmlFor="decl" className="text-sm font-normal leading-relaxed cursor-pointer">
            Declaro que as informações são verdadeiras, que os documentos são autênticos e que não há fraude ou
            duplicidade nesta operação, estando ciente das sanções legais em caso de declaração falsa.
          </Label>
        </div>
        {errors.declaracoes && <p className="text-xs text-destructive">{errors.declaracoes}</p>}
      </FormSection>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={fillDemoData}>
          Preencher automaticamente
        </Button>
        <div className="flex flex-wrap justify-end gap-2 sm:ml-auto">
          <Button type="button" variant="outline" onClick={() => navigate(ROUTES.seller.duplicatas.list)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar para análise"}
          </Button>
        </div>
      </div>
    </form>
  );
}
