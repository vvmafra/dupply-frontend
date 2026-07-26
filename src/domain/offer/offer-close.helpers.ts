import type { OfferCloseResolution } from "./offer.types";
import { calcFidcGap } from "./offer-economics.helpers";

export function resolveOfferClose(input: {
  raisedAmount: number;
  minAmount: number;
  targetAmount: number;
}): OfferCloseResolution {
  const { raisedAmount, minAmount, targetAmount } = input;

  if (raisedAmount < minAmount) {
    return { outcome: "failed", fidcAmount: 0 };
  }

  if (raisedAmount >= targetAmount) {
    return { outcome: "full", fidcAmount: 0 };
  }

  return {
    outcome: "partial_with_fidc",
    fidcAmount: calcFidcGap(targetAmount, raisedAmount),
  };
}
