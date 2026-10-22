import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const moneyVariants = cva("numeric inline-flex items-baseline gap-1 whitespace-nowrap", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base font-medium",
      lg: "text-2xl font-semibold tracking-tight",
      xl: "text-3xl font-bold tracking-tight",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      positive: "text-emerald-700 dark:text-emerald-400",
      negative: "text-coral-700 dark:text-coral-400",
    },
  },
  defaultVariants: { size: "sm", tone: "default" },
});

export type MoneyProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof moneyVariants> & {
    /** Valor em reais (não em centavos). */
    value: number;
    /** Mostra "+" para positivos e colore pelo sinal. */
    signed?: boolean;
    /** Abrevia: R$ 1,2 mi · R$ 184 mil. Para cards e gráficos, não para extrato. */
    compact?: boolean;
    /** Esconde os centavos (R$ 184.250). */
    noCents?: boolean;
    currency?: string;
  };

const fmt = (opts: Intl.NumberFormatOptions) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", ...opts });

/**
 * Valor monetário com algarismos tabulares e símbolo discreto.
 *   <Money value={184250} />            R$ 184.250,00
 *   <Money value={184250} size="lg" />  destaque de KPI
 *   <Money value={-1200} signed />      −R$ 1.200,00 em coral
 */
export function Money({ value, signed, compact, noCents, currency = "BRL", size, tone, className, ...props }: MoneyProps) {
  const parts = fmt({
    currency,
    notation: compact ? "compact" : "standard",
    ...(noCents || compact ? { minimumFractionDigits: 0, maximumFractionDigits: compact ? 1 : 0 } : {}),
    signDisplay: signed ? "exceptZero" : "auto",
  }).formatToParts(value);
  const symbol = parts.filter((p) => p.type === "currency").map((p) => p.value).join("");
  const sign = parts.filter((p) => p.type === "plusSign" || p.type === "minusSign").map((p) => p.value).join("");
  const number = parts.filter((p) => !["currency", "literal", "plusSign", "minusSign"].includes(p.type)).map((p) => p.value).join("");
  const resolvedTone = tone ?? (signed ? (value > 0 ? "positive" : value < 0 ? "negative" : "default") : "default");
  const label = fmt({ currency, signDisplay: signed ? "exceptZero" : "auto" }).format(value);

  return (
    <span data-slot="money" aria-label={label} className={cn(moneyVariants({ size, tone: resolvedTone }), className)} {...props}>
      {sign ? <span aria-hidden>{sign}</span> : null}
      <span aria-hidden className={cn("font-normal", size === "lg" || size === "xl" ? "text-[0.6em] text-muted-foreground" : "opacity-80")}>
        {symbol}
      </span>
      <span aria-hidden>{number}</span>
    </span>
  );
}
