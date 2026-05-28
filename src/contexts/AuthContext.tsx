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
import { INACTIVE_SELLER_REJECTION_MESSAGE } from "@/domain/seller/seller-registration.routing";
import { resolveApiMode } from "@/lib/env";
import { setUnauthorizedHandler } from "@/lib/api-client";
import {
  logout as logoutFromService,
  persistSelectedProfile,
  restoreSession as restoreSessionFromService,
  takeRestoreBlockReason,
} from "@/services/auth.service";
import { fetchSellerBackendStatus } from "@/services/seller-registration.service";

const ACCOUNT_INACTIVE_MESSAGE = "Sua conta está inativa. Entre em contato com o suporte.";

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
        if (
          resolveApiMode() === "http" &&
          restored.session.user.platformRole === "seller"
        ) {
          try {
            const status = await fetchSellerBackendStatus();
            if (status === "inactive") {
              await logoutFromService();
              toast.error(INACTIVE_SELLER_REJECTION_MESSAGE);
              setState({ ...guestState, isLoading: false });
              return;
            }

            setState({
              isAuthenticated: true,
              isLoading: false,
              user: restored.session.user,
              selectedProfile: restored.selectedProfile ?? "seller",
            });
            return;
          } catch {
            setState({
              isAuthenticated: true,
              isLoading: false,
              user: restored.session.user,
              selectedProfile: restored.selectedProfile ?? "seller",
            });
            toast.error("Não foi possível validar seu cadastro. Tentando novamente...");
            return;
          }
        }

        setState({
          isAuthenticated: true,
          isLoading: false,
          user: restored.session.user,
          selectedProfile: restored.selectedProfile,
        });
      } else {
        const blockReason = takeRestoreBlockReason();
        if (blockReason === "account_inactive") {
          toast.error(ACCOUNT_INACTIVE_MESSAGE);
        }
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
