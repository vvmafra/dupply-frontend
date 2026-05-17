import type { CSSProperties, ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { cn } from "@/lib/utils";
import { DUPPLY_PUBLIC_PAGE_ROOT } from "@/components/layout/dupplyTopbar.styles";

type PublicShellProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Layout público único: topbar + fundo navy da marca (igual à landing).
 * Use em todas as páginas que hoje repetem `PublicHeader` + wrapper.
 */
export function PublicShell({ children, className, style }: Readonly<PublicShellProps>) {
  return (
    <div className={cn(DUPPLY_PUBLIC_PAGE_ROOT, className)} style={style}>
      <PublicHeader />
      {children}
    </div>
  );
}
