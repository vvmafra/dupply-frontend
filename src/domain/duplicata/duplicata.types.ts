export type DuplicataTipo = "mercantil" | "servico";

export type DuplicataAceiteSacado = "aceito" | "pendente" | "recusado";

export type DuplicataComprovanteTipo = "entrega" | "aceite" | "prestacao_servico";

export type DuplicataFiscalTipo = "nfe" | "nfce" | "nfse" | "outro";

export type DuplicataAnaliseAnalista = "pendente" | "aprovado" | "reprovado";

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
