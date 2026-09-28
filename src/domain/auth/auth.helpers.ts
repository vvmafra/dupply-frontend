import type { UserProfile } from "./auth.types";
import { ROUTES } from "@/lib/routes";

export function getProfileLabel(profile: UserProfile): string {
  const labels: Record<UserProfile, string> = {
    seller: "Cedente",
    admin: "Admin",
    riskAnalyst: "Analista de risco",
    investor: "Investidor",
  };
  return labels[profile];
}

export function getProfileDescription(profile: UserProfile): string {
  const descriptions: Record<UserProfile, string> = {
    seller: "Antecipe seus recebíveis e obtenha liquidez de forma simples.",
    admin: "Monitore cedentes, analistas e operações internas da plataforma.",
    riskAnalyst: "Analise cadastros de cedentes e duplicatas com apoio de IA (simulado).",
    investor: "Invista em ofertas de duplicatas aprovadas e acompanhe sua carteira.",
  };
  return descriptions[profile];
}

const PROFILE_ROUTE_ROOTS: Record<UserProfile, string> = {
  seller: ROUTES.seller.dashboard,
  admin: ROUTES.admin.dashboard,
  riskAnalyst: ROUTES.analyst.dashboard,
  investor: ROUTES.investor.home,
};

export function getProfileRedirect(profile: UserProfile): string {
  return PROFILE_ROUTE_ROOTS[profile];
}

function isUnderRoot(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

/**
 * Whether `pathname` can be opened by `profile`: either it lives under that
 * profile's area or it belongs to no profile area at all (shared routes).
 */
export function isPathAllowedForProfile(profile: UserProfile, pathname: string): boolean {
  const ownRoot = PROFILE_ROUTE_ROOTS[profile];
  if (isUnderRoot(pathname, ownRoot)) return true;
  return !Object.values(PROFILE_ROUTE_ROOTS).some((root) => isUnderRoot(pathname, root));
}

/**
 * Where to send the user after login / profile selection.
 *
 * Guards store the page that triggered the redirect in `location.state.from`.
 * Returning to it blindly loops when it belongs to another persona (seller
 * logs out on `/seller/duplicatas`, analyst logs in, guard bounces back to
 * `/select-profile`, and so on), so the path is only reused when the chosen
 * profile is allowed to open it.
 */
export function resolvePostLoginPath(
  profile: UserProfile,
  fromPath?: string | null,
): string {
  if (fromPath && isPathAllowedForProfile(profile, fromPath)) return fromPath;
  return getProfileRedirect(profile);
}
