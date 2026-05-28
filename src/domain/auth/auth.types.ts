import type { SessionUser } from "./auth-session.types";

export type UserProfile = "seller" | "admin" | "riskAnalyst";

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: SessionUser | null;
  selectedProfile: UserProfile | null;
}
