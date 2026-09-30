/**
 * Presentation heuristics for the investor's "Dados do Título Auditado" card.
 * The investor never sees seller/sacado identities, so these derive a sector
 * and a route from the masked data we do expose. Demo-only.
 */

export function formatMaskedFiscalKey(key?: string): string {
  if (!key) return "—";
  if (key.length <= 8) return key;
  return `${key.slice(0, 4)}••••••••••••••••${key.slice(-4)}`;
}

export function inferSectorFromName(name?: string, defaultSector = "Serviços Gerais"): string {
  if (!name) return defaultSector;
  const upper = name.toUpperCase();
  if (["DIGITAL", "SOFTWARE", "TECNOLOGIA", "TECH"].some((term) => upper.includes(term))) {
    return "Tecnologia e Serviços";
  }
  if (["ALIMENT", "SUPERMERCADO", "VAREJO", "DISTRIB"].some((term) => upper.includes(term))) {
    return "Varejo e Consumo";
  }
  if (["TRANSPORT", "LOGISTICA", "CARGO"].some((term) => upper.includes(term))) {
    return "Transporte e Logística";
  }
  return defaultSector;
}

const UF_BY_IBGE_PREFIX: Record<string, string> = {
  "33": "RJ",
  "31": "MG",
  "41": "PR",
  "43": "RS",
  "29": "BA",
};

const CITY_BY_UF: Record<string, string> = {
  RJ: "Rio de Janeiro/RJ",
  MG: "Belo Horizonte/MG",
  SP: "São Paulo/SP",
};

/** "Origem → Destino" derived from the fiscal key's IBGE prefix (demo heuristic). */
export function inferRouteFromFiscalKey(
  key: string | undefined,
  tipo: "mercantil" | "servico",
): string {
  const uf = key && key.length >= 2 ? UF_BY_IBGE_PREFIX[key.slice(0, 2)] ?? "SP" : "SP";
  const origin = tipo === "servico" ? "São Paulo/SP" : "Campinas/SP";
  const dest = CITY_BY_UF[uf] ?? "São Paulo/SP";
  return `${origin} → ${dest}`;
}
