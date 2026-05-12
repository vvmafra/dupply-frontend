import { Navigate } from "react-router-dom";
import { ProfileSelectionCard } from "@/components/auth/ProfileSelectionCard";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

export function SelectProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Selecione seu perfil</h1>
            <p className="text-muted-foreground">Escolha como deseja acessar a plataforma Dupply</p>
          </div>
          <ProfileSelectionCard />
        </div>
      </main>
    </div>
  );
}
