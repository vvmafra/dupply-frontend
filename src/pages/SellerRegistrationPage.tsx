import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthBootstrapFallback } from "@/components/auth/AuthBootstrapFallback";
import { SellerRegistrationWizard } from "@/components/auth/SellerRegistrationWizard";
import { PublicShell } from "@/components/layout/PublicShell";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRegistrationPageRedirect,
  SellerRegistrationBlockedError,
} from "@/domain/seller/seller-registration.routing";
import { ROUTES } from "@/lib/routes";
import { loadSellerRegistrationState } from "@/services/seller-registration.service";

export function SellerRegistrationPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [gate, setGate] = useState<"loading" | "wizard" | "redirect">("loading");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setGate("wizard");
      return;
    }
    void (async () => {
      try {
        const { status } = await loadSellerRegistrationState();
        const dest = getRegistrationPageRedirect(true, status);
        if (dest) {
          setRedirectTo(dest);
          setGate("redirect");
        } else {
          setGate("wizard");
        }
      } catch (err) {
        if (err instanceof SellerRegistrationBlockedError) {
          logout();
          toast.error(err.message);
        }
        setGate("wizard");
      }
    })();
  }, [isAuthenticated, isLoading, logout]);

  if (gate === "loading") {
    return <AuthBootstrapFallback />;
  }

  if (gate === "redirect" && redirectTo) {
    return <Navigate to={redirectTo} replace />;
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
