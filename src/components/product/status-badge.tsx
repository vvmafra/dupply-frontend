import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Badge } from "@/components/ui/badge";
import { getStatus, type StatusEntity, type StatusTone, type StatusValue } from "@/domain/status/status.registry";
import { cn } from "@/lib/utils";

/** Par ramp-100/700 no claro e ramp-900/300 no escuro: o único jeito de colorir status. */
export const statusToneClass: Record<StatusTone, string> = {
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  destructive: "bg-coral-100 text-coral-700 dark:bg-coral-900 dark:text-coral-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  ai: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
};

const dotToneClass: Record<StatusTone, string> = {
  success: "bg-emerald-600 dark:bg-emerald-400",
  warning: "bg-amber-600 dark:bg-amber-400",
  destructive: "bg-coral-600 dark:bg-coral-400",
  info: "bg-blue-600 dark:bg-blue-400",
  neutral: "bg-neutral-500 dark:bg-neutral-400",
  ai: "bg-violet-600 dark:bg-violet-400",
};

const statusBadgeVariants = cva("border-transparent font-medium", {
  variants: {
    size: {
      sm: "px-1.5 py-0 text-2xs",
      md: "px-2 py-0.5 text-xs",
    },
  },
  defaultVariants: { size: "md" },
});

type Base = VariantProps<typeof statusBadgeVariants> & {
  className?: string;
  /** Mostra um ponto colorido antes do rótulo. */
  dot?: boolean;
};

type ByEntity<E extends StatusEntity> = Base & {
  entity: E;
  value: StatusValue<E>;
  tone?: never;
  children?: never;
};

type ByTone = Base & {
  entity?: never;
  value?: never;
  /** Para rótulos fora do registro (ex.: "Laudo IA"). Prefira `entity` + `value`. */
  tone: StatusTone;
  children: ReactNode;
};

export type StatusBadgeProps<E extends StatusEntity = StatusEntity> = ByEntity<E> | ByTone;

/**
 * Badge de status com rótulo e cor vindos do registro único (`domain/status`).
 *
 *   <StatusBadge entity="receivableStage" value="funding" />
 *   <StatusBadge tone="ai" dot>Laudo IA</StatusBadge>
 */
export function StatusBadge<E extends StatusEntity>(props: StatusBadgeProps<E>) {
  const { className, size, dot } = props;
  // A união discriminada não estreita por `entity` com genérico; os casts só refletem o que os tipos já garantem.
  const entry: { label: ReactNode; tone: StatusTone } =
    props.entity !== undefined
      ? getStatus(props.entity, props.value as StatusValue<E>)
      : { label: props.children, tone: props.tone as StatusTone };
  return (
    <Badge
      data-slot="status-badge"
      data-tone={entry.tone}
      variant="outline"
      className={cn(statusBadgeVariants({ size }), statusToneClass[entry.tone], className)}
    >
      {dot ? <span aria-hidden className={cn("size-1.5 rounded-full", dotToneClass[entry.tone])} /> : null}
      {entry.label}
    </Badge>
  );
}
