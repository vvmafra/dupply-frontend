export type SellerProfileErrorCode =
  | "missing_session"
  | "missing_seller_profile"
  | "seller_not_found"
  | "forbidden"
  | "metadata_locked"
  | "incomplete_metadata"
  | "invalid_status_for_submit"
  | "invalid_status_transition"
  | "validation_error"
  | "network"
  | "unknown";

export class SellerProfileError extends Error {
  readonly code: SellerProfileErrorCode;

  constructor(code: SellerProfileErrorCode, message: string) {
    super(message);
    this.name = "SellerProfileError";
    this.code = code;
  }
}
