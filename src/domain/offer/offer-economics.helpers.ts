import { calcValorLiquidoCedente } from "@/domain/duplicata/duplicata-antecipacao.helpers";

export function calcDefaultTargetAmount(
  faceValue: number,
  analystDiscountPercent: number
): number {
  return calcValorLiquidoCedente(faceValue, analystDiscountPercent);
}

export function calcQuotaCount(targetAmount: number, quotaPrice: number): number {
  if (quotaPrice <= 0) return 0;
  return Math.ceil(targetAmount / quotaPrice);
}

/** Snap target to an exact multiple of quota price for clean progress bars */
export function snapTargetToQuotas(targetAmount: number, quotaPrice: number): {
  quotaCount: number;
  targetAmount: number;
} {
  const quotaCount = calcQuotaCount(targetAmount, quotaPrice);
  return {
    quotaCount,
    targetAmount: quotaCount * quotaPrice,
  };
}

export function calcEstimatedInvestorReturnPercent(
  analystDiscountPercent: number,
  platformSpreadPercent: number
): number {
  return Math.max(0, analystDiscountPercent - platformSpreadPercent);
}

export function calcRaisedAmount(quotaPrice: number, quotasSold: number): number {
  return quotaPrice * quotasSold;
}

export function calcFundingProgress(raisedAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, (raisedAmount / targetAmount) * 100);
}

export function calcMinProgress(minAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.min(100, (minAmount / targetAmount) * 100);
}

export function calcFidcGap(targetAmount: number, raisedAmount: number): number {
  return Math.max(0, targetAmount - raisedAmount);
}

export function calcRemainingQuotas(quotaCount: number, quotasSold: number): number {
  return Math.max(0, quotaCount - quotasSold);
}
