export type ValidationStatus =
  | "NOT_STARTED"
  | "DOCUMENTS_PENDING"
  | "KYC_PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

/** Liberação explícita do analista para o cedente enviar duplicatas na plataforma. */
export type AnalystDuplicatasAccessStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface SellerCompany {
  id: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  representativeName: string;
  representativeCpf: string;
  validationStatus: ValidationStatus;
  documentsProgress: number;
  kycStatus: "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";
  onboardingStep: number;
  /** Aprovado pelo analista de risco — necessário para cadastrar duplicatas. */
  analystDuplicatasAccess: AnalystDuplicatasAccessStatus;
  createdAt: string;
}

export interface ValidationStep {
  id: number;
  label: string;
  description: string;
  completed: boolean;
}
