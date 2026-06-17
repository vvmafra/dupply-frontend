export type WalletNetworkDTO = "testnet" | "mainnet";
export type WalletStatusDTO = "active" | "inactive";

export type RegisterSellerWalletRequestDTO = {
  contractId: string;
  credentialId: string;
  signerPublicKey: string;
  network: WalletNetworkDTO;
  createdTxHash?: string;
};

export type WalletPublicViewDTO = {
  id: string;
  status: WalletStatusDTO;
  network: WalletNetworkDTO;
  address: string;
  type: "smart_account";
  credentialId: string;
  signerPublicKey: string;
  createdTxHash: string | null;
  parentType: "seller";
  sellerId: string;
  createdAt: string;
  updatedAt: string;
};

export type WalletErrorBodyDTO = {
  error?:
    | "wallet_not_found"
    | "seller_not_found"
    | "forbidden"
    | "seller_not_active"
    | "wallet_already_exists"
    | "validation_error"
    | "invalid_wallet_status"
    | "unauthorized";
};
