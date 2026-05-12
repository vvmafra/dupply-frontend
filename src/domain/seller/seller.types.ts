export type ValidationStatus =
  | "NOT_STARTED"
  | "DOCUMENTS_PENDING"
  | "KYC_PENDING"
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
  createdAt: string;
}

export interface ValidationStep {
  id: number;
  label: string;
  description: string;
  completed: boolean;
}
