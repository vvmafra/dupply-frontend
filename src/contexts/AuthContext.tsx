import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { AuthSession } from "@/domain/auth/auth-session.types";
import type { AuthState, UserProfile } from "@/domain/auth/auth.types";
import {
  logout as logoutFromService,
  persistSelectedProfile,
  restoreSession as restoreSessionFromService,
} from "@/services/auth.service";
import { setUnauthorizedHandler } from "@/lib/api-client";

const guestState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  selectedProfile: null,
};

interface AuthContextValue extends AuthState {
  loginWithSession: (session: AuthSession, selectedProfile?: UserProfile | null) => void;
  logout: (options?: { reason?: "manual" | "expired" }) => void;
  setProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(guestState);
  const logoutRef = useRef<(options?: { reason?: "manual" | "expired" }) => void>(() => {});

  const loginWithSession = useCallback(
    (session: AuthSession, selectedProfile: UserProfile | null = null) => {
      setState({
        isAuthenticated: true,
        isLoading: false,
        user: session.user,
        selectedProfile,
      });
    },
    [],
  );

  const logout = useCallback((options?: { reason?: "manual" | "expired" }) => {
    void logoutFromService();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      selectedProfile: null,
    });

    if (options?.reason === "expired") {
      toast.error("Sessão expirada");
    }
  }, []);

  logoutRef.current = logout;

  const setProfile = useCallback((profile: UserProfile) => {
    setState((prev) => ({ ...prev, selectedProfile: profile }));
    void persistSelectedProfile(profile);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const restored = await restoreSessionFromService();
      if (cancelled) return;

      if (restored) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: restored.session.user,
          selectedProfile: restored.selectedProfile,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logoutRef.current({ reason: "expired" });
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, loginWithSession, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
