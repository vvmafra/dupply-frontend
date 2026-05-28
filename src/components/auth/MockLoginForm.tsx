import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSeller } from "@/contexts/SellerContext";
import { authLoginSchema } from "@/domain/auth/auth-login.schema";
import { getProfileRedirect } from "@/domain/auth/auth.helpers";
import { getAvailableProfiles, MOCK_DEMO_PROFILES, shouldAutoSelectProfile } from "@/domain/auth/auth-profiles";
import {
  getPostLoginSellerDestination,
  INACTIVE_SELLER_REJECTION_MESSAGE,
} from "@/domain/seller/seller-registration.routing";
import { resolveApiMode } from "@/lib/env";
import { ROUTES } from "@/lib/routes";
import { login as loginFromService, logout as logoutFromService } from "@/services/auth.service";

type LocationState = {
  from?: { pathname: string };
};

export function MockLoginForm() {
  const [email, setEmail] = useState("demo@dupply.com.br");
  const [password, setPassword] = useState("Dupply@Demo2026!");
  const [loading, setLoading] = useState(false);
  const { loginWithSession, setProfile } = useAuth();
  const { refreshSeller } = useSeller();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = authLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }

    setLoading(true);

    const result = await loginFromService(parsed.data.email, parsed.data.password);

    if (!result.ok) {
      toast.error(result.message);
      setLoading(false);
      return;
    }

    const profiles =
      resolveApiMode() === "mock"
        ? MOCK_DEMO_PROFILES
        : getAvailableProfiles(result.session.user.platformRole);
    const autoProfile = shouldAutoSelectProfile(profiles);
    const fromPath = locationState?.from?.pathname;

    if (autoProfile === "seller" && resolveApiMode() === "http") {
      loginWithSession(result.session);
      setProfile(autoProfile);

      const status = await refreshSeller();

      if (status === "inactive") {
        await logoutFromService();
        toast.error(INACTIVE_SELLER_REJECTION_MESSAGE);
        setLoading(false);
        return;
      }

      if (!status) {
        toast.error("Não foi possível validar seu cadastro. Tentando novamente...");
        navigate(fromPath ?? ROUTES.seller.dashboard, { replace: true });
        setLoading(false);
        return;
      }

      const dest = getPostLoginSellerDestination(status);
      navigate(fromPath && status !== "created" ? fromPath : dest, { replace: true });
      setLoading(false);
      return;
    }

    loginWithSession(result.session);

    if (autoProfile) {
      setProfile(autoProfile);
      navigate(fromPath ?? getProfileRedirect(autoProfile), { replace: true });
    } else {
      navigate(ROUTES.selectProfile, {
        replace: true,
        state: locationState?.from ? { from: locationState.from } : undefined,
      });
    }

    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <img src="/dupply-logo.png" alt="Dupply" className="h-14 w-14 object-contain" />
        </div>
        <CardTitle className="text-2xl font-bold">Dupply</CardTitle>
        <CardDescription>Acesse o protótipo de demonstração</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
          <Button type="button" variant="outline" className="w-full" asChild>
            <Link to={ROUTES.sellerRegistration}>Criar conta de cedente</Link>
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">
          Acesso demonstrativo para o protótipo
        </p>
      </CardContent>
    </Card>
  );
}
