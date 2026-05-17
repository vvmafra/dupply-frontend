import type { DuplicataAnaliseAnalista } from "./duplicata.types";

export const DUPLICATA_ANALISE_LABELS: Record<DuplicataAnaliseAnalista, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  reprovado: "Reprovado",
};

export const DUPLICATA_ANALISE_LABELS_FEMININE: Record<DuplicataAnaliseAnalista, string> = {
  pendente: "Pendente",
  aprovado: "Aprovada",
  reprovado: "Reprovada",
};

export function getDuplicataAnaliseLabel(
  status: DuplicataAnaliseAnalista,
  options?: { feminine?: boolean },
): string {
  return options?.feminine
    ? DUPLICATA_ANALISE_LABELS_FEMININE[status]
    : DUPLICATA_ANALISE_LABELS[status];
}

export function getDuplicataAnaliseColor(status: DuplicataAnaliseAnalista): string {
  const colors: Record<DuplicataAnaliseAnalista, string> = {
    pendente: "text-warning bg-warning/20 border-warning/40",
    aprovado: "text-success bg-success/20 border-success/40",
    reprovado: "text-destructive bg-destructive/20 border-destructive/40",
  };
  return colors[status];
}
