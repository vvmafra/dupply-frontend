import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileLabel } from "@/domain/auth/auth.helpers";
import { cn } from "@/lib/utils";
import {
  DUPPLY_TOPBAR_GHOST_LINK,
  DUPPLY_TOPBAR_HEADER,
  DUPPLY_TOPBAR_ROW_APP,
  DUPPLY_TOPBAR_SIDEBAR_TRIGGER,
} from "./dupplyTopbar.styles";

interface HeaderProps {
  /** Mantém apenas o logout clicável (ex.: cadastro em análise). */
  logoutOnly?: boolean;
}

export function Header({ logoutOnly = false }: HeaderProps) {
  const { user, selectedProfile, logout } = useAuth();

  return (
    <header className={cn(DUPPLY_TOPBAR_HEADER, logoutOnly && "z-[60]")}>
      <div className={cn(DUPPLY_TOPBAR_ROW_APP, logoutOnly && "pointer-events-none")}>
        <SidebarTrigger
          className={cn("shrink-0", DUPPLY_TOPBAR_SIDEBAR_TRIGGER, logoutOnly && "opacity-40")}
          disabled={logoutOnly}
        />
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
            className={cn(DUPPLY_TOPBAR_GHOST_LINK, "shrink-0", logoutOnly && "pointer-events-auto")}
            onClick={() => logout({ reason: "manual" })}
            title="Sair"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
