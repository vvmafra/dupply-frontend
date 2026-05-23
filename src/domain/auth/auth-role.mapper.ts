import type { UserProfile } from "./auth.types";

const ROLE_TO_PROFILES: Record<string, UserProfile[]> = {
  seller: ["seller"],
  admin: ["admin"],
  risk_analyst: ["riskAnalyst"],
  risk_analyst_agent: ["riskAnalyst"],
};

export class PayerPersonaUnavailableError extends Error {
  constructor() {
    super("Este tipo de acesso ainda não está disponível na plataforma.");
    this.name = "PayerPersonaUnavailableError";
  }
}

export class ProfileNotAvailableError extends Error {
  constructor() {
    super("Perfil não disponível");
    this.name = "ProfileNotAvailableError";
  }
}

export function mapPlatformRoleToProfiles(role: string): UserProfile[] {
  if (role === "payer") {
    return [];
  }

  const profiles = ROLE_TO_PROFILES[role];
  if (!profiles) {
    throw new ProfileNotAvailableError();
  }

  return profiles;
}

export function assertLoginAllowed(role: string): void {
  if (role === "payer") {
    throw new PayerPersonaUnavailableError();
  }

  mapPlatformRoleToProfiles(role);
}
