import { z } from "zod";

export const investQuotaSchema = z.object({
  quotaCount: z.coerce
    .number({ error: "Informe a quantidade de cotas" })
    .int("Quantidade deve ser um número inteiro")
    .positive("Invista ao menos 1 cota"),
});

export type InvestQuotaFormValues = z.infer<typeof investQuotaSchema>;
