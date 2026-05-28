import type { SellerStatusDTO } from "@/services/seller.dto";
import { ROUTES } from "@/lib/routes";

export type SellerLifecycleStatus = SellerStatusDTO;

export const INACTIVE_SELLER_REJECTION_MESSAGE =
  "Seu cadastro não foi aprovado. Entre em contato com o suporte para mais informações.";

export class SellerRegistrationBlockedError extends Error {
  constructor(message = INACTIVE_SELLER_REJECTION_MESSAGE) {
    super(message);
    this.name = "SellerRegistrationBlockedError";
  }
}

export function getPostLoginSellerDestination(status: SellerLifecycleStatus): string {
  switch (status) {
    case "created":
      return ROUTES.sellerRegistration;
    case "in_review":
    case "active":
      return ROUTES.seller.dashboard;
    case "inactive":
      throw new SellerRegistrationBlockedError();
  }
}

export function getRegistrationPageRedirect(
  isAuthenticated: boolean,
  status: SellerLifecycleStatus | null,
): string | null {
  if (!isAuthenticated) return null;
  if (status === "created") return null;
  if (status === "in_review" || status === "active") return ROUTES.seller.dashboard;
  return ROUTES.login;
}
