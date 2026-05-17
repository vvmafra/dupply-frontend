import { Navigate } from "react-router-dom";
import { ProfileSelectionCard } from "@/components/auth/ProfileSelectionCard";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

export function SelectProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return (
    <PublicShell>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-5xl space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">Selecione seu perfil</h1>
            <p className="text-[#7C8594]">Escolha como deseja acessar a plataforma Dupply</p>
          </div>
          <ProfileSelectionCard />
        </div>
      </main>
    </PublicShell>
  );
}
