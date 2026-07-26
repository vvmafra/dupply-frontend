import type { RiskLevel } from "./offer.types";

/** scoreDuplicata thresholds (0–100) → risk shown to investors */
export const RISK_SCORE_MEDIUM_MIN = 50;
export const RISK_SCORE_HIGH_MIN = 75;

/**
 * Higher score = stronger title → lower displayed risk.
 * < 50 → high, < 75 → medium, else low.
 */
export function mapScoreToRiskLevel(score: number): RiskLevel {
  if (score < RISK_SCORE_MEDIUM_MIN) return "high";
  if (score < RISK_SCORE_HIGH_MIN) return "medium";
  return "low";
}
