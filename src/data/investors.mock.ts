import type { InvestorProfile } from "@/domain/investor/investor.types";

/** In-memory investor profiles keyed by session user id */
export const MOCK_INVESTOR_PROFILES: InvestorProfile[] = [
  {
    userId: "user-demo",
    fullName: "Demo Investidor",
    email: "demo@dupply.com",
    personType: "PF",
    document: "52998224725",
    phone: "11987654321",
    // PENDING so the demo can show KYC gate → approve → invest
    kycStatus: "PENDING",
    suitability: "moderate",
    balance: 1000000,
    createdAt: "2026-06-01T12:00:00.000Z",
  },
  {
    userId: "user-investor-demo",
    fullName: "Investidor Demo",
    email: "investor@dupply.com",
    personType: "PJ",
    document: "12345678000199",
    phone: "1133334444",
    kycStatus: "APPROVED",
    suitability: "aggressive",
    balance: 250000,
    createdAt: "2026-05-15T09:30:00.000Z",
  },
];
