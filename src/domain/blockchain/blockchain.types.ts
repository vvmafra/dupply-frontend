export type BlockchainEventType =
  | "SELLER_VALIDATION_CREATED"
  | "SELLER_KYC_APPROVED"
  | "RECEIVABLE_CREATED"
  | "DOCUMENTS_UPLOADED"
  | "SCORE_CALCULATED"
  | "RECEIVABLE_APPROVED"
  | "RECEIVABLE_LISTED"
  | "FUND_ACQUISITION_SIMULATED"
  | "PAYMENT_REGISTERED"
  | "FUND_REDEMPTION_SIMULATED";

export type BlockchainTransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface BlockchainTransaction {
  id: string;
  eventType: BlockchainEventType;
  transactionHash: string;
  ledger: number;
  network: "Stellar Testnet";
  status: BlockchainTransactionStatus;
  relatedReceivableId: string;
  relatedSellerName: string;
  amount: number;
  createdAt: string;
  payload: Record<string, unknown>;
}
