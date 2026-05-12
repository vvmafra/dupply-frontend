import { Navigate } from "react-router-dom";
import { MockLoginForm } from "@/components/auth/MockLoginForm";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/routes";

export function LoginPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={ROUTES.selectProfile} replace />;
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center p-4">
        <MockLoginForm />
      </main>
    </div>
  );
}
