import { Link, Navigate } from "react-router-dom";
import { SellerRegistrationWizard } from "@/components/auth/SellerRegistrationWizard";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

export function SellerRegistrationPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={ROUTES.selectProfile} replace />;
  }

  return (
    <PublicShell>
      <main className="flex flex-1 flex-col items-center gap-4 p-4 py-8">
        <SellerRegistrationWizard />
        <p className="text-sm text-[#7C8594]">
          Já possui conta?{" "}
          <Link to={ROUTES.login} className="font-medium text-[#7CB4FF] hover:underline">
            Entrar
          </Link>
        </p>
      </main>
    </PublicShell>
  );
}
