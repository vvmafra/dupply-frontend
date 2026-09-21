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
import { formatCurrencyBRL, formatPercent } from "@/lib/formatters";
import { TrendingDown, Info, Calendar, Calculator, FileUp, Sparkles, CheckCircle2 } from "lucide-react";
import type {
  DuplicataAceiteSacado,
  DuplicataComprovanteTipo,
  DuplicataFiscalTipo,
  DuplicataTipo,
} from "@/domain/duplicata/duplicata.types";

function parseXMLNotaFiscal(xmlText: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Helper to safely get tag content
  const getTagVal = (tagName: string, parent: ParentNode = xmlDoc) => {
    const el = parent.querySelector(tagName);
    return el ? el.textContent?.trim() ?? "" : "";
  };

  // Detect type (NFS-e vs NF-e)
  const isNfse = xmlDoc.getElementsByTagName("NFSe").length > 0 || xmlDoc.getElementsByTagName("infNFSe").length > 0;
  
  let tipo: DuplicataTipo = isNfse ? "servico" : "mercantil";
  let numeroDuplicata = "";
  let numeroFatura = "";
  let valor = 0;
  let dataEmissao = "";
  let dataVencimento = "";
  let sacadoCnpj = "";
  let sacadoRazaoSocial = "";
  let sacadoEmailFinanceiro = "";
  let documentoFiscalChave = "";
  let documentoFiscalTipo: DuplicataFiscalTipo = isNfse ? "nfse" : "nfe";

  if (isNfse) {
    numeroDuplicata = getTagVal("nNFSe");
    numeroFatura = getTagVal("nDPS") || numeroDuplicata;
    
    // Value: vLiq or vServ
    const valText = getTagVal("vLiq") || getTagVal("vServ") || "0";
    valor = Number.parseFloat(valText) || 0;

    // Date
    const dhEmiText = getTagVal("dhEmi") || getTagVal("dhProc") || getTagVal("dCompet");
    if (dhEmiText) {
      dataEmissao = dhEmiText.split("T")[0];
    }

    // Payer (Tomador)
    const tomaEl = xmlDoc.querySelector("toma");
    if (tomaEl) {
      sacadoCnpj = getTagVal("CNPJ", tomaEl);
      sacadoRazaoSocial = getTagVal("xNome", tomaEl);
      sacadoEmailFinanceiro = getTagVal("email", tomaEl);
    }

    // Key
    const infNFSeEl = xmlDoc.querySelector("infNFSe");
    if (infNFSeEl) {
      const idAttr = infNFSeEl.getAttribute("Id") ?? "";
      documentoFiscalChave = idAttr.replace("NFS", "");
    }
  } else {
    // NF-e
    numeroDuplicata = getTagVal("nNF");
    numeroFatura = getTagVal("nFat") || numeroDuplicata;

    const valText = getTagVal("vNF") || getTagVal("vProd") || "0";
    valor = Number.parseFloat(valText) || 0;

    const dhEmiText = getTagVal("dhEmi") || getTagVal("dEmi");
    if (dhEmiText) {
      dataEmissao = dhEmiText.split("T")[0];
    }

    // Payer (Destinatário)
    const destEl = xmlDoc.querySelector("dest");
    if (destEl) {
      sacadoCnpj = getTagVal("CNPJ", destEl);
      sacadoRazaoSocial = getTagVal("xNome", destEl);
      sacadoEmailFinanceiro = getTagVal("email", destEl);
    }

    const infNFeEl = xmlDoc.querySelector("infNFe");
    if (infNFeEl) {
      const idAttr = infNFeEl.getAttribute("Id") ?? "";
      documentoFiscalChave = idAttr.replace("NFe", "");
    }
  }

  // If data vencimento is not found, default to data emissao + 30 days
  if (dataEmissao) {
    const emDate = new Date(dataEmissao);
    emDate.setDate(emDate.getDate() + 30);
    dataVencimento = emDate.toISOString().split("T")[0];
  }

  return {
    tipo,
    numeroDuplicata,
    numeroFatura,
    valor,
    dataEmissao,
    dataVencimento,
    sacadoCnpj,
    sacadoRazaoSocial,
    sacadoEmailFinanceiro,
    documentoFiscalChave,
    documentoFiscalTipo,
  };
}

interface NewDuplicataFormProps {
  sellerId: string;
  onSuccess?: () => void;
}

export function NewDuplicataForm({ sellerId, onSuccess }: NewDuplicataFormProps) {
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
  const [fiscalFilename, setFiscalFilename] = useState("");
  const [comprovanteTipo, setComprovanteTipo] = useState<DuplicataComprovanteTipo>("entrega");
  const [comprovanteUploaded, setComprovanteUploaded] = useState(false);
  const [comprovanteFilename, setComprovanteFilename] = useState("");
  const [statusAceiteSacado, setStatusAceiteSacado] = useState<DuplicataAceiteSacado>("pendente");
  const [valorDesejadoAntecipacao, setValorDesejadoAntecipacao] = useState("");
  const [declaracoes, setDeclaracoes] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    setFiscalFilename(demo.fiscalUploaded ? "nota_fiscal_demo.pdf" : "");
    setComprovanteTipo(demo.comprovanteTipo);
    setComprovanteUploaded(demo.comprovanteUploaded);
    setComprovanteFilename(demo.comprovanteUploaded ? "comprovante_entrega_demo.pdf" : "");
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
    if (!validate()) {
      toast.error("Formulário incompleto", {
        description: "Por favor, preencha todos os campos obrigatórios e marque o termo de declaração.",
      });
      return;
    }
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
      setShowSuccessModal(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Erro ao registrar duplicata:", err);
      toast.error("Erro ao enviar duplicata", {
        description: err instanceof Error ? err.message : "Erro desconhecido ao tentar registrar. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleXmlUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xml")) {
      toast.error("Arquivo inválido", {
        description: "Por favor, selecione um arquivo no formato XML.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = parseXMLNotaFiscal(text);
        
        // Populate state values
        setTipo(parsed.tipo);
        setNumeroDuplicata(parsed.numeroDuplicata);
        setNumeroFatura(parsed.numeroFatura);
        setValor(parsed.valor.toString());
        setDataEmissao(parsed.dataEmissao);
        setDataVencimento(parsed.dataVencimento);
        setSacadoCnpj(parsed.sacadoCnpj);
        setSacadoRazaoSocial(parsed.sacadoRazaoSocial);
        setSacadoEmailFinanceiro(parsed.sacadoEmailFinanceiro);
        setDocumentoFiscalTipo(parsed.documentoFiscalTipo);
        setDocumentoFiscalChave(parsed.documentoFiscalChave);
        setFiscalUploaded(true);
        setFiscalFilename(file.name);
        setComprovanteUploaded(true);
        setComprovanteFilename(parsed.tipo === "servico" ? "comprovante_prestacao.pdf" : "comprovante_entrega.pdf");
        setComprovanteTipo(parsed.tipo === "servico" ? "prestacao_servico" : "entrega");
        setValorDesejadoAntecipacao(parsed.valor.toString());
        setErrors({});

        toast.success("XML Importado com sucesso!", {
          description: `Duplicata Nº ${parsed.numeroDuplicata} e dados do sacado importados.`,
        });
      } catch (err: any) {
        toast.error("Falha ao processar XML", {
          description: "Não foi possível extrair os dados da nota fiscal a partir deste arquivo.",
        });
      }
    };
    reader.readAsText(file);
  }

  // Simulação de deságio em tempo real
  const numericValor = Number.parseFloat(valor) || 0;
  const daysDiff = (() => {
    if (!dataEmissao || !dataVencimento) return 0;
    const start = new Date(dataEmissao);
    const end = new Date(dataVencimento);
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const monthlyRate = 0.022; // 2.2% ao mês
  const dailyRate = monthlyRate / 30;
  const serviceFeeRate = 0.005; // 0.5% tarifa de serviço flat

  const simulatedDesconto = numericValor * dailyRate * daysDiff;
  const simulatedTarifa = numericValor * serviceFeeRate;
  const simulatedLiquido = Math.max(0, numericValor - simulatedDesconto - simulatedTarifa);
  const costPercent = numericValor > 0 ? ((numericValor - simulatedLiquido) / numericValor) * 100 : 0;

  if (showSuccessModal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto w-full animate-in fade-in zoom-in-95 duration-300 py-12">
        <div className="w-full bg-card/60 border border-border shadow-2xl backdrop-blur-md rounded-2xl p-8 space-y-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15 text-success mx-auto shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-card-foreground">Nota Registrada com Sucesso!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua duplicata foi registrada e enviada para análise. Um analista de risco da Dupply irá analisar os documentos anexados e enviar uma proposta em breve.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              onClick={() => navigate(ROUTES.seller.duplicatas.list)}
              className="w-full font-medium h-10"
            >
              Ir para Minhas Duplicatas
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.seller.dashboard)}
              className="w-full font-medium h-10"
            >
              Ir para o Painel Principal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 items-start max-w-6xl w-full mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
        {/* Importação Rápida via XML */}
        <div className="relative group overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/15 text-primary shrink-0">
              <FileUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-semibold text-sm text-card-foreground">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                Importação Rápida via XML
              </div>
              <p className="text-xs text-muted-foreground leading-normal max-w-md">
                Arraste o arquivo XML da NF-e / NFS-e ou clique para selecionar. O preenchimento do formulário é automático.
              </p>
            </div>
            <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4">
              <input
                type="file"
                accept=".xml"
                className="hidden"
                onChange={handleXmlUpload}
              />
              Selecionar XML
            </label>
          </div>
        </div>

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
            filename={fiscalFilename}
            onChange={(uploaded, name) => {
              setFiscalUploaded(uploaded);
              setFiscalFilename(name || "");
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
            filename={comprovanteFilename}
            onChange={(uploaded, name) => {
              setComprovanteUploaded(uploaded);
              setComprovanteFilename(name || "");
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

      {/* Simulador de Antecipação Premium */}
      <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
        <div className="rounded-xl border bg-card/60 backdrop-blur-md p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Calculator className="w-5 h-5" />
            <h3 className="font-semibold text-card-foreground">Simulador de Taxas</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            Visualização prévia do valor a ser recebido com base no prazo e taxa média estimada.
          </p>

          <Separator />

          {numericValor > 0 && daysDiff > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Valor de Face</span>
                  <span className="font-medium font-mono">{formatCurrencyBRL(numericValor)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Prazo Estimado</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {daysDiff} {daysDiff === 1 ? "dia" : "dias"}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-destructive">
                  <span className="flex items-center gap-1">
                    Deságio Estimado
                    <span className="text-[10px] bg-destructive/10 px-1 py-0.5 rounded text-destructive font-mono">
                      2.2% a.m.
                    </span>
                  </span>
                  <span className="font-medium font-mono">-{formatCurrencyBRL(simulatedDesconto)}</span>
                </div>
                <div className="flex justify-between text-xs text-destructive">
                  <span className="flex items-center gap-1">
                    Tarifa de Serviço
                    <span className="text-[10px] bg-destructive/10 px-1 py-0.5 rounded text-destructive font-mono">
                      0.5% flat
                    </span>
                  </span>
                  <span className="font-medium font-mono">-{formatCurrencyBRL(simulatedTarifa)}</span>
                </div>
              </div>

              <Separator />

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-primary/70">
                  Líquido Estimado a Receber
                </div>
                <div className="text-2xl font-bold font-mono text-primary leading-none">
                  {formatCurrencyBRL(simulatedLiquido)}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1">
                  <TrendingDown className="w-3 h-3 text-destructive" />
                  Custo Efetivo Estimado: {formatPercent(costPercent, 2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <Info className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <p className="text-xs text-muted-foreground leading-relaxed px-4">
                Preencha o **Valor do Título** e a **Data de Vencimento** para habilitar o simulador em tempo real.
              </p>
            </div>
          )}

          <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground leading-normal flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
            <span>
              Os valores acima são estimativas de mercado. As taxas definitivas serão ofertadas pelo analista de risco da Dupply após a validação oficial do título.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
