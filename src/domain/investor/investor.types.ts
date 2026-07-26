export type InvestorKycStatus = "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";

export type InvestorPersonType = "PF" | "PJ";

export type InvestorSuitability = "conservative" | "moderate" | "aggressive";

export type InvestorProfile = {
  userId: string;
  fullName: string;
  email: string;
  personType: InvestorPersonType;
  /** Document digits only (masked in UI) */
  document: string;
  phone: string;
  kycStatus: InvestorKycStatus;
  suitability: InvestorSuitability;
  createdAt: string;
};
