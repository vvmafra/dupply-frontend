import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import type { SellerCompany } from "@/domain/seller/seller.types";
import type { SellerLifecycleStatus } from "@/domain/seller/seller-registration.routing";
import { requiresWalletSetup } from "@/domain/wallet/wallet-gating";
import { useAuth } from "@/contexts/AuthContext";
import { resolveApiMode } from "@/lib/env";
import { ROUTES } from "@/lib/routes";
import { fetchCurrentSellerWithStatus } from "@/services/seller.service";
import { fetchSellerBackendStatus } from "@/services/seller-registration.service";

export type SellerContextState = {
  lifecycleStatus: SellerLifecycleStatus | null;
  seller: SellerCompany | null;
  isLoading: boolean;
  fetchError: string | null;
};

export type SellerRefreshResult = {
  status: SellerLifecycleStatus;
  walletId: string | null;
};

export type SellerContextValue = SellerContextState & {
  refreshSeller: () => Promise<SellerRefreshResult | null>;
  refreshSellerStatus: () => Promise<SellerLifecycleStatus | null>;
};

const noopSellerContext: SellerContextValue = {
  lifecycleStatus: null,
  seller: null,
  isLoading: false,
  fetchError: null,
  refreshSeller: async () => null,
  refreshSellerStatus: async () => null,
};

const SellerContext = createContext<SellerContextValue | null>(null);

function isActiveSellerSession(
  isAuthenticated: boolean,
  selectedProfile: string | null,
): boolean {
  return (
    resolveApiMode() === "http" &&
    isAuthenticated &&
    selectedProfile === "seller"
  );
}

function SellerContextProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, selectedProfile } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<SellerContextState>({
    lifecycleStatus: null,
    seller: null,
    isLoading: false,
    fetchError: null,
  });
  const lifecycleStatusRef = useRef<SellerLifecycleStatus | null>(null);

  useEffect(() => {
    lifecycleStatusRef.current = state.lifecycleStatus;
  }, [state.lifecycleStatus]);

  const refreshSeller = useCallback(async (): Promise<SellerRefreshResult | null> => {
    setState((prev) => ({ ...prev, isLoading: true, fetchError: null }));

    try {
      const { seller, status } = await fetchCurrentSellerWithStatus();
      lifecycleStatusRef.current = status;
      setState({
        lifecycleStatus: status,
        seller,
        isLoading: false,
        fetchError: null,
      });

      if (status === "created") {
        navigate(ROUTES.sellerRegistration, { replace: true });
        return { status, walletId: seller.walletId };
      }

      if (requiresWalletSetup(status, seller.walletId)) {
        navigate(ROUTES.seller.walletSetup, { replace: true });
      }

      return { status, walletId: seller.walletId };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados do vendedor.";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        fetchError: message,
      }));
      return null;
    }
  }, [navigate]);

  const refreshSellerStatus = useCallback(async (): Promise<SellerLifecycleStatus | null> => {
    try {
      const status = await fetchSellerBackendStatus();
      if (status !== lifecycleStatusRef.current) {
        await refreshSeller();
      }
      return status;
    } catch {
      return null;
    }
  }, [refreshSeller]);

  useEffect(() => {
    if (!isActiveSellerSession(isAuthenticated, selectedProfile)) {
      lifecycleStatusRef.current = null;
      setState({
        lifecycleStatus: null,
        seller: null,
        isLoading: false,
        fetchError: null,
      });
      return;
    }

    void refreshSeller();
  }, [isAuthenticated, selectedProfile, refreshSeller]);

  const value = useMemo<SellerContextValue>(
    () => ({
      ...state,
      refreshSeller,
      refreshSellerStatus,
    }),
    [state, refreshSeller, refreshSellerStatus],
  );

  return <SellerContext.Provider value={value}>{children}</SellerContext.Provider>;
}

export function SellerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, selectedProfile } = useAuth();

  if (!isActiveSellerSession(isAuthenticated, selectedProfile)) {
    return (
      <SellerContext.Provider value={noopSellerContext}>
        {children}
      </SellerContext.Provider>
    );
  }

  return <SellerContextProvider>{children}</SellerContextProvider>;
}

export function useSeller(): SellerContextValue {
  const ctx = useContext(SellerContext);
  if (!ctx) throw new Error("useSeller must be used within SellerProvider");
  return ctx;
}
