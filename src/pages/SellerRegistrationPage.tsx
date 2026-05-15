import { Link, Navigate } from "react-router-dom";
import { SellerRegistrationWizard } from "@/components/auth/SellerRegistrationWizard";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

export function SellerRegistrationPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={ROUTES.selectProfile} replace />;
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="flex flex-1 flex-col items-center gap-4 p-4 py-8">
        <SellerRegistrationWizard />
        <p className="text-sm text-muted-foreground">
          Já possui conta?{" "}
          <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </main>
    </div>
  );
}
