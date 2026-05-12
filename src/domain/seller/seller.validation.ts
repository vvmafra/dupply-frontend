import type { ValidationStatus } from "./seller.types";

export const VALIDATION_STATUS_LABELS: Record<ValidationStatus, string> = {
  NOT_STARTED: "Não iniciado",
  DOCUMENTS_PENDING: "Documentos pendentes",
  KYC_PENDING: "KYC pendente",
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
};

export function getValidationStatusLabel(status: ValidationStatus): string {
  return VALIDATION_STATUS_LABELS[status];
}

export function getValidationStatusColor(status: ValidationStatus): string {
  const colors: Record<ValidationStatus, string> = {
    NOT_STARTED: "text-muted-foreground bg-muted",
    DOCUMENTS_PENDING: "text-warning bg-warning/20",
    KYC_PENDING: "text-warning bg-warning/20",
    UNDER_REVIEW: "text-info bg-info/20",
    APPROVED: "text-success bg-success/20",
    REJECTED: "text-destructive bg-destructive/20",
  };
  return colors[status];
}

export const REQUIRED_DOCUMENTS = [
  {
    id: "contrato-social",
    name: "Contrato Social Consolidado ou Certificado CCMEI",
    description: "Documento constitutivo da empresa atualizado.",
    required: true,
  },
  {
    id: "cartao-cnpj",
    name: "Cartão CNPJ",
    description: "Comprovante de inscrição no CNPJ.",
    required: true,
  },
  {
    id: "certidao-teor",
    name: "Certidão de Inteiro Teor ou Simplificada",
    description: "Emitida pela Junta Comercial.",
    required: true,
  },
  {
    id: "comprovante-empresa",
    name: "Comprovante de Endereço da Empresa",
    description: "Emitido nos últimos 60 dias.",
    required: true,
  },
  {
    id: "comprovante-socios",
    name: "Comprovante de Endereço dos Sócios",
    description: "Emitido nos últimos 60 dias.",
    required: true,
  },
  {
    id: "faturamento",
    name: "Faturamento Acumulado",
    description: "Assinado pelo contador responsável.",
    required: true,
  },
  {
    id: "balancete",
    name: "Balancete Mensal",
    description: "Último balancete mensal disponível.",
    required: true,
  },
  {
    id: "dre",
    name: "DRE dos últimos 12 meses",
    description: "Demonstrativo de Resultado do Exercício.",
    required: true,
  },
  {
    id: "declaracao-credito",
    name: "Declaração de Crédito do Cedente",
    description: "Declaração de regularidade de crédito.",
    required: true,
  },
  {
    id: "doc-representantes",
    name: "Documento de Identificação dos Representantes",
    description: "RG ou CNH do(s) representante(s) legal(is).",
    required: true,
  },
  {
    id: "clientes-fornecedores",
    name: "5 Principais Clientes e Fornecedores",
    description: "Lista com razão social, CNPJ e volume médio.",
    required: true,
  },
  {
    id: "devedor-solidario",
    name: "Documento de Identificação do Devedor Solidário",
    description: "Apenas se houver devedor solidário.",
    required: false,
  },
  {
    id: "procuracao",
    name: "Procuração",
    description: "Se aplicável.",
    required: false,
  },
  {
    id: "certidao-casamento",
    name: "Certidão de Casamento",
    description: "Se aplicável aos sócios.",
    required: false,
  },
  {
    id: "extrato-endividamento",
    name: "Extrato de Endividamento Bancário",
    description: "Caso possua financiamentos ativos.",
    required: false,
  },
];
