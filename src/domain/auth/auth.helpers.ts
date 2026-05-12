import type { UserProfile } from "./auth.types";
import { ROUTES } from "@/lib/routes";

export function getProfileLabel(profile: UserProfile): string {
  const labels: Record<UserProfile, string> = {
    seller: "Cedente",
    investor: "Investidor",
    admin: "Admin",
  };
  return labels[profile];
}

export function getProfileDescription(profile: UserProfile): string {
  const descriptions: Record<UserProfile, string> = {
    seller: "Antecipe seus recebíveis e obtenha liquidez de forma simples.",
    investor: "Invista em operações validadas e diversifique sua carteira.",
    admin: "Monitore a plataforma, validações e operações internas.",
  };
  return descriptions[profile];
}

export function getProfileRedirect(profile: UserProfile): string {
  const redirects: Record<UserProfile, string> = {
    seller: ROUTES.seller.dashboard,
    investor: ROUTES.investor.dashboard,
    admin: ROUTES.admin.dashboard,
  };
  return redirects[profile];
}
