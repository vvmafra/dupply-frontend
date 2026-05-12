import type { ValidationStatus } from "@/domain/seller/seller.types";

export interface PlatformMetrics {
  totalCompanies: number;
  sellersInValidation: number;
  kycApproved: number;
  documentsPending: number;
  receivablesRegistered: number;
  receivablesUnderReview: number;
  receivablesApproved: number;
  receivablesFunded: number;
  receivablesSettled: number;
  receivablesDefaulted: number;
  totalVolume: number;
  fundedVolume: number;
}

export interface AdminValidationRow {
  id: string;
  sellerId: string;
  sellerName: string;
  companyName: string;
  contactEmail: string;
  taxId: string;
  validationStatus: ValidationStatus;
  documentsProgress: number;
  kycStatus: string;
  createdAt: string;
}
