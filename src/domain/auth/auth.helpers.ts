import type { UserProfile } from "./auth.types";
import { ROUTES } from "@/lib/routes";

export function getProfileLabel(profile: UserProfile): string {
  const labels: Record<UserProfile, string> = {
    seller: "Cedente",
    admin: "Admin",
    riskAnalyst: "Analista de risco",
  };
  return labels[profile];
}

export function getProfileDescription(profile: UserProfile): string {
  const descriptions: Record<UserProfile, string> = {
    seller: "Antecipe seus recebíveis e obtenha liquidez de forma simples.",
    admin: "Monitore cedentes, analistas e operações internas da plataforma.",
    riskAnalyst: "Analise cadastros de cedentes e duplicatas com apoio de IA (simulado).",
  };
  return descriptions[profile];
}

export function getProfileRedirect(profile: UserProfile): string {
  const redirects: Record<UserProfile, string> = {
    seller: ROUTES.seller.dashboard,
    admin: ROUTES.admin.dashboard,
    riskAnalyst: ROUTES.analyst.dashboard,
  };
  return redirects[profile];
}
