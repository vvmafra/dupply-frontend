import { z } from "zod";
import { DUPLICATA_DEMO } from "@/data/duplicata-demo.mock";
import type { NovaDuplicataPayload } from "./duplicata.types";
import type { NotaFiscalParsed } from "./nfe-xml.parser";

function isNumeric(value: string): boolean {
  return value.trim().length > 0 && Number.isFinite(Number.parseFloat(value));
}

/**
 * Form schema for `NewDuplicataForm`. Values are kept as strings where the
 * input is text (valor, datas) and converted in `toNovaDuplicataPayload`.
 */
export const novaDuplicataFormSchema = z.object({
  tipo: z.enum(["mercantil", "servico"]),
  numeroDuplicata: z.string().trim().min(1, "Obrigatório"),
  numeroFatura: z.string().trim().min(1, "Obrigatório"),
  valor: z.string().refine(isNumeric, "Informe um valor válido"),
  dataEmissao: z.string().min(1, "Obrigatório"),
  dataVencimento: z.string().min(1, "Obrigatório"),
  sacadoCnpj: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 14, "CNPJ inválido"),
  sacadoRazaoSocial: z.string().trim().min(1, "Obrigatório"),
  sacadoEmailFinanceiro: z
    .string()
    .trim()
    .refine((value) => value.includes("@"), "E-mail inválido"),
  documentoFiscalTipo: z.enum(["nfe", "nfce", "nfse", "outro"]),
  documentoFiscalChave: z.string().trim().min(1, "Obrigatório"),
  fiscalUploaded: z.boolean().refine(Boolean, "Anexe o PDF ou XML do documento fiscal"),
  fiscalFilename: z.string(),
  comprovanteTipo: z.enum(["entrega", "aceite", "prestacao_servico"]),
  comprovanteUploaded: z.boolean().refine(Boolean, "Anexe o comprovante"),
  comprovanteFilename: z.string(),
  statusAceiteSacado: z.enum(["aceito", "pendente", "recusado"]),
  valorDesejadoAntecipacao: z.string().refine(isNumeric, "Informe o valor desejado"),
  declaracoes: z.boolean().refine(Boolean, "Aceite as declarações para continuar"),
});

export type NovaDuplicataFormValues = z.infer<typeof novaDuplicataFormSchema>;

export function createInitialNovaDuplicataValues(): NovaDuplicataFormValues {
  return {
    tipo: "mercantil",
    numeroDuplicata: "",
    numeroFatura: "",
    valor: "",
    dataEmissao: "",
    dataVencimento: "",
    sacadoCnpj: "",
    sacadoRazaoSocial: "",
    sacadoEmailFinanceiro: "",
    documentoFiscalTipo: "nfe",
    documentoFiscalChave: "",
    fiscalUploaded: false,
    fiscalFilename: "",
    comprovanteTipo: "entrega",
    comprovanteUploaded: false,
    comprovanteFilename: "",
    statusAceiteSacado: "pendente",
    valorDesejadoAntecipacao: "",
    declaracoes: false,
  };
}

/** Dados fixos só para demo/hackathon — evita preencher o formulário inteiro. */
export function createDemoNovaDuplicataValues(): NovaDuplicataFormValues {
  return {
    tipo: DUPLICATA_DEMO.tipo,
    numeroDuplicata: DUPLICATA_DEMO.numeroDuplicata,
    numeroFatura: DUPLICATA_DEMO.numeroFatura,
    valor: String(DUPLICATA_DEMO.valor),
    dataEmissao: DUPLICATA_DEMO.dataEmissao,
    dataVencimento: DUPLICATA_DEMO.dataVencimento,
    sacadoCnpj: DUPLICATA_DEMO.sacadoCnpj,
    sacadoRazaoSocial: DUPLICATA_DEMO.sacadoRazaoSocial,
    sacadoEmailFinanceiro: DUPLICATA_DEMO.sacadoEmailFinanceiro,
    documentoFiscalTipo: DUPLICATA_DEMO.documentoFiscalTipo,
    documentoFiscalChave: DUPLICATA_DEMO.documentoFiscalChave,
    fiscalUploaded: DUPLICATA_DEMO.documentoFiscalAnexado,
    fiscalFilename: DUPLICATA_DEMO.documentoFiscalAnexado ? "nota_fiscal_demo.pdf" : "",
    comprovanteTipo: DUPLICATA_DEMO.comprovanteTipo,
    comprovanteUploaded: DUPLICATA_DEMO.comprovanteAnexado,
    comprovanteFilename: DUPLICATA_DEMO.comprovanteAnexado ? "comprovante_entrega_demo.pdf" : "",
    statusAceiteSacado: DUPLICATA_DEMO.statusAceiteSacado,
    valorDesejadoAntecipacao: String(DUPLICATA_DEMO.valorDesejadoAntecipacao),
    declaracoes: DUPLICATA_DEMO.declaracoesAntifraudeAceitas,
  };
}

/** Form values pre-filled from an imported NF-e / NFS-e XML. */
export function novaDuplicataValuesFromXml(
  parsed: NotaFiscalParsed,
  fileName: string,
  current: NovaDuplicataFormValues,
): NovaDuplicataFormValues {
  const servico = parsed.tipo === "servico";
  return {
    ...current,
    tipo: parsed.tipo,
    numeroDuplicata: parsed.numeroDuplicata,
    numeroFatura: parsed.numeroFatura,
    valor: String(parsed.valor),
    dataEmissao: parsed.dataEmissao,
    dataVencimento: parsed.dataVencimento,
    sacadoCnpj: parsed.sacadoCnpj,
    sacadoRazaoSocial: parsed.sacadoRazaoSocial,
    sacadoEmailFinanceiro: parsed.sacadoEmailFinanceiro,
    documentoFiscalTipo: parsed.documentoFiscalTipo,
    documentoFiscalChave: parsed.documentoFiscalChave,
    fiscalUploaded: true,
    fiscalFilename: fileName,
    comprovanteTipo: servico ? "prestacao_servico" : "entrega",
    comprovanteUploaded: true,
    comprovanteFilename: servico ? "comprovante_prestacao.pdf" : "comprovante_entrega.pdf",
    valorDesejadoAntecipacao: String(parsed.valor),
  };
}

export function toNovaDuplicataPayload(values: NovaDuplicataFormValues): NovaDuplicataPayload {
  return {
    tipo: values.tipo,
    numeroDuplicata: values.numeroDuplicata.trim(),
    numeroFatura: values.numeroFatura.trim(),
    valor: Number.parseFloat(values.valor),
    dataEmissao: values.dataEmissao,
    dataVencimento: values.dataVencimento,
    sacadoCnpj: values.sacadoCnpj.trim(),
    sacadoRazaoSocial: values.sacadoRazaoSocial.trim(),
    sacadoEmailFinanceiro: values.sacadoEmailFinanceiro.trim(),
    documentoFiscalTipo: values.documentoFiscalTipo,
    documentoFiscalChave: values.documentoFiscalChave.trim(),
    documentoFiscalAnexado: values.fiscalUploaded,
    comprovanteTipo: values.comprovanteTipo,
    comprovanteAnexado: values.comprovanteUploaded,
    statusAceiteSacado: values.statusAceiteSacado,
    valorDesejadoAntecipacao: Number.parseFloat(values.valorDesejadoAntecipacao),
    declaracoesAntifraudeAceitas: values.declaracoes,
  };
}
