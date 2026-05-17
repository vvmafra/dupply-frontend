import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  DUPPLY_TOPBAR_GHOST_LINK,
  DUPPLY_TOPBAR_HEADER,
  DUPPLY_TOPBAR_LOGO_TEXT,
  DUPPLY_TOPBAR_PRIMARY_CTA,
  DUPPLY_TOPBAR_ROW_PUBLIC,
} from "./dupplyTopbar.styles";

type PublicHeaderProps = {
  className?: string;
};

export function PublicHeader({ className }: Readonly<PublicHeaderProps>) {
  return (
    <header className={cn(DUPPLY_TOPBAR_HEADER, className)}>
      <div className={DUPPLY_TOPBAR_ROW_PUBLIC}>
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <img src="/dupply-logo.png" alt="Dupply" className="h-8 w-8 object-contain" />
          <span className={DUPPLY_TOPBAR_LOGO_TEXT}>Dupply</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* <ModeToggle className={DUPPLY_TOPBAR_MODE_TOGGLE} /> */}
          <Button variant="ghost" size="sm" asChild className={DUPPLY_TOPBAR_GHOST_LINK}>
            <Link to={ROUTES.login}>Entrar</Link>
          </Button>
          <Button size="sm" asChild className={DUPPLY_TOPBAR_PRIMARY_CTA}>
            <Link to={ROUTES.login}>Entrar no protótipo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
