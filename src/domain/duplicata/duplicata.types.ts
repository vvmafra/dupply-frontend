export type DuplicataTipo = "mercantil" | "servico";

export type DuplicataAceiteSacado = "aceito" | "pendente" | "recusado";

export type DuplicataComprovanteTipo = "entrega" | "aceite" | "prestacao_servico";

export type DuplicataFiscalTipo = "nfe" | "nfce" | "nfse" | "outro";

export type DuplicataAnaliseAnalista = "pendente" | "for_approval" | "aprovado" | "reprovado";

export interface DuplicataAiShareholder {
  name: string;
  percentage: number;
  role: string;
}

export interface DuplicataAiEntityPercentage {
  name: string;
  cnpj: string | null;
  percentage: number;
}

export interface DuplicataAiSwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface DuplicataAiFinancialMetrics {
  netRevenue: number;
  netResult: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  bankDebt: number;
}

export interface DuplicataAiReport {
  companyDescription: string;
  foundationYear: number;
  shareholders: DuplicataAiShareholder[];
  customerPortfolio: DuplicataAiEntityPercentage[];
  suppliers: DuplicataAiEntityPercentage[];
  swot: DuplicataAiSwot;
  financialAnalysis: string;
  financialMetrics: DuplicataAiFinancialMetrics;
}

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
  /** Taxa mensal ao investidor definida na oferta, fração (0.018 = 1,8% a.m.). */
  yieldRateMonthly?: number;
  /** Ticket mínimo por aporte em reais; 0 ou ausente = sem mínimo. */
  minInvestment?: number;
  /** Meta de captação (reais) — definida quando o admin abre a captação. */
  targetFunding?: number;
  /** Total já captado (reais). */
  funded?: number;
  /** Score simulado do cedente (0–100). */
  scoreUsuario: number;
  /** Score simulado da duplicata (0–100). */
  scoreDuplicata: number;
  /** Histórico de timestamps dos status da duplicata. */
  statusHistory?: Record<string, string>;
  /** Status cru do recebível no backend. */
  statusRecebivel?: string;
  aiReport?: DuplicataAiReport | null;
  aiReportPdfUrl?: string | null;
}

/** Termos da proposta do analista (`risk-decision` com `decision: "offer"`). */
export interface OfertaAntecipacaoTerms {
  /** Deságio sobre o valor de face (%). Define o `proposedValue`. */
  descontoPercent: number;
  /** Taxa mensal ao investidor, fração (0.018 = 1,8% a.m.). Opcional. */
  yieldRateMonthly?: number;
  /** Ticket mínimo por aporte em reais. Opcional. */
  minInvestment?: number;
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
