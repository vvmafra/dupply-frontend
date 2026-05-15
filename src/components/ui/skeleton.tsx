import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      data-slot="skeleton"
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-[55%] max-w-[10rem]",
          "bg-gradient-to-r from-transparent via-foreground/[0.07] to-transparent dark:via-foreground/[0.12]",
          "motion-reduce:animate-none motion-reduce:opacity-0",
          "animate-[skeleton-shimmer-slide_2.2s_ease-in-out_infinite]"
        )}
      />
    </div>
  );
}

export { Skeleton }
