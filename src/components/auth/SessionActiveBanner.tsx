import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileRedirect } from "@/domain/auth/auth.helpers";
import { ROUTES } from "@/lib/routes";

export function SessionActiveBanner() {
  const { user, selectedProfile, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  function handleContinue() {
    const target = selectedProfile ? getProfileRedirect(selectedProfile) : ROUTES.selectProfile;
    navigate(target, { replace: true });
  }

  function handleLogoutAndSignIn() {
    logout({ reason: "manual" });
  }

  return (
    <Alert className="mb-4">
      <AlertTitle>Sessão ativa</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>Você já está conectado como {user.email}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="sm" onClick={handleContinue}>
            Continuar
          </Button>
          <Button size="sm" variant="outline" onClick={handleLogoutAndSignIn}>
            Sair e entrar novamente
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
