import type { UserProfile } from "./auth.types";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  platformRole: string;
};

/** Resposta normalizada pós-login — independente de mock ou HTTP */
export type AuthSession = {
  user: SessionUser;
};

/** Snapshot persistido além do token */
export type PersistedAuthSnapshot = {
  userId: string;
  email: string;
  platformRole: string;
  selectedProfile: UserProfile | null;
};

export type RestoredSession = {
  session: AuthSession;
  selectedProfile: UserProfile | null;
};
