import { smartAccountEnv } from "@/lib/smart-account.config";

export type RegisterSellerWalletPayload = {
  contractId: string;
  credentialId: string;
  signerPublicKey: string;
  network: "testnet" | "mainnet";
  createdTxHash?: string;
};

export function publicKeyToHex(publicKey: Uint8Array): string {
  return Array.from(publicKey, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildRegisterPayload(input: {
  contractId: string;
  credentialId: string;
  publicKey: Uint8Array;
  createdTxHash?: string;
}): RegisterSellerWalletPayload {
  return {
    contractId: input.contractId,
    credentialId: input.credentialId,
    signerPublicKey: publicKeyToHex(input.publicKey),
    network: smartAccountEnv.network,
    createdTxHash: input.createdTxHash,
  };
}
