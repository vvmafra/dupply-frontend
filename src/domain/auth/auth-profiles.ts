import type { UserProfile } from "./auth.types";
import { mapPlatformRoleToProfiles } from "./auth-role.mapper";

export const MOCK_DEMO_PROFILES: UserProfile[] = ["seller", "admin", "riskAnalyst", "investor"];

export function getAvailableProfiles(platformRole: string): UserProfile[] {
  return mapPlatformRoleToProfiles(platformRole);
}

export function shouldAutoSelectProfile(profiles: UserProfile[]): UserProfile | null {
  return profiles.length === 1 ? profiles[0]! : null;
}
