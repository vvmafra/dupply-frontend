import type { ReceivableStatus } from "./receivable.types";

export const SELLER_VISIBLE_STATUSES: ReceivableStatus[] = [
  "DRAFT",
  "UNDER_REVIEW",
  "APPROVED",
  "LISTED",
  "FUNDED",
  "SETTLED",
  "DEFAULTED",
];

export const MARKETPLACE_VISIBLE_STATUSES: ReceivableStatus[] = [
  "LISTED",
];

export const TRANSITION_MAP: Record<ReceivableStatus, ReceivableStatus[]> = {
  DRAFT: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "DRAFT"],
  APPROVED: ["LISTED"],
  LISTED: ["FUNDED"],
  FUNDED: ["SETTLED", "DEFAULTED"],
  SETTLED: [],
  DEFAULTED: [],
};
