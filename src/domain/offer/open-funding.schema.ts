import { z } from "zod";
import { MAX_YIELD_RATE_MONTHLY } from "./offer.constants";

/**
 * Admin "Abrir captação" form (HTTP mode). Both fields are optional overrides of
 * the analyst's terms; `targetAmount` is the funding target the ticket must fit in.
 */
export function createOpenFundingFormSchema(targetAmount: number) {
  return z
    .object({
      yieldRateMonthlyPercent: z.coerce
        .number({ error: "Informe a taxa mensal" })
        .min(0, "Taxa não pode ser negativa")
        .max(MAX_YIELD_RATE_MONTHLY * 100, `Taxa máxima de ${MAX_YIELD_RATE_MONTHLY * 100}% a.m.`),
      minInvestment: z.coerce
        .number({ error: "Informe o ticket mínimo" })
        .min(0, "Ticket mínimo não pode ser negativo"),
    })
    .superRefine((data, ctx) => {
      if (targetAmount > 0 && data.minInvestment > targetAmount) {
        ctx.addIssue({
          code: "custom",
          path: ["minInvestment"],
          message: "Ticket mínimo não pode ser maior que a meta de captação",
        });
      }
    });
}

export type OpenFundingFormValues = z.infer<ReturnType<typeof createOpenFundingFormSchema>>;
