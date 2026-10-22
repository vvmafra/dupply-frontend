import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type RateProps = Omit<ComponentProps<"span">, "children"> & {
  /** Fração (0.019) quando `unit` é "am" ou "aa"; percentual já em % (12.4) quando `unit` é "percent". */
  value: number;
  unit?: "am" | "aa" | "percent";
  decimals?: number;
  /** Mostra "+"/"−" e colore pelo sinal (variação). */
  signed?: boolean;
  size?: "sm" | "md" | "lg";
};

const UNIT_LABEL = { am: "a.m.", aa: "a.a.", percent: "" } as const;

/**
 * Taxa ou percentual com algarismos tabulares.
 *   <Rate value={0.019} unit="am" />        1,9% a.m.
 *   <Rate value={12.4} signed />            +12,4% (em verde)
 */
export function Rate({ value, unit = "percent", decimals, signed, size = "sm", className, ...props }: RateProps) {
  const pct = unit === "percent" ? value : value * 100;
  const d = decimals ?? (unit === "percent" ? 1 : 2);
  const abs = Math.abs(pct).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const sign = signed ? (pct > 0 ? "+" : pct < 0 ? "−" : "") : pct < 0 ? "−" : "";
  const tone = signed ? (pct > 0 ? "text-emerald-700 dark:text-emerald-400" : pct < 0 ? "text-coral-700 dark:text-coral-400" : "") : "";
  const sizeClass = { sm: "text-sm", md: "text-base font-medium", lg: "text-2xl font-semibold tracking-tight" }[size];
  const suffix = UNIT_LABEL[unit];

  return (
    <span data-slot="rate" className={cn("numeric inline-flex items-baseline gap-1 whitespace-nowrap", sizeClass, tone, className)} {...props}>
      <span>
        {sign}
        {abs}%
      </span>
      {suffix ? <span className={cn("font-normal text-muted-foreground", size === "lg" ? "text-sm" : "text-[0.85em]")}>{suffix}</span> : null}
    </span>
  );
}
