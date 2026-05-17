export type DuplicataTipo = "mercantil" | "servico";

export type DuplicataAceiteSacado = "aceito" | "pendente" | "recusado";

export type DuplicataComprovanteTipo = "entrega" | "aceite" | "prestacao_servico";

export type DuplicataFiscalTipo = "nfe" | "nfce" | "nfse" | "outro";

export type DuplicataAnaliseAnalista = "pendente" | "for_approval" | "aprovado" | "reprovado";

export interface DuplicataTitulo {
  id: string;
  sellerId: string;
  sellerName: string;
  tipo: DuplicataTipo;
  numeroDuplicata: string;
  numeroFatura: string;
  valor: number;
  dataEmissao: string;
  dataVencimento: string;
  sacadoCnpj: string;
  sacadoRazaoSocial: string;
  sacadoEmailFinanceiro: string;
  documentoFiscalTipo: DuplicataFiscalTipo;
  documentoFiscalChave: string;
  documentoFiscalAnexado: boolean;
  comprovanteTipo: DuplicataComprovanteTipo;
  comprovanteAnexado: boolean;
  statusAceiteSacado: DuplicataAceiteSacado;
  valorDesejadoAntecipacao: number;
  declaracoesAntifraudeAceitas: boolean;
  enviadoEm: string;
  analiseAnalista: DuplicataAnaliseAnalista;
  /** Desconto sugerido pelo analista (%), quando aguardando aprovação do cedente. */
  descontoAntecipacaoPercent?: number;
  /** Valor líquido sugerido para o cedente, quando aguardando aprovação. */
  valorLiquidoAntecipacao?: number;
  /** Score simulado do cedente (0–100). */
  scoreUsuario: number;
  /** Score simulado da duplicata (0–100). */
  scoreDuplicata: number;
}

export interface NovaDuplicataPayload {
  tipo: DuplicataTipo;
  numeroDuplicata: string;
  numeroFatura: string;
  valor: number;
  dataEmissao: string;
  dataVencimento: string;
  sacadoCnpj: string;
  sacadoRazaoSocial: string;
  sacadoEmailFinanceiro: string;
  documentoFiscalTipo: DuplicataFiscalTipo;
  documentoFiscalChave: string;
  documentoFiscalAnexado: boolean;
  comprovanteTipo: DuplicataComprovanteTipo;
  comprovanteAnexado: boolean;
  statusAceiteSacado: DuplicataAceiteSacado;
  valorDesejadoAntecipacao: number;
  declaracoesAntifraudeAceitas: boolean;
}
