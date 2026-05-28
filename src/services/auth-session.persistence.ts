import { setAccessToken, setAuthSnapshot } from "@/lib/token-storage";
import type { AuthSession, PersistedAuthSnapshot } from "@/domain/auth/auth-session.types";
import type { UserProfile } from "@/domain/auth/auth.types";
import { buildSessionFromLogin } from "@/domain/auth/auth-jwt";
import type { AuthTokenResponseDTO } from "./auth.dto";

export function buildAuthSnapshot(
  session: AuthSession,
  selectedProfile: UserProfile | null = null,
): PersistedAuthSnapshot {
  return {
    userId: session.user.id,
    email: session.user.email,
    platformRole: session.user.platformRole,
    selectedProfile,
  };
}

export function mapTokenResponseToSession(
  email: string,
  dto: Pick<AuthTokenResponseDTO, "accessToken">,
): AuthSession {
  return buildSessionFromLogin(email, dto.accessToken);
}

export function persistAuthSession(
  accessToken: string,
  session: AuthSession,
  selectedProfile: UserProfile | null = null,
): void {
  setAccessToken(accessToken);
  setAuthSnapshot(buildAuthSnapshot(session, selectedProfile));
}
