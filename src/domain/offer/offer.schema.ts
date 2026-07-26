import { z } from "zod";

export function createOfferFormSchema(analystDiscountPercent: number) {
  return z
    .object({
      quotaPrice: z.coerce
        .number({ error: "Informe o preço da cota" })
        .positive("Preço da cota deve ser maior que zero"),
      minAmount: z.coerce
        .number({ error: "Informe o mínimo de captação" })
        .positive("Mínimo deve ser maior que zero"),
      targetAmount: z.coerce
        .number({ error: "Informe o valor alvo" })
        .positive("Valor alvo deve ser maior que zero"),
      platformSpreadPercent: z.coerce
        .number({ error: "Informe o spread da plataforma" })
        .min(0, "Spread não pode ser negativo")
        .max(
          analystDiscountPercent,
          `Spread não pode exceder o deságio do analista (${analystDiscountPercent}%)`
        ),
      deadline: z
        .string()
        .min(1, "Informe o prazo da oferta")
        .refine((value) => {
          const date = new Date(value);
          return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
        }, "O prazo deve ser uma data futura"),
    })
    .superRefine((data, ctx) => {
      if (data.minAmount > data.targetAmount) {
        ctx.addIssue({
          code: "custom",
          message: "Mínimo não pode ser maior que o valor alvo",
          path: ["minAmount"],
        });
      }
    });
}

export type CreateOfferFormValues = z.infer<ReturnType<typeof createOfferFormSchema>>;
