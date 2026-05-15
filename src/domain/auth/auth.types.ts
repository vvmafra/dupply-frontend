export type UserProfile = "seller" | "admin" | "riskAnalyst";

export interface MockUser {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: MockUser | null;
  selectedProfile: UserProfile | null;
}
