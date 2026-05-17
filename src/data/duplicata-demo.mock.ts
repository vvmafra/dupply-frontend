import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";
import type {
  DuplicataAceiteSacado,
  DuplicataComprovanteTipo,
  DuplicataFiscalTipo,
  DuplicataTipo,
} from "@/domain/duplicata/duplicata.types";

/** Dados canônicos da duplicata demo — usados no autofill, mocks e fluxos de aprovação. */
export const DUPLICATA_DEMO = {
  tipo: "mercantil" as DuplicataTipo,
  numeroDuplicata: "DUP-DEMO-8842",
  numeroFatura: "NF-2026-0018842",
  valor: 18500.75,
  dataEmissao: "2026-01-18",
  dataVencimento: "2026-05-18",
  sacadoCnpj: "33.444.555/0001-66",
  sacadoRazaoSocial: "Sacado Demo Ltda",
  sacadoEmailFinanceiro: "financeiro@sacadodemo.com.br",
  documentoFiscalTipo: "nfe" as DuplicataFiscalTipo,
  documentoFiscalChave: "35260112345678901234550010000001231234567890",
  documentoFiscalAnexado: true,
  comprovanteTipo: "entrega" as DuplicataComprovanteTipo,
  comprovanteAnexado: true,
  statusAceiteSacado: "pendente" as DuplicataAceiteSacado,
  valorDesejadoAntecipacao: 15000,
  declaracoesAntifraudeAceitas: true,
  scoreUsuario: 74,
  scoreDuplicata: 81,
  descontoAntecipacaoPercent: 2.8,
} as const;

export const DUPLICATA_DEMO_VALOR_LIQUIDO = calcValorLiquidoCedente(
  DUPLICATA_DEMO.valor,
  DUPLICATA_DEMO.descontoAntecipacaoPercent,
);

/** Valores em string para o formulário de cadastro (autofill). */
export function getDuplicataDemoAutofillFormValues() {
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
    comprovanteTipo: DUPLICATA_DEMO.comprovanteTipo,
    comprovanteUploaded: DUPLICATA_DEMO.comprovanteAnexado,
    statusAceiteSacado: DUPLICATA_DEMO.statusAceiteSacado,
    valorDesejadoAntecipacao: String(DUPLICATA_DEMO.valorDesejadoAntecipacao),
    declaracoes: DUPLICATA_DEMO.declaracoesAntifraudeAceitas,
  };
}
