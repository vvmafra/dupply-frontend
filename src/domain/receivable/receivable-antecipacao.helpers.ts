export function calcProposedValueFromDiscount(
  faceValueReais: number,
  discountPercent: number,
): number {
  return faceValueReais * (1 - discountPercent / 100);
}
