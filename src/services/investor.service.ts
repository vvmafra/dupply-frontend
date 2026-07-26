import { MOCK_INVESTOR_PROFILES } from "@/data/investors.mock";
import type { InvestorKycStatus, InvestorProfile } from "@/domain/investor/investor.types";
import { sleep } from "@/lib/utils";

function cloneProfile(profile: InvestorProfile): InvestorProfile {
  return { ...profile };
}

function ensureProfile(userId: string, fallbackEmail?: string, fallbackName?: string): InvestorProfile {
  let profile = MOCK_INVESTOR_PROFILES.find((p) => p.userId === userId);
  if (!profile) {
    profile = {
      userId,
      fullName: fallbackName ?? "Investidor",
      email: fallbackEmail ?? `${userId}@dupply.com`,
      personType: "PF",
      document: "00000000000",
      phone: "11000000000",
      kycStatus: "PENDING",
      suitability: "moderate",
      createdAt: new Date().toISOString(),
    };
    MOCK_INVESTOR_PROFILES.push(profile);
  }
  return profile;
}

export async function fetchInvestorProfile(
  userId: string,
  opts?: { email?: string; name?: string }
): Promise<InvestorProfile> {
  await sleep(300);
  const profile = ensureProfile(userId, opts?.email, opts?.name);
  if (opts?.email) profile.email = opts.email;
  if (opts?.name?.trim() && opts.name !== opts.email?.split("@")[0]) {
    profile.fullName = opts.name;
  }
  return cloneProfile(profile);
}

export async function updateInvestorKycStatus(
  userId: string,
  kycStatus: InvestorKycStatus
): Promise<InvestorProfile> {
  await sleep(400);
  const profile = ensureProfile(userId);
  profile.kycStatus = kycStatus;
  return cloneProfile(profile);
}

export function isInvestorKycApproved(profile: InvestorProfile | null | undefined): boolean {
  return profile?.kycStatus === "APPROVED";
}
