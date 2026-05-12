import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { ROUTES } from "@/lib/routes";

export function PublicHeader() {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to={ROUTES.home} className="flex items-center gap-2">
          <img src="/dupply-logo.png" alt="Dupply" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-foreground">Dupply</span>
        </Link>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to={ROUTES.login}>Entrar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={ROUTES.login}>Entrar no protótipo</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
