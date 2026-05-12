import type { RiskLevel } from "./receivable.types";

export function calculateScore(params: {
  grossAmount: number;
  termInDays: number;
  debtorHistory?: "good" | "average" | "poor";
}): number {
  let score = 75;
  if (params.grossAmount > 100000) score -= 5;
  if (params.termInDays > 90) score -= 10;
  if (params.termInDays > 180) score -= 10;
  if (params.debtorHistory === "good") score += 15;
  if (params.debtorHistory === "poor") score -= 20;
  return Math.min(99, Math.max(30, score));
}

export function getRiskFromScore(score: number): RiskLevel {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  return "HIGH";
}
