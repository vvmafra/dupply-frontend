import type { ComponentProps, ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { Rate } from "@/components/product/rate";
import { cn } from "@/lib/utils";

export type StatProps = Omit<ComponentProps<"div">, "children"> & {
  label: ReactNode;
  /** Normalmente um <Money size="lg" /> ou <Rate size="lg" />, mas aceita qualquer nó. */
  value: ReactNode;
  /** Variação percentual (12.4 = +12,4%). Colore pelo sinal. */
  delta?: number;
  /** Texto curto após o delta ou sozinho: "vs. semana passada", "Vence em 42 dias". */
  hint?: ReactNode;
  icon?: ReactNode;
  /** `plain` remove o card: use dentro de outro card ou em linha de KPIs compacta. */
  variant?: "card" | "plain";
};

/**
 * KPI: rótulo em cima, valor grande, delta e dica embaixo.
 *   <Stat label="Captado" value={<Money value={184250} size="lg" />} delta={12.4} hint="esta semana" />
 */
export function Stat({ label, value, delta, hint, icon, variant = "card", className, ...props }: StatProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon ? <span className="text-muted-foreground [&>svg]:size-4">{icon}</span> : null}
      </div>
      <div className="mt-1">{value}</div>
      {delta !== undefined || hint ? (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {delta !== undefined ? <Rate value={delta} signed /> : null}
          {hint ? <span>{hint}</span> : null}
        </div>
      ) : null}
    </>
  );

  if (variant === "plain") {
    return (
      <div data-slot="stat" className={cn("min-w-0", className)} {...props}>
        {body}
      </div>
    );
  }
  return (
    <Card data-slot="stat" className={cn("gap-0 p-4", className)} {...props}>
      {body}
    </Card>
  );
}
