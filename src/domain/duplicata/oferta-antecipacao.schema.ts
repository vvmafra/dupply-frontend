import { z } from "zod";
import { MAX_YIELD_RATE_MONTHLY } from "@/domain/offer/offer.constants";
import { calcValorLiquidoCedente } from "./duplicata-antecipacao.helpers";
import type { OfertaAntecipacaoTerms } from "./duplicata.types";

export const DESCONTO_MIN_PERCENT = 2;
export const DESCONTO_MAX_PERCENT = 3.5;
/** Default monthly rate suggested to the analyst (1,8% a.m.). */
export const DEFAULT_YIELD_RATE_MONTHLY_PERCENT = 1.8;

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Form values of the analyst's proposal wizard (strings, as typed).
 * `valorNota` is the face value used to validate the minimum ticket.
 */
export function createOfertaAntecipacaoFormSchema(valorNota: number) {
  return z
    .object({
      descontoPercent: z
        .string()
        .transform(parseNumber)
        .refine(
          (v): v is number => v !== null && v >= DESCONTO_MIN_PERCENT && v <= DESCONTO_MAX_PERCENT,
          `Informe um desconto entre ${DESCONTO_MIN_PERCENT}% e ${DESCONTO_MAX_PERCENT}%.`,
        ),
      yieldRateMonthlyPercent: z
        .string()
        .transform(parseNumber)
        .refine(
          (v) => v === null || (v >= 0 && v <= MAX_YIELD_RATE_MONTHLY * 100),
          `Taxa mensal entre 0% e ${MAX_YIELD_RATE_MONTHLY * 100}% a.m.`,
        ),
      minInvestment: z
        .string()
        .transform(parseNumber)
        .refine((v) => v === null || v >= 0, "Ticket mínimo não pode ser negativo."),
      observacoes: z.string(),
    })
    .superRefine((data, ctx) => {
      const proposedValue = calcValorLiquidoCedente(valorNota, data.descontoPercent);
      if (data.minInvestment !== null && data.minInvestment > proposedValue) {
        ctx.addIssue({
          code: "custom",
          path: ["minInvestment"],
          message: "Ticket mínimo não pode ser maior que o valor proposto ao cedente.",
        });
      }
    });
}

export type OfertaAntecipacaoFormOutput = z.output<ReturnType<typeof createOfertaAntecipacaoFormSchema>>;

export function toOfertaAntecipacaoTerms(values: OfertaAntecipacaoFormOutput): OfertaAntecipacaoTerms {
  return {
    descontoPercent: values.descontoPercent,
    yieldRateMonthly:
      values.yieldRateMonthlyPercent === null ? undefined : values.yieldRateMonthlyPercent / 100,
    minInvestment: values.minInvestment === null || values.minInvestment <= 0 ? undefined : values.minInvestment,
  };
}
