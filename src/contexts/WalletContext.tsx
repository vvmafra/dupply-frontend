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
import { SmartAccountKit, IndexedDBStorage } from "smart-account-kit";
import { useAuth } from "@/contexts/AuthContext";
import { useSeller } from "@/contexts/SellerContext";
import {
  buildRegisterPayload,
  type RegisterSellerWalletPayload,
} from "@/domain/wallet/wallet-payload";
import { WalletRegistrationError } from "@/domain/wallet/wallet.errors";
import { resolveApiMode } from "@/lib/env";
import {
  assertSmartAccountEnvConfigured,
  smartAccountEnv,
} from "@/lib/smart-account.config";
import { fetchSellerWallet, registerSellerWallet } from "@/services/wallet.service";

export type WalletConnectionStatus = "idle" | "connecting" | "connected" | "error";

export type WalletContextValue = {
  connectionStatus: WalletConnectionStatus;
  connectExistingWallet: (credentialId: string) => Promise<void>;
  createAndRegisterWallet: (appName: string, userEmail: string) => Promise<void>;
  retryBackendRegistration: () => Promise<void>;
  lastConnectError: string | null;
};

const WALLET_CONNECT_ERROR_MESSAGE =
  "Não foi possível reconectar sua carteira. Tente novamente ou use sua passkey.";

const WALLET_ESCALATION_MESSAGE =
  "Esta carteira já está vinculada, mas não foi possível sincronizar sua conta. Entre em contato com o suporte.";

const noopWalletContext: WalletContextValue = {
  connectionStatus: "idle",
  connectExistingWallet: async () => {},
  createAndRegisterWallet: async () => {},
  retryBackendRegistration: async () => {},
  lastConnectError: null,
};

const WalletContext = createContext<WalletContextValue | null>(null);

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

function createKitInstance(): SmartAccountKit {
  assertSmartAccountEnvConfigured();
  return new SmartAccountKit({
    rpcUrl: smartAccountEnv.rpcUrl,
    networkPassphrase: smartAccountEnv.networkPassphrase,
    accountWasmHash: smartAccountEnv.accountWasmHash,
    webauthnVerifierAddress: smartAccountEnv.webauthnVerifierAddress,
    storage: new IndexedDBStorage(),
    rpId: smartAccountEnv.rpId,
    rpName: smartAccountEnv.rpName,
  });
}

function buildCreateWalletOptions() {
  return {
    autoSubmit: true as const,
    autoFund: true as const,
    ...(smartAccountEnv.nativeTokenContract
      ? { nativeTokenContract: smartAccountEnv.nativeTokenContract }
      : {}),
  };
}

async function syncPendingDeploy(
  kit: SmartAccountKit,
): Promise<RegisterSellerWalletPayload | null> {
  const pending = await kit.credentials.getPending();
  if (pending.length === 0) {
    await kit.credentials.syncAll();
    return null;
  }

  const credential = pending[0];
  const alreadyDeployed = await kit.credentials.sync(credential.credentialId);
  if (alreadyDeployed && credential.contractId) {
    return buildRegisterPayload({
      contractId: credential.contractId,
      credentialId: credential.credentialId,
      publicKey: credential.publicKey,
    });
  }

  const deployResult = await kit.credentials.deploy(credential.credentialId, {
    autoSubmit: true,
  });

  return buildRegisterPayload({
    contractId: deployResult.contractId,
    credentialId: credential.credentialId,
    publicKey: credential.publicKey,
    createdTxHash: deployResult.submitResult?.hash,
  });
}

function WalletContextProvider({ children }: { children: ReactNode }) {
  const { seller, refreshSeller } = useSeller();
  const kitRef = useRef<SmartAccountKit | null>(null);
  const pendingRegistrationRef = useRef<RegisterSellerWalletPayload | null>(null);
  const bootstrapWalletIdRef = useRef<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<WalletConnectionStatus>("idle");
  const [lastConnectError, setLastConnectError] = useState<string | null>(null);

  const getKit = useCallback((): SmartAccountKit => {
    kitRef.current ??= createKitInstance();
    return kitRef.current;
  }, []);

  const handleWalletAlreadyExists = useCallback(async (): Promise<void> => {
    const refreshed = await refreshSeller();
    if (refreshed?.walletId) {
      pendingRegistrationRef.current = null;
      return;
    }
    throw new WalletRegistrationError("wallet_already_exists", WALLET_ESCALATION_MESSAGE);
  }, [refreshSeller]);

  const connectExistingWallet = useCallback(
    async (credentialId: string): Promise<void> => {
      setConnectionStatus("connecting");
      setLastConnectError(null);

      try {
        const kit = getKit();
        const result = await kit.connectWallet({ credentialId });
        if (!result) {
          throw new Error("Wallet session unavailable");
        }
        setConnectionStatus("connected");
      } catch {
        setConnectionStatus("error");
        setLastConnectError(WALLET_CONNECT_ERROR_MESSAGE);
      }
    },
    [getKit],
  );

  const createAndRegisterWallet = useCallback(
    async (appName: string, userEmail: string): Promise<void> => {
      if (seller?.walletId) {
        throw new WalletRegistrationError(
          "wallet_already_exists",
          "Sua conta já possui uma carteira vinculada.",
        );
      }

      const kit = getKit();
      const result = await kit.createWallet(appName, userEmail, buildCreateWalletOptions());

      const payload = buildRegisterPayload({
        contractId: result.contractId,
        credentialId: result.credentialId,
        publicKey: result.publicKey,
        createdTxHash: result.submitResult?.hash,
      });
      pendingRegistrationRef.current = payload;

      try {
        await registerSellerWallet(payload);
        pendingRegistrationRef.current = null;
        await refreshSeller();
      } catch (error) {
        if (
          error instanceof WalletRegistrationError &&
          error.code === "wallet_already_exists"
        ) {
          await handleWalletAlreadyExists();
          return;
        }
        throw error;
      }
    },
    [getKit, handleWalletAlreadyExists, refreshSeller, seller?.walletId],
  );

  const retryBackendRegistration = useCallback(async (): Promise<void> => {
    const kit = getKit();
    let payload = pendingRegistrationRef.current;

    if (!payload) {
      payload = await syncPendingDeploy(kit);
      if (payload) {
        pendingRegistrationRef.current = payload;
      }
    } else {
      const pending = await kit.credentials.getPending();
      if (pending.length > 0) {
        const syncedPayload = await syncPendingDeploy(kit);
        if (syncedPayload) {
          payload = syncedPayload;
          pendingRegistrationRef.current = syncedPayload;
        }
      } else {
        await kit.credentials.syncAll();
      }
    }

    if (!payload) {
      throw new WalletRegistrationError(
        "unknown",
        "Nenhuma carteira pendente para vincular. Tente criar novamente.",
      );
    }

    try {
      await registerSellerWallet(payload);
      pendingRegistrationRef.current = null;
      await refreshSeller();
    } catch (error) {
      if (
        error instanceof WalletRegistrationError &&
        error.code === "wallet_already_exists"
      ) {
        await handleWalletAlreadyExists();
        return;
      }
      throw error;
    }
  }, [getKit, handleWalletAlreadyExists, refreshSeller]);

  useEffect(() => {
    const walletId = seller?.walletId ?? null;

    if (!walletId) {
      bootstrapWalletIdRef.current = null;
      setConnectionStatus("idle");
      setLastConnectError(null);
      return;
    }

    if (bootstrapWalletIdRef.current === walletId) {
      return;
    }

    bootstrapWalletIdRef.current = walletId;
    let cancelled = false;

    async function bootstrapReconnect(): Promise<void> {
      setConnectionStatus("connecting");
      setLastConnectError(null);

      try {
        const wallet = await fetchSellerWallet();
        const kit = getKit();
        const result = await kit.connectWallet({ credentialId: wallet.credentialId });
        if (!result) {
          throw new Error("Wallet session unavailable");
        }
        if (!cancelled) {
          setConnectionStatus("connected");
        }
      } catch {
        if (!cancelled) {
          setConnectionStatus("error");
          setLastConnectError(WALLET_CONNECT_ERROR_MESSAGE);
        }
      }
    }

    void bootstrapReconnect();

    return () => {
      cancelled = true;
    };
  }, [getKit, seller?.walletId]);

  const value = useMemo<WalletContextValue>(
    () => ({
      connectionStatus,
      connectExistingWallet,
      createAndRegisterWallet,
      retryBackendRegistration,
      lastConnectError,
    }),
    [
      connectionStatus,
      connectExistingWallet,
      createAndRegisterWallet,
      retryBackendRegistration,
      lastConnectError,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, selectedProfile } = useAuth();

  if (!isActiveSellerSession(isAuthenticated, selectedProfile)) {
    return (
      <WalletContext.Provider value={noopWalletContext}>
        {children}
      </WalletContext.Provider>
    );
  }

  return <WalletContextProvider>{children}</WalletContextProvider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
