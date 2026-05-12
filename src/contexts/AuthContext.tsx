import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthState, UserProfile } from "@/domain/auth/auth.types";

interface AuthContextValue extends AuthState {
  login: (email: string, name?: string) => void;
  logout: () => void;
  setProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    selectedProfile: null,
  });

  function login(email: string, name?: string) {
    setState({
      isAuthenticated: true,
      user: { id: "user-demo", email, name: name ?? email.split("@")[0], profile: "seller" },
      selectedProfile: null,
    });
  }

  function logout() {
    setState({ isAuthenticated: false, user: null, selectedProfile: null });
  }

  function setProfile(profile: UserProfile) {
    setState((prev) => ({ ...prev, selectedProfile: profile }));
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
