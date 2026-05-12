import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileLabel } from "@/domain/auth/auth.helpers";
import { ROUTES } from "@/lib/routes";

export function Header() {
  const { user, selectedProfile, logout } = useAuth();

  return (
    <header className="flex h-14 items-center gap-2 border-b border-border/50 bg-card/60 backdrop-blur-sm px-4 sticky top-0 z-30">
      <SidebarTrigger className="shrink-0" />
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        {selectedProfile && (
          <Badge variant="secondary" className="hidden sm:flex">
            {getProfileLabel(selectedProfile)}
          </Badge>
        )}
        {user && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="size-4" />
            <span className="hidden sm:block">{user.name}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={logout}
          asChild={false}
          title="Sair"
        >
          <Link to={ROUTES.home} onClick={logout}>
            <LogOut className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
