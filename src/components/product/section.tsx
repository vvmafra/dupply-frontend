import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SectionProps = Omit<ComponentProps<"section">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** `tight` para seções pequenas dentro de cards. */
  spacing?: "default" | "tight";
};

/**
 * Bloco de página com título opcional e ritmo fixo (space-y-6 / space-y-2).
 *   <Section title="Duplicatas recentes" actions={<Button variant="outline" size="sm">Ver todas</Button>}>…</Section>
 */
export function Section({ title, description, actions, spacing = "default", className, children, ...props }: SectionProps) {
  return (
    <section data-slot="section" className={cn(spacing === "tight" ? "space-y-2" : "space-y-4", className)} {...props}>
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="space-y-0.5">
            {title ? <h2 className="text-base font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
