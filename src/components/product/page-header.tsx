import type { ComponentProps, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PageHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /** Badges ou texto curto ao lado do título (status, ID). */
  meta?: ReactNode;
  /** Botões à direita. Primário por último. */
  actions?: ReactNode;
  /** Rota do link "Voltar". */
  backTo?: string;
  backLabel?: string;
};

/**
 * Topo de página: título, descrição, meta e ações. Sempre o primeiro filho do conteúdo.
 *   <PageHeader title="Oportunidades" description="Ofertas em duplicatas aprovadas." actions={<Button>Nova</Button>} />
 */
export function PageHeader({ title, description, meta, actions, backTo, backLabel = "Voltar", className, ...props }: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn("mb-6 flex flex-col gap-3", className)} {...props}>
      {backTo ? (
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
          <Link to={backTo}>
            <ArrowLeft />
            {backLabel}
          </Link>
        </Button>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {meta}
          </div>
          {description ? <p className="max-w-prose text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
