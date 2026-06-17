/**
 * Stellar / WebAuthn env for smart-account-kit (seller wallet).
 * Required when HTTP seller wallet flow is active — see `.env.example`.
 */
export const smartAccountEnv = {
  rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL as string,
  networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE as string,
  accountWasmHash: import.meta.env.VITE_ACCOUNT_WASM_HASH as string,
  webauthnVerifierAddress: import.meta.env.VITE_WEBAUTHN_VERIFIER_ADDRESS as string,
  network: (import.meta.env.VITE_STELLAR_NETWORK ?? "testnet") as "testnet",
  nativeTokenContract: import.meta.env.VITE_STELLAR_NATIVE_TOKEN_CONTRACT as
    | string
    | undefined,
  rpId: import.meta.env.VITE_WEBAUTHN_RP_ID as string,
  rpName: (import.meta.env.VITE_WEBAUTHN_RP_NAME ?? "Dupply") as string,
} as const;

export function assertSmartAccountEnvConfigured(): void {
  const required = [
    smartAccountEnv.rpcUrl,
    smartAccountEnv.networkPassphrase,
    smartAccountEnv.accountWasmHash,
    smartAccountEnv.webauthnVerifierAddress,
    smartAccountEnv.rpId,
  ];
  if (required.some((v) => !v)) {
    throw new Error("Smart account environment is not fully configured.");
  }
}
