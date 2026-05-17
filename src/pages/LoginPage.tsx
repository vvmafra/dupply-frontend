import { Navigate } from "react-router-dom";
import { MockLoginForm } from "@/components/auth/MockLoginForm";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

export function LoginPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={ROUTES.selectProfile} replace />;
  }

  return (
    <PublicShell>
      <main className="flex flex-1 items-center justify-center p-4">
        <MockLoginForm />
      </main>
    </PublicShell>
  );
}
