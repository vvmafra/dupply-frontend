import type { SessionUser } from "./auth-session.types";

export type { SessionUser } from "./auth-session.types";

export type UserProfile = "seller" | "admin" | "riskAnalyst";

/** @deprecated Use SessionUser — perfil ativo vive em selectedProfile */
export type MockUser = SessionUser;

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SessionUser | null;
  selectedProfile: UserProfile | null;
}
