import type { ComponentProps, ReactNode } from "react";

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export type EmptyStateProps = Omit<ComponentProps<"div">, "title"> & {
  icon?: ReactNode;
  title: ReactNode;
  /** Diga o que fazer, não só o que falta: "Envie sua primeira duplicata para começar." */
  description?: ReactNode;
  action?: ReactNode;
  /** `compact` para dentro de cards e tabelas. */
  size?: "default" | "compact";
};

/**
 * Lista vazia, sem resultado de filtro ou erro recuperável. Sempre com um próximo passo.
 *   <EmptyState icon={<FileText />} title="Nenhuma duplicata" description="Envie a primeira para iniciar a análise." action={<Button>Enviar duplicata</Button>} />
 */
export function EmptyState({ icon, title, description, action, size = "default", className, ...props }: EmptyStateProps) {
  return (
    <Empty data-slot="empty-state" className={cn("border border-dashed", size === "compact" ? "p-6 md:p-6" : "p-10 md:p-10", className)} {...props}>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
