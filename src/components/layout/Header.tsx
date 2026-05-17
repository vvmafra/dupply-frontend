import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileLabel } from "@/domain/auth/auth.helpers";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  DUPPLY_TOPBAR_GHOST_LINK,
  DUPPLY_TOPBAR_HEADER,
  DUPPLY_TOPBAR_ROW_APP,
  DUPPLY_TOPBAR_SIDEBAR_TRIGGER,
} from "./dupplyTopbar.styles";

export function Header() {
  const { user, selectedProfile, logout } = useAuth();

  return (
    <header className={DUPPLY_TOPBAR_HEADER}>
      <div className={DUPPLY_TOPBAR_ROW_APP}>
        <SidebarTrigger className={cn("shrink-0", DUPPLY_TOPBAR_SIDEBAR_TRIGGER)} />
        <div className="min-w-0 flex-1" />
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {selectedProfile ? (
            <Badge
              variant="secondary"
              className="hidden max-w-[10rem] truncate border-white/15 bg-white/10 text-xs text-white sm:inline-flex"
            >
              {getProfileLabel(selectedProfile)}
            </Badge>
          ) : null}
          {user ? (
            <div className="hidden min-w-0 items-center gap-1.5 text-sm text-[#F4F7FB]/90 sm:flex">
              <User className="size-4 shrink-0 opacity-80" />
              <span className="truncate">{user.name}</span>
            </div>
          ) : null}
          {/* <ModeToggle className={DUPPLY_TOPBAR_MODE_TOGGLE} /> */}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(DUPPLY_TOPBAR_GHOST_LINK, "shrink-0")}
            onClick={logout}
            asChild={false}
            title="Sair"
          >
            <Link to={ROUTES.home} onClick={logout}>
              <LogOut className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
